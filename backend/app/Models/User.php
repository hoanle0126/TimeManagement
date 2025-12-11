<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'avatar',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
    ];

    /**
     * Friendships where this user is the initiator
     */
    public function friendships()
    {
        return $this->hasMany(Friendship::class, 'user_id');
    }

    /**
     * Friendships where this user is the recipient
     */
    public function friendRequests()
    {
        return $this->hasMany(Friendship::class, 'friend_id');
    }

    /**
     * Get all friends
     */
    public function friends()
    {
        $sent = $this->friendships()->where('status', 'accepted')->with('friend');
        $received = $this->friendRequests()->where('status', 'accepted')->with('user');
        
        return $sent->get()->map(fn($f) => $f->friend)
            ->merge($received->get()->map(fn($f) => $f->user));
    }

    /**
     * Notifications for this user
     */
    public function notifications()
    {
        return $this->hasMany(Notification::class);
    }

    /**
     * Unread notifications
     */
    public function unreadNotifications()
    {
        return $this->hasMany(Notification::class)->where('read', false);
    }

    /**
     * Tasks created by this user
     */
    public function tasks()
    {
        return $this->hasMany(Task::class, 'user_id');
    }

    /**
     * Tasks assigned to this user
     */
    public function assignedTasks()
    {
        return $this->belongsToMany(Task::class, 'task_assignments', 'user_id', 'task_id')
            ->whereNull('task_assignments.subtask_id')
            ->withPivot('role', 'assigned_by', 'subtask_id', 'created_at')
            ->withTimestamps();
    }

    /**
     * All task assignments for this user
     */
    public function taskAssignments()
    {
        return $this->hasMany(TaskAssignment::class, 'user_id');
    }
}
