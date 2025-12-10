<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Friendship;
use App\Models\Notification;
use App\Http\Controllers\SocketController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class FriendController extends Controller
{
    protected $socketController;

    public function __construct()
    {
        $this->socketController = new SocketController();
    }

    /**
     * Tìm kiếm users
     */
    public function search(Request $request)
    {
        $request->validate([
            'query' => 'nullable|string|max:255',
        ]);

        $user = $request->user();
        $query = $request->input('query', '');

        // Lấy danh sách user IDs đã là bạn hoặc đã gửi/nhận lời mời
        $excludedIds = DB::table('friendships')
            ->where(function ($q) use ($user) {
                $q->where('user_id', $user->id)
                  ->orWhere('friend_id', $user->id);
            })
            ->pluck('user_id', 'friend_id')
            ->flatten()
            ->unique()
            ->toArray();
        
        $excludedIds[] = $user->id; // Loại trừ chính mình

        $users = User::whereNotIn('id', $excludedIds)
            ->when($query, function ($q) use ($query) {
                $q->where(function ($queryBuilder) use ($query) {
                    $queryBuilder->where('name', 'like', "%{$query}%")
                                 ->orWhere('email', 'like', "%{$query}%");
                });
            })
            ->select('id', 'name', 'email', 'avatar')
            ->limit(20)
            ->get();

        return response()->json([
            'users' => $users,
        ]);
    }

    /**
     * Gửi lời mời kết bạn
     */
    public function sendRequest(Request $request)
    {
        try {
            $request->validate([
                'friend_id' => 'required|integer|exists:users,id',
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'message' => 'Dữ liệu không hợp lệ',
                'errors' => $e->errors(),
            ], 422);
        }

        $user = $request->user();
        $friendId = (int) $request->input('friend_id');

        // Không thể gửi lời mời cho chính mình
        if ($user->id === $friendId) {
            return response()->json([
                'message' => 'Không thể gửi lời mời kết bạn cho chính mình',
            ], 400);
        }

        // Kiểm tra đã có friendship chưa
        $existingFriendship = Friendship::where(function ($q) use ($user, $friendId) {
            $q->where('user_id', $user->id)
              ->where('friend_id', $friendId);
        })->orWhere(function ($q) use ($user, $friendId) {
            $q->where('user_id', $friendId)
              ->where('friend_id', $user->id);
        })->first();

        if ($existingFriendship) {
            if ($existingFriendship->status === 'accepted') {
                return response()->json([
                    'message' => 'Đã là bạn bè',
                ], 400);
            } elseif ($existingFriendship->status === 'pending') {
                return response()->json([
                    'message' => 'Lời mời đã được gửi',
                ], 400);
            }
        }

        // Tạo friendship request
        try {
            $friendship = Friendship::create([
                'user_id' => $user->id,
                'friend_id' => $friendId,
                'status' => 'pending',
            ]);
        } catch (\Illuminate\Database\QueryException $e) {
            // Xử lý lỗi unique constraint
            if ($e->getCode() === '23000') {
                return response()->json([
                    'message' => 'Lời mời đã được gửi trước đó',
                ], 400);
            }
            Log::error('Failed to create friendship: ' . $e->getMessage());
            return response()->json([
                'message' => 'Không thể tạo lời mời kết bạn',
            ], 500);
        }

        // Lưu notification vào database
        try {
            $notificationData = [
                'friendship_id' => $friendship->id,
                'from_user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'avatar' => $user->avatar,
                ],
            ];

            Notification::create([
                'user_id' => $friendId,
                'type' => 'friend_request',
                'title' => 'Lời mời kết bạn',
                'message' => "{$user->name} đã gửi lời mời kết bạn",
                'data' => $notificationData,
                'read' => false,
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to save friend request notification: ' . $e->getMessage());
        }

        // Gửi notification qua socket
        try {
            $this->socketController->sendNotification($friendId, [
                'type' => 'friend_request',
                'title' => 'Lời mời kết bạn',
                'message' => "{$user->name} đã gửi lời mời kết bạn",
                'data' => $notificationData,
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to send friend request notification: ' . $e->getMessage());
        }

        return response()->json([
            'message' => 'Đã gửi lời mời kết bạn',
            'friendship' => $friendship,
        ], 201);
    }

    /**
     * Chấp nhận lời mời kết bạn
     */
    public function acceptRequest(Request $request, $id)
    {
        $user = $request->user();

        $friendship = Friendship::where('id', $id)
            ->where('friend_id', $user->id)
            ->where('status', 'pending')
            ->firstOrFail();

        $friendship->update([
            'status' => 'accepted',
            'accepted_at' => now(),
        ]);

        // Lưu notification vào database cho người gửi
        try {
            $notificationData = [
                'friendship_id' => $friendship->id,
                'accepted_user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'avatar' => $user->avatar,
                ],
            ];

            Notification::create([
                'user_id' => $friendship->user_id,
                'type' => 'friend_request_accepted',
                'title' => 'Lời mời kết bạn đã được chấp nhận',
                'message' => "{$user->name} đã chấp nhận lời mời kết bạn",
                'data' => $notificationData,
                'read' => false,
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to save acceptance notification: ' . $e->getMessage());
        }

        // Gửi notification qua socket cho người gửi
        try {
            $this->socketController->sendNotification($friendship->user_id, [
                'type' => 'friend_request_accepted',
                'title' => 'Lời mời kết bạn đã được chấp nhận',
                'message' => "{$user->name} đã chấp nhận lời mời kết bạn",
                'data' => $notificationData,
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to send acceptance notification: ' . $e->getMessage());
        }

        return response()->json([
            'message' => 'Đã chấp nhận lời mời kết bạn',
            'friendship' => $friendship,
        ]);
    }

    /**
     * Từ chối lời mời kết bạn
     */
    public function rejectRequest(Request $request, $id)
    {
        $user = $request->user();

        $friendship = Friendship::where('id', $id)
            ->where('friend_id', $user->id)
            ->where('status', 'pending')
            ->firstOrFail();

        $friendship->update([
            'status' => 'rejected',
        ]);

        return response()->json([
            'message' => 'Đã từ chối lời mời kết bạn',
        ]);
    }

    /**
     * Lấy danh sách bạn bè
     */
    public function getFriends(Request $request)
    {
        $user = $request->user();

        $friendships = Friendship::where(function ($q) use ($user) {
            $q->where('user_id', $user->id)
              ->orWhere('friend_id', $user->id);
        })
        ->where('status', 'accepted')
        ->with(['user', 'friend'])
        ->get();

        $friends = $friendships->map(function ($friendship) use ($user) {
            $friend = $friendship->user_id === $user->id 
                ? $friendship->friend 
                : $friendship->user;
            
            return [
                'id' => $friend->id,
                'name' => $friend->name,
                'email' => $friend->email,
                'avatar' => $friend->avatar,
            ];
        });

        return response()->json([
            'friends' => $friends,
        ]);
    }

    /**
     * Lấy danh sách lời mời kết bạn (đã nhận)
     */
    public function getFriendRequests(Request $request)
    {
        $user = $request->user();

        $requests = Friendship::where('friend_id', $user->id)
            ->where('status', 'pending')
            ->with('user:id,name,email,avatar')
            ->get()
            ->map(function ($friendship) {
                return [
                    'id' => $friendship->id,
                    'user' => [
                        'id' => $friendship->user->id,
                        'name' => $friendship->user->name,
                        'email' => $friendship->user->email,
                        'avatar' => $friendship->user->avatar,
                    ],
                    'created_at' => $friendship->created_at,
                ];
            });

        return response()->json([
            'requests' => $requests,
        ]);
    }

    /**
     * Hủy lời mời kết bạn (đã gửi)
     */
    public function cancelRequest(Request $request, $id)
    {
        $user = $request->user();

        $friendship = Friendship::where('id', $id)
            ->where('user_id', $user->id)
            ->where('status', 'pending')
            ->firstOrFail();

        $friendship->delete();

        return response()->json([
            'message' => 'Đã hủy lời mời kết bạn',
        ]);
    }

    /**
     * Hủy kết bạn
     */
    public function unfriend(Request $request, $friendId)
    {
        $user = $request->user();

        $friendship = Friendship::where(function ($q) use ($user, $friendId) {
            $q->where('user_id', $user->id)
              ->where('friend_id', $friendId);
        })->orWhere(function ($q) use ($user, $friendId) {
            $q->where('user_id', $friendId)
              ->where('friend_id', $user->id);
        })
        ->where('status', 'accepted')
        ->firstOrFail();

        $friendship->delete();

        return response()->json([
            'message' => 'Đã hủy kết bạn',
        ]);
    }
}

