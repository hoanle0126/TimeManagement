<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('task_assignments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('task_id')->constrained('tasks')->onDelete('cascade');
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('assigned_by')->constrained('users')->onDelete('cascade');
            $table->string('subtask_id')->nullable(); // ID của subtask nếu được assign vào subtask
            $table->enum('role', ['owner', 'assignee', 'viewer'])->default('assignee');
            $table->timestamps();

            // Đảm bảo không có duplicate assignment cho cùng task/subtask
            $table->unique(['task_id', 'user_id', 'subtask_id']);
            
            // Index để query nhanh
            $table->index(['task_id', 'subtask_id']);
            $table->index(['user_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('task_assignments');
    }
};


