<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Carbon\Carbon;

class NotificationController extends Controller
{
    // Send a notification
    public function sendNotification(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'to' => 'required|string',
            'title' => 'required|string',
            'description' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 400);
        }

        try {
            $notification = Notification::create([
                'to' => $request->to,
                'title' => $request->title,
                'description' => $request->description,
            ]);

            return response()->json([
                'message' => 'Notification sent successfully!',
                'notification' => $notification
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to send notification',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // Get notifications for a user
    public function getNotifications($email)
    {
        try {
            $notifications = Notification::where('to', $email)
                ->orWhere('to', 'all')
                ->orderBy('created_at', 'desc')
                ->get();

            return response()->json([
                'notifications' => $notifications,
                'unread_count' => $notifications->whereNull('read_at')->count()
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to fetch notifications',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // Get unread count
    public function getUnreadCount($email)
    {
        try {
            $count = Notification::where(function($query) use ($email) {
                    $query->where('to', $email)
                          ->orWhere('to', 'all');
                })
                ->whereNull('read_at')
                ->count();

            return response()->json(['count' => $count], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to get unread count',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // Mark as read
    public function markAsRead(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|string'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 400);
        }

        try {
            Notification::where('to', $request->email)
                ->orWhere('to', 'all')
                ->whereNull('read_at')
                ->update(['read_at' => Carbon::now()]);

            return response()->json([
                'message' => 'Notifications marked as read'
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to mark as read',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}