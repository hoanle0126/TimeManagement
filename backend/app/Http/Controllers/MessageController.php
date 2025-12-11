<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Conversation;
use App\Models\Message;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use App\Http\Controllers\SocketController;

class MessageController extends Controller
{
    protected $socketController;

    public function __construct()
    {
        $this->socketController = new SocketController();
    }

    /**
     * Get all conversations for the authenticated user
     */
    public function getConversations(Request $request)
    {
        $user = $request->user();

        // Get conversations where user is user1 or user2
        $conversations = Conversation::where('user1_id', $user->id)
            ->orWhere('user2_id', $user->id)
            ->with(['user1', 'user2', 'messages' => function($query) {
                $query->latest()->limit(1);
            }])
            ->orderBy('last_message_at', 'desc')
            ->get();

        $formattedConversations = $conversations->map(function($conv) use ($user) {
            $otherUser = $conv->getOtherUser($user->id);
            $lastMessage = $conv->getLastMessage();
            $unreadCount = $conv->getUnreadCount($user->id);

            return [
                'id' => $conv->id,
                'name' => $otherUser->name,
                'participant' => [
                    'id' => $otherUser->id,
                    'name' => $otherUser->name,
                    'email' => $otherUser->email,
                    'avatar' => $otherUser->avatar,
                ],
                'friend_id' => $otherUser->id,
                'last_message' => $lastMessage ? $lastMessage->message : null,
                'last_message_at' => $lastMessage ? $lastMessage->created_at->toISOString() : $conv->last_message_at?->toISOString(),
                'unread' => $unreadCount > 0,
                'unread_count' => $unreadCount,
                'created_at' => $conv->created_at->toISOString(),
                'updated_at' => $conv->updated_at->toISOString(),
            ];
        });

        return response()->json([
            'success' => true,
            'conversations' => $formattedConversations,
        ]);
    }

