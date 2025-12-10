<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Task;
use Illuminate\Http\Request;
use App\Http\Controllers\SocketController;

class TaskController extends Controller
{
    protected $socketController;

    public function __construct()
    {
        $this->socketController = new SocketController();
    }

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        // Tạo task logic ở đây
        // Sau khi tạo, broadcast event
        // $this->socketController->broadcastTaskUpdate($task->id, $task->toArray());
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        // Update task logic ở đây
        // Sau khi update, broadcast event
        // $this->socketController->broadcastTaskUpdate($id, $task->toArray());
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        // Delete task logic ở đây
        // Sau khi delete, broadcast event
        // $this->socketController->broadcast(new Request([
        //     'event' => 'task:deleted',
        //     'data' => ['taskId' => $id],
        //     'room' => "task:{$id}",
        // ]));
    }

    /**
     * Broadcast task update helper
     */
    protected function broadcastTaskUpdate($taskId, $taskData)
    {
        try {
            $this->socketController->broadcast(new Request([
                'event' => 'task:updated',
                'data' => array_merge($taskData, ['taskId' => $taskId]),
                'room' => "task:{$taskId}",
            ]));
        } catch (\Exception $e) {
            \Log::error('Failed to broadcast task update: ' . $e->getMessage());
        }
    }
}
