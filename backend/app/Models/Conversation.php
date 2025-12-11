<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Conversation extends Model
{
    use HasFactory;

    protected $fillable = [
        'user1_id',
        'user2_id',
        'last_message_at',
    ];

    protected $casts = [
        'last_message_at' => 'datetime',
    ];

    /**
     * Get the first user in the conversation
     */
    public function user1(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user1_id');
    }

    /**
     * Get the second user in the conversation
     */
    public function user2(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user2_id');
    }

    /**
     * Get all messages in this conversation
     */
    public function messages(): HasMany
    {
        return $this->hasMany(Message::class)->orderBy('created_at', 'asc');
    }

    /**
     * Get the other user in the conversation (not the current user)
     */
    public function getOtherUser($currentUserId)
    {
        if ($this->user1_id == $currentUserId) {
            return $this->user2;
        }
        return $this->user1;
    }

    /**
     * Get unread messages count for a user
     */
    public function getUnreadCount($userId)
    {
        return $this->messages()
            ->where('sender_id', '!=', $userId)
            ->where('read', false)
            ->count();
    }

    /**
     * Get last message
     */
    public function getLastMessage()
    {
        return $this->messages()->latest()->first();
    }
}

