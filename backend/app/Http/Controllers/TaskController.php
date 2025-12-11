<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Task;
use App\Models\TaskAssignment;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
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
    public function index(Request $request)
    {
        $user = $request->user();
        
        // Base query - get tasks where user is owner or assigned
        $query = Task::where(function($q) use ($user) {
            $q->where('user_id', $user->id)
              ->orWhereHas('assignments', function($assignmentQuery) use ($user) {
                  $assignmentQuery->where('user_id', $user->id);
              });
        })
        ->with(['assignedUsers', 'assignments.user', 'user'])
        ->orderBy('created_at', 'desc');
        
        // Filter by status
        if ($request->has('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }
        
        // Filter by priority
        if ($request->has('priority')) {
            $query->where('priority', $request->priority);
        }
        
        // Filter by category
        if ($request->has('category')) {
            $query->where('category', $request->category);
        }
        
        // Filter by task_type
        if ($request->has('task_type')) {
            $query->where('task_type', $request->task_type);
        }
        
        // Filter by due_date (today, upcoming, overdue)
        if ($request->has('due_date')) {
            $dueDateParam = $request->due_date;
            $isToday = $dueDateParam === 'today' || $dueDateParam === today()->toDateString();
            
            if ($isToday) {
                // For "today" filter, show:
                // 1. Tasks with due_date = today
                // 2. Tasks without due_date that are not completed
                // 3. Tasks created today that are not completed
                $query->where(function($q) {
                    $q->whereDate('due_date', today())
                      ->orWhere(function($q2) {
                          $q2->whereNull('due_date')
                             ->whereIn('status', ['pending', 'in_progress']);
                      })
                      ->orWhere(function($q3) {
                          $q3->whereDate('created_at', today())
                             ->whereIn('status', ['pending', 'in_progress']);
                      });
                });
            } elseif ($dueDateParam === 'upcoming') {
                $query->whereDate('due_date', '>', today());
            } elseif ($dueDateParam === 'overdue') {
                $query->whereDate('due_date', '<', today())
                      ->where('status', '!=', 'completed');
            } else {
                // Specific date - only filter by due_date
                $query->whereDate('due_date', $dueDateParam);
            }
        }
        
        // Search by title or description
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }
        
        // Sort
        if ($request->has('sort')) {
            $sortField = $request->sort;
            $sortDirection = $request->get('direction', 'desc');
            
            if (in_array($sortField, ['created_at', 'updated_at', 'due_date', 'priority', 'status'])) {
                $query->orderBy($sortField, $sortDirection);
            }
        }
        
        // Pagination
        $perPage = $request->get('per_page', 15);
        $tasks = $query->paginate($perPage);
        
        // Format response - get items from paginator and convert to array
        $formattedTasks = collect($tasks->items())->map(function($task) {
            return $this->formatTask($task);
        })->values()->toArray();
        
        return response()->json([
            'success' => true,
            'tasks' => $formattedTasks,
            'pagination' => [
                'current_page' => $tasks->currentPage(),
                'last_page' => $tasks->lastPage(),
                'per_page' => $tasks->perPage(),
                'total' => $tasks->total(),
            ],
        ]);
    }
    
    /**
     * Format task for API response
     */
    protected function formatTask($task)
    {
        $formatted = [
            'id' => $task->id,
            'title' => $task->title,
            'description' => $task->description,
            'status' => $task->status,
            'priority' => $task->priority,
            'category' => $task->category,
            'tags' => $task->tags ?? [],
            'start_date' => $task->start_date ? $task->start_date->toISOString() : null,
            'due_date' => $task->due_date ? $task->due_date->toISOString() : null,
            'deadline' => $task->due_date ? $task->due_date->toISOString() : null, // For quick tasks
            'progress' => $task->progress ?? 0,
            'task_type' => $task->task_type ?? 'detailed',
            'taskType' => $task->task_type ?? 'detailed', // Alias for frontend
            'subtasks' => $task->subtasks ?? [],
            'created_at' => $task->created_at->toISOString(),
            'updated_at' => $task->updated_at->toISOString(),
            'user_id' => $task->user_id,
        ];
        
        // Add assigned users
        $assignedUsers = [];
        $assignments = $task->assignments ?? $task->assignments()->get();
        
        foreach ($assignments as $assignment) {
            if ($assignment->subtask_id === null && $assignment->user) {
                $assignedUsers[] = [
                    'user_id' => $assignment->user->id,
                    'name' => $assignment->user->name,
                    'email' => $assignment->user->email,
                ];
            }
        }
        
        $formatted['assignedUsers'] = $assignedUsers;
        
        // Add assigned users for subtasks
        if (isset($task->subtasks) && is_array($task->subtasks)) {
            foreach ($task->subtasks as $index => &$subtask) {
                $subtaskAssignedUsers = [];
                foreach ($assignments as $assignment) {
                    if ($assignment->subtask_id === (string)$index && $assignment->user) {
                        $subtaskAssignedUsers[] = [
                            'user_id' => $assignment->user->id,
                            'name' => $assignment->user->name,
                            'email' => $assignment->user->email,
                        ];
                    }
                }
                $subtask['assignedUsers'] = $subtaskAssignedUsers;
            }
            $formatted['subtasks'] = $task->subtasks;
        }
        
        return $formatted;
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $user = $request->user();
        
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'status' => 'nullable|in:pending,in_progress,completed,cancelled',
            'priority' => 'nullable|in:low,medium,high',
            'category' => 'nullable|string|max:255',
            'tags' => 'nullable|array',
            'start_date' => 'nullable|date',
            'due_date' => 'nullable|date|after_or_equal:start_date',
            'progress' => 'nullable|integer|min:0|max:100',
            'task_type' => 'nullable|in:quick,detailed',
            'assigned_users' => 'nullable|array',
            'assigned_users.*.user_id' => 'nullable|exists:users,id',
            'assigned_users.*.email' => 'nullable|email',
            'subtasks' => 'nullable|array',
            'subtasks.*.assigned_users' => 'nullable|array',
        ]);

        // Tạo task
        $task = Task::create([
            'user_id' => $user->id,
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'status' => $validated['status'] ?? 'pending',
            'priority' => $validated['priority'] ?? 'medium',
            'category' => $validated['category'] ?? null,
            'tags' => $validated['tags'] ?? [],
            'start_date' => $validated['start_date'] ?? null,
            'due_date' => $validated['due_date'] ?? null,
            'progress' => $validated['progress'] ?? 0,
            'task_type' => $validated['task_type'] ?? 'detailed',
        ]);

        // Assign users to task
        if (isset($validated['assigned_users'])) {
            $this->assignUsersToTask($task, $validated['assigned_users'], $user->id);
        }

        // Handle subtasks with assignments
        if (isset($validated['subtasks']) && is_array($validated['subtasks'])) {
            foreach ($validated['subtasks'] as $index => $subtask) {
                if (isset($subtask['assigned_users'])) {
                    $this->assignUsersToSubtask($task, $index, $subtask['assigned_users'], $user->id);
                }
            }
        }

        // Broadcast notification to assigned users
        $this->notifyAssignedUsers($task, $user);

        return response()->json([
            'message' => 'Task created successfully',
            'task' => $task->load(['assignedUsers', 'assignments.user']),
        ], 201);
    }

    /**
     * Assign users to task
     */
    protected function assignUsersToTask($task, $assignedUsers, $assignedBy)
    {
        foreach ($assignedUsers as $assignment) {
            $userId = null;

            // Nếu có user_id, dùng trực tiếp
            if (isset($assignment['user_id'])) {
                $userId = $assignment['user_id'];
            }
            // Nếu có email, tìm user theo email
            elseif (isset($assignment['email'])) {
                $user = User::where('email', $assignment['email'])->first();
                if ($user) {
                    $userId = $user->id;
                } else {
                    // Tạo notification cho email chưa có account (optional)
                    Log::info("User with email {$assignment['email']} not found");
                    continue;
                }
            }

            if ($userId && $userId != $assignedBy) {
                TaskAssignment::create([
                    'task_id' => $task->id,
                    'user_id' => $userId,
                    'assigned_by' => $assignedBy,
                    'subtask_id' => null,
                    'role' => $assignment['role'] ?? 'assignee',
                ]);
            }
        }
    }

    /**
     * Assign users to subtask
     */
    protected function assignUsersToSubtask($task, $subtaskIndex, $assignedUsers, $assignedBy)
    {
        foreach ($assignedUsers as $assignment) {
            $userId = null;

            if (isset($assignment['user_id'])) {
                $userId = $assignment['user_id'];
            } elseif (isset($assignment['email'])) {
                $user = User::where('email', $assignment['email'])->first();
                if ($user) {
                    $userId = $user->id;
                } else {
                    continue;
                }
            }

            if ($userId && $userId != $assignedBy) {
                TaskAssignment::create([
                    'task_id' => $task->id,
                    'user_id' => $userId,
                    'assigned_by' => $assignedBy,
                    'subtask_id' => (string)$subtaskIndex,
                    'role' => $assignment['role'] ?? 'assignee',
                ]);
            }
        }
    }

    /**
     * Notify assigned users
     */
    protected function notifyAssignedUsers($task, $assignedBy)
    {
        $assignments = TaskAssignment::where('task_id', $task->id)
            ->whereNull('subtask_id')
            ->get();

        foreach ($assignments as $assignment) {
            try {
                $this->socketController->sendNotification($assignment->user_id, [
                    'type' => 'task_assigned',
                    'title' => 'Bạn được giao task mới',
                    'message' => "{$assignedBy->name} đã giao task \"{$task->title}\" cho bạn",
                    'data' => [
                        'task_id' => $task->id,
                        'task_title' => $task->title,
                        'assigned_by' => [
                            'id' => $assignedBy->id,
                            'name' => $assignedBy->name,
                            'email' => $assignedBy->email,
                        ],
                    ],
                ]);

                // Lưu notification vào database
                \App\Models\Notification::create([
                    'user_id' => $assignment->user_id,
                    'type' => 'task_assigned',
                    'title' => 'Bạn được giao task mới',
                    'message' => "{$assignedBy->name} đã giao task \"{$task->title}\" cho bạn",
                    'data' => [
                        'task_id' => $task->id,
                        'task_title' => $task->title,
                        'assigned_by' => [
                            'id' => $assignedBy->id,
                            'name' => $assignedBy->name,
                            'email' => $assignedBy->email,
                        ],
                    ],
                    'read' => false,
                ]);
            } catch (\Exception $e) {
                Log::error('Failed to notify assigned user: ' . $e->getMessage());
            }
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Request $request, string $id)
    {
        $user = $request->user();
        
        $task = Task::where('id', $id)
            ->where(function($q) use ($user) {
                $q->where('user_id', $user->id)
                  ->orWhereHas('assignments', function($assignmentQuery) use ($user) {
                      $assignmentQuery->where('user_id', $user->id);
                  });
            })
            ->with(['assignedUsers', 'assignments.user', 'user'])
            ->first();
        
        if (!$task) {
            return response()->json([
                'success' => false,
                'message' => 'Task not found or you do not have permission to view it',
            ], 404);
        }
        
        return response()->json([
            'success' => true,
            'task' => $this->formatTask($task),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $user = $request->user();
        
        $task = Task::where('id', $id)
            ->where(function($q) use ($user) {
                $q->where('user_id', $user->id)
                  ->orWhereHas('assignments', function($assignmentQuery) use ($user) {
                      $assignmentQuery->where('user_id', $user->id)
                                      ->where('role', '!=', 'viewer'); // Viewers can't edit
                  });
            })
            ->first();
        
        if (!$task) {
            return response()->json([
                'success' => false,
                'message' => 'Task not found or you do not have permission to update it',
            ], 404);
        }
        
        $validated = $request->validate([
            'title' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'status' => 'sometimes|in:pending,in_progress,completed,cancelled',
            'priority' => 'sometimes|in:low,medium,high',
            'category' => 'nullable|string|max:255',
            'tags' => 'nullable|array',
            'start_date' => 'nullable|date',
            'due_date' => 'nullable|date|after_or_equal:start_date',
            'progress' => 'nullable|integer|min:0|max:100',
            'task_type' => 'sometimes|in:quick,detailed',
            'assigned_users' => 'nullable|array',
            'subtasks' => 'nullable|array',
        ]);
        
        // Update task fields
        $task->fill($validated);
        $task->save();
        
        // Update assigned users if provided
        if (isset($validated['assigned_users'])) {
            // Remove old assignments
            TaskAssignment::where('task_id', $task->id)
                ->whereNull('subtask_id')
                ->delete();
            
            // Add new assignments
            $this->assignUsersToTask($task, $validated['assigned_users'], $user->id);
        }
        
        // Update subtasks if provided
        if (isset($validated['subtasks']) && is_array($validated['subtasks'])) {
            // Remove old subtask assignments
            TaskAssignment::where('task_id', $task->id)
                ->whereNotNull('subtask_id')
                ->delete();
            
            // Add new subtask assignments
            foreach ($validated['subtasks'] as $index => $subtask) {
                if (isset($subtask['assigned_users'])) {
                    $this->assignUsersToSubtask($task, $index, $subtask['assigned_users'], $user->id);
                }
            }
        }
        
        // Broadcast update
        $this->broadcastTaskUpdate($task->id, $this->formatTask($task->fresh(['assignedUsers', 'assignments.user', 'user'])));
        
        return response()->json([
            'success' => true,
            'message' => 'Task updated successfully',
            'task' => $this->formatTask($task->fresh(['assignedUsers', 'assignments.user', 'user'])),
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request, string $id)
    {
        $user = $request->user();
        
        $task = Task::where('id', $id)
            ->where('user_id', $user->id) // Only owner can delete
            ->first();
        
        if (!$task) {
            return response()->json([
                'success' => false,
                'message' => 'Task not found or you do not have permission to delete it',
            ], 404);
        }
        
        // Delete related assignments
        TaskAssignment::where('task_id', $task->id)->delete();
        
        // Broadcast delete event before deleting
        try {
            $this->socketController->broadcast(new Request([
                'event' => 'task:deleted',
                'data' => ['taskId' => $id],
                'room' => "task:{$id}",
            ]));
        } catch (\Exception $e) {
            Log::error('Failed to broadcast task delete: ' . $e->getMessage());
        }
        
        $task->delete();
        
        return response()->json([
            'success' => true,
            'message' => 'Task deleted successfully',
        ]);
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
