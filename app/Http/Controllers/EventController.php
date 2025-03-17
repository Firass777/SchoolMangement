<?php

namespace App\Http\Controllers;

use App\Models\Event;
use Illuminate\Http\Request;

class EventController extends Controller
{
    // Add a new event
    public function addEvent(Request $request)
    {
        $request->validate([
            'name' => 'required|string',
            'date' => 'required|date',
            'description' => 'required|string',
            'type' => 'required|string|in:Event,Training,Meeting',
            'visible_to' => 'required|array',
            'visible_to.*' => 'in:all,admin,teacher,student,parent',
        ]);

        // Create the event record
        $event = Event::create([
            'name' => $request->name,
            'date' => $request->date,
            'description' => $request->description,
            'type' => $request->type,
            'visible_to' => $request->visible_to,
        ]);

        return response()->json(['message' => 'Event added successfully!', 'event' => $event], 201);
    }

    // Get events based on the user's role
    public function getEvents(Request $request)
    {
        // Get the role from the request
        $userRole = $request->query('role');

        // Validate the role
        if (!$userRole) {
            return response()->json(['message' => 'Role parameter is required.'], 400);
        }

        // Fetch events
        if ($userRole === 'admin') {
            // Admin can see all events
            $events = Event::all();
        } else {
            // Other roles can only see events visible to them or 'all'
            $events = Event::whereJsonContains('visible_to', $userRole)
                ->orWhereJsonContains('visible_to', 'all')
                ->get();
        }

        if ($events->isEmpty()) {
            return response()->json(['message' => 'No events found.'], 404);
        }

        return response()->json(['message' => 'Events retrieved successfully.', 'events' => $events], 200);
    }

    // Get the latest events
    public function getLatestEvents()
    {
        $events = Event::latest()->take(2)->get();

        if ($events->isEmpty()) {
            return response()->json(['message' => 'No events found.'], 404);
        }

        return response()->json(['message' => 'Latest events retrieved successfully.', 'events' => $events], 200);
    }
}