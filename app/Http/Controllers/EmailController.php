<?php



namespace App\Http\Controllers;

use App\Models\Email;
use Illuminate\Http\Request;

class EmailController extends Controller
{
    // Send a new email
    public function sendEmail(Request $request)
    {
        $request->validate([
            'from' => 'required|email',
            'to' => 'required|email',
            'title' => 'required|string',
            'description' => 'required|string',
        ]);

        $email = Email::create([
            'from' => $request->from,
            'to' => $request->to,
            'title' => $request->title,
            'description' => $request->description,
        ]);

        return response()->json(['message' => 'Email sent successfully!', 'email' => $email], 201);
    }

    // Get emails for the logged-in user
    public function getEmails(Request $request)
    {
        $userEmail = $request->query('email'); // Get the user's email from the query parameter

        if (!$userEmail) {
            return response()->json(['message' => 'Email parameter is required.'], 400);
        }

        // Fetch emails where the user is the sender or recipient
        $emails = Email::where('from', $userEmail)
            ->orWhere('to', $userEmail)
            ->orderBy('created_at', 'desc') // Sort by newest first
            ->get();

        if ($emails->isEmpty()) {
            return response()->json(['message' => 'No emails found.'], 404);
        }

        return response()->json(['message' => 'Emails retrieved successfully.', 'emails' => $emails], 200);
    }
}