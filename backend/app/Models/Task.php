<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Task extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'title',
        'description',
        'status',
        'priority',
        'category',
        'tags',
        'start_date',
        'due_date',
        'progress',
        'task_type', // 'quick' or 'detailed'
        'subtasks', // JSON array of subtasks
    ];

    protected $casts = [
        'tags' => 'array',
        'subtasks' => 'array',
        'start_date' => 'datetime',
        'due_date' => 'datetime',
        'progress' => 'integer',
    ];

    /**
     * User who created this task
     */
    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * Alias for owner() - User who created this task
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * Users assigned to this task
     */
    public function assignedUsers(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'task_assignments', 'task_id', 'user_id')
            ->whereNull('task_assignments.subtask_id')
            ->withPivot('role', 'assigned_by', 'created_at')
            ->withTimestamps();
    }

    /**
     * All task assignments (including subtasks)
     */
    public function assignments(): HasMany
    {
        return $this->hasMany(TaskAssignment::class);
    }

    /**
     * Assignments for specific subtask
     */
    public function subtaskAssignments($subtaskId): HasMany
    {
        return $this->hasMany(TaskAssignment::class)->where('subtask_id', $subtaskId);
    }
}
