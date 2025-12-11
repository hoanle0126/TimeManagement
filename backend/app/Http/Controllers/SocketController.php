<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class SocketController extends Controller
{
    private $socketUrl;

    public function __construct()
    {
        $this->socketUrl = env('SOCKET_SERVER_URL', 'http://localhost:3001');
    }

    /**
     * Broadcast event đến Socket.io server
     */
    public function broadcast(Request $request)
    {
        $request->validate([
            'event' => 'required|string',
            'data' => 'required|array',
            'room' => 'nullable|string',
            'userId' => 'nullable|integer',
        ]);

        try {
            $response = Http::post("{$this->socketUrl}/socket/broadcast", [
                'event' => $request->event,
                'data' => $request->data,
                'room' => $request->room,
                'userId' => $request->userId,
            ]);

            if ($response->successful()) {
                return response()->json([
                    'success' => true,
                    'message' => 'Event broadcasted successfully',
                ]);
            }

            return response()->json([
                'success' => false,
                'message' => 'Failed to broadcast event',
            ], 500);
        } catch (\Exception $e) {
            Log::error('Socket broadcast error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Socket server connection error',
            ], 500);
        }
    }

    /**
     * Broadcast task update
     */
    public function broadcastTaskUpdate($taskId, $data)
    {
        return $this->broadcast(new Request([
            'event' => 'task:updated',
            'data' => $data,
            'room' => "task:{$taskId}",
        ]));
    }

    /**
     * Send notification to user
     */
    public function sendNotification($userId, $data)
    {
        return $this->broadcast(new Request([
            'event' => 'notification:received',
            'data' => $data,
            'userId' => $userId,
        ]));
    }
}

