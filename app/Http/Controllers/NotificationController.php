<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class NotificationController extends Controller
{
    // Send a notification (only admins can access this)
    public function sendNotification(Request $request)
    {
        // Validate the request
        $validator = Validator::make($request->all(), [
            'to' => 'required|string',
            'title' => 'required|string',
            'description' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => 'Validation failed', 'errors' => $validator->errors()], 400);
        }

        try {
            // Create the notification
            $notification = Notification::create([
                'to' => $request->to,
                'title' => $request->title,
                'description' => $request->description,
            ]);

            // Send email 
            $this->sendEmail($request->to, $request->title, $request->description);

            return response()->json(['message' => 'Notification sent successfully!', 'notification' => $notification], 201);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Failed to send notification.', 'error' => $e->getMessage()], 500);
        }
    }

    // Get notifications for a user
    public function getNotifications($email)
    {
        try {
            // Fetch notifications for the user or general notifications (to: 'all')
            $notifications = Notification::where('to', $email)
                ->orWhere('to', 'all')
                ->orderBy('created_at', 'desc')
                ->get();

            if ($notifications->isEmpty()) {
                return response()->json(['message' => 'No notifications found.'], 404);
            }

            return response()->json(['message' => 'Notifications retrieved successfully.', 'notifications' => $notifications], 200);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Failed to fetch notifications.', 'error' => $e->getMessage()], 500);
        }
    }

    // Send email function
    private function sendEmail($to, $title, $description)
    {
        // Implement email sending logic here
        \Log::info("Email sent to: $to, Title: $title, Description: $description");
    }
}