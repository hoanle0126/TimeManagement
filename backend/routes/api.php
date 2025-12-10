<?php

use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\Auth\RegisteredUserController;
use App\Http\Controllers\SocketController;
use App\Http\Controllers\FriendController;
use App\Http\Controllers\NotificationController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

// Public routes
// Direct routes for compatibility
Route::post('/register', [RegisteredUserController::class, 'store'])
    ->middleware('guest')
    ->name('register.direct');

Route::post('/login', [AuthenticatedSessionController::class, 'store'])
    ->middleware('guest')
    ->name('login.direct');

// Auth prefix routes
Route::prefix('auth')->group(function () {
    Route::post('/register', [RegisteredUserController::class, 'store'])
        ->middleware('guest')
        ->name('register');

    Route::post('/login', [AuthenticatedSessionController::class, 'store'])
        ->middleware('guest')
        ->name('login');
});

// Protected routes
Route::middleware(['auth:sanctum'])->group(function () {
    // Direct route for compatibility
    Route::post('/logout', [AuthenticatedSessionController::class, 'destroy'])
        ->name('logout.direct');

    Route::prefix('auth')->group(function () {
        Route::post('/logout', [AuthenticatedSessionController::class, 'destroy'])
            ->name('logout');

        Route::get('/me', function (Request $request) {
            return response()->json([
                'user' => [
                    'id' => $request->user()->id,
                    'name' => $request->user()->name,
                    'email' => $request->user()->email,
                    'avatar' => $request->user()->avatar ?? null,
                ],
            ]);
        })->name('me');
    });

    // Socket broadcast routes (admin/internal use)
    Route::post('/socket/broadcast', [SocketController::class, 'broadcast'])
        ->name('socket.broadcast');

    // Friends routes
    Route::prefix('friends')->group(function () {
        Route::get('/search', [FriendController::class, 'search'])->name('friends.search');
        Route::get('/', [FriendController::class, 'getFriends'])->name('friends.index');
        Route::get('/requests', [FriendController::class, 'getFriendRequests'])->name('friends.requests');
        Route::post('/requests', [FriendController::class, 'sendRequest'])->name('friends.send-request');
        Route::post('/requests/{id}/accept', [FriendController::class, 'acceptRequest'])->name('friends.accept');
        Route::post('/requests/{id}/reject', [FriendController::class, 'rejectRequest'])->name('friends.reject');
        Route::delete('/requests/{id}', [FriendController::class, 'cancelRequest'])->name('friends.cancel-request');
        Route::delete('/{friendId}', [FriendController::class, 'unfriend'])->name('friends.unfriend');
    });

    // Notifications routes
    Route::prefix('notifications')->group(function () {
        Route::get('/', [NotificationController::class, 'index'])->name('notifications.index');
        Route::get('/unread-count', [NotificationController::class, 'unreadCount'])->name('notifications.unread-count');
        Route::post('/{id}/read', [NotificationController::class, 'markAsRead'])->name('notifications.mark-read');
        Route::post('/mark-all-read', [NotificationController::class, 'markAllAsRead'])->name('notifications.mark-all-read');
        Route::delete('/{id}', [NotificationController::class, 'destroy'])->name('notifications.destroy');
    });
});