    /**
     * Create a new conversation
     */
    public function createConversation(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'recipient_id' => 'required|exists:users,id',
        ]);

        $recipientId = $validated['recipient_id'];

        // Check if conversation already exists
        $existingConversation = Conversation::where(function($query) use ($user, $recipientId) {
            $query->where('user1_id', $user->id)
                  ->where('user2_id', $recipientId);
        })->orWhere(function($query) use ($user, $recipientId) {
            $query->where('user1_id', $recipientId)
                  ->where('user2_id', $user->id);
        })->first();

        if ($existingConversation) {
            $otherUser = $existingConversation->getOtherUser($user->id);
            $lastMessage = $existingConversation->getLastMessage();
            $unreadCount = $existingConversation->getUnreadCount($user->id);

            return response()->json([
                'success' => true,
                'conversation' => [
                    'id' => $existingConversation->id,
                    'name' => $otherUser->name,
                    'participant' => [
                        'id' => $otherUser->id,
                        'name' => $otherUser->name,
                        'email' => $otherUser->email,
                        'avatar' => $otherUser->avatar,
                    ],
                    'friend_id' => $otherUser->id,
                    'last_message' => $lastMessage ? $lastMessage->message : null,
                    'last_message_at' => $lastMessage ? $lastMessage->created_at->toISOString() : null,
                    'unread' => $unreadCount > 0,
                    'unread_count' => $unreadCount,
                ],
            ]);
        }

        // Create new conversation
        $conversation = Conversation::create([
            'user1_id' => $user->id,
            'user2_id' => $recipientId,
        ]);

        $otherUser = $conversation->getOtherUser($user->id);

        return response()->json([
            'success' => true,
            'conversation' => [
                'id' => $conversation->id,
                'name' => $otherUser->name,
                'participant' => [
                    'id' => $otherUser->id,
                    'name' => $otherUser->name,
                    'email' => $otherUser->email,
                    'avatar' => $otherUser->avatar,
                ],
                'friend_id' => $otherUser->id,
                'last_message' => null,
                'last_message_at' => null,
                'unread' => false,
                'unread_count' => 0,
            ],
        ], 201);
    }

    /**
     * Get messages for a conversation
     */
    public function getMessages(Request $request, $conversationId)
    {
        $user = $request->user();

        // Verify user is part of this conversation
        $conversation = Conversation::where('id', $conversationId)
            ->where(function($query) use ($user) {
                $query->where('user1_id', $user->id)
                      ->orWhere('user2_id', $user->id);
            })
            ->first();

        if (!$conversation) {
            return response()->json([
                'success' => false,
                'message' => 'Conversation not found or you do not have permission',
            ], 404);
        }

        $messages = Message::where('conversation_id', $conversationId)
            ->with('sender')
            ->orderBy('created_at', 'asc')
            ->get();

        $formattedMessages = $messages->map(function($msg) use ($user) {
            return [
                'id' => $msg->id,
                'conversation_id' => $msg->conversation_id,
                'sender_id' => $msg->sender_id,
                'sender' => $msg->sender_id === $user->id ? 'me' : 'other',
                'message' => $msg->message,
                'text' => $msg->message, // Alias for compatibility
                'read' => $msg->read,
                'read_at' => $msg->read_at?->toISOString(),
                'created_at' => $msg->created_at->toISOString(),
                'updated_at' => $msg->updated_at->toISOString(),
                'timestamp' => $msg->created_at->format('H:i'), // For compatibility
            ];
        });

        // Mark messages as read
        Message::where('conversation_id', $conversationId)
            ->where('sender_id', '!=', $user->id)
            ->where('read', false)
            ->update([
                'read' => true,
                'read_at' => now(),
            ]);

        return response()->json([
            'success' => true,
            'messages' => $formattedMessages,
        ]);
    }

    /**
     * Send a message
     */
    public function sendMessage(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'conversation_id' => 'nullable|exists:conversations,id',
            'recipient_id' => 'required_without:conversation_id|exists:users,id',
            'message' => 'required|string|max:5000',
        ]);

        // Get or create conversation
        $conversationId = $validated['conversation_id'] ?? null;
        
        if (!$conversationId) {
            // Create conversation if it doesn't exist
            $recipientId = $validated['recipient_id'];
            $conversation = Conversation::where(function($query) use ($user, $recipientId) {
                $query->where('user1_id', $user->id)
                      ->where('user2_id', $recipientId);
            })->orWhere(function($query) use ($user, $recipientId) {
                $query->where('user1_id', $recipientId)
                      ->where('user2_id', $user->id);
            })->first();

            if (!$conversation) {
                $conversation = Conversation::create([
                    'user1_id' => $user->id,
                    'user2_id' => $recipientId,
                ]);
            }
            $conversationId = $conversation->id;
        }

        // Verify user is part of this conversation
        $conversation = Conversation::where('id', $conversationId)
            ->where(function($query) use ($user) {
                $query->where('user1_id', $user->id)
                      ->orWhere('user2_id', $user->id);
            })
            ->first();

        if (!$conversation) {
            return response()->json([
                'success' => false,
                'message' => 'Conversation not found or you do not have permission',
            ], 404);
        }

        // Create message
        $message = Message::create([
            'conversation_id' => $conversationId,
            'sender_id' => $user->id,
            'message' => $validated['message'],
        ]);

        // Update conversation last_message_at
        $conversation->update([
            'last_message_at' => now(),
        ]);

        // Get recipient
        $recipient = $conversation->getOtherUser($user->id);

        // Broadcast message via socket
        try {
            $this->socketController->sendNotification($recipient->id, [
                'type' => 'message',
                'title' => 'Tin nhắn mới',
                'message' => "{$user->name}: {$validated['message']}",
                'data' => [
                    'conversation_id' => $conversationId,
                    'message_id' => $message->id,
                    'sender' => [
                        'id' => $user->id,
                        'name' => $user->name,
                        'email' => $user->email,
                    ],
                ],
            ]);

            // Emit to socket room
            $this->socketController->broadcast(new Request([
                'event' => 'message:received',
                'data' => [
                    'id' => $message->id,
                    'conversation_id' => $conversationId,
                    'sender_id' => $user->id,
                    'message' => $validated['message'],
                    'created_at' => $message->created_at->toISOString(),
                ],
                'room' => "conversation:{$conversationId}",
            ]));
        } catch (\Exception $e) {
            Log::error('Failed to broadcast message: ' . $e->getMessage());
        }

        return response()->json([
            'success' => true,
            'message' => [
                'id' => $message->id,
                'conversation_id' => $message->conversation_id,
                'sender_id' => $message->sender_id,
                'sender' => 'me',
                'message' => $message->message,
                'text' => $message->message,
                'read' => false,
                'created_at' => $message->created_at->toISOString(),
                'updated_at' => $message->updated_at->toISOString(),
                'timestamp' => $message->created_at->format('H:i'),
            ],
        ], 201);
    }
}

