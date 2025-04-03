<?php

namespace App\Http\Controllers;

use App\Models\Email;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Carbon\Carbon;

class EmailController extends Controller
{
    // Send a new email
    public function sendEmail(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'from' => 'required|email',
            'to' => 'required|email',
            'title' => 'required|string',
            'description' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 400);
        }

        try {
            $email = Email::create([
                'from' => $request->from,
                'to' => $request->to,
                'title' => $request->title,
                'description' => $request->description,
            ]);

            return response()->json([
                'message' => 'Email sent successfully!',
                'email' => $email
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to send email',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // Get emails for the logged-in user and mark as read
    public function getEmails(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 400);
        }

        try {
            $userEmail = $request->input('email');

            // First mark all unread emails as read
            Email::where('to', $userEmail)
                ->whereNull('read_at')
                ->update(['read_at' => Carbon::now()]);

            // Then fetch all emails
            $emails = Email::where('from', $userEmail)
                ->orWhere('to', $userEmail)
                ->orderBy('created_at', 'desc')
                ->get();

            if ($emails->isEmpty()) {
                return response()->json(['message' => 'No emails found.'], 404);
            }

            return response()->json([
                'message' => 'Emails retrieved successfully.',
                'emails' => $emails,
                'unread_count' => 0 // Count go back to 0 since we just marked all as read line (60-63)
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to fetch emails',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // Get unread count
    public function getUnreadCount($email)
    {
        try {
            $count = Email::where('to', $email)
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

    // Mark as read (separate endpoint if needed)
    public function markAsRead(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 400);
        }

        try {
            Email::where('to', $request->email)
                ->whereNull('read_at')
                ->update(['read_at' => Carbon::now()]);

            return response()->json([
                'message' => 'Emails marked as read'
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to mark emails as read',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}