<?php

namespace App\Http\Controllers;

use App\Models\Event;
use Illuminate\Http\Request;
use Carbon\Carbon;

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

            // Get monthly events count for the current year
        public function getMonthlyEvents()
        {
            $startOfYear = Carbon::now()->startOfYear();
            $endOfYear = Carbon::now()->endOfYear();
    
            $events = Event::where('date', '>=', $startOfYear)
                ->where('date', '<=', $endOfYear)
                ->get()
                ->groupBy(function ($event) {
                    return Carbon::parse($event->date)->format('F'); 
                });
    
            $labels = [];
            $data = [];
            for ($i = 1; $i <= 12; $i++) {
                $monthName = Carbon::create()->month($i)->format('F');
                $labels[] = $monthName;
                $data[] = isset($events[$monthName]) ? count($events[$monthName]) : 0;
            }
    
            return response()->json([
                'labels' => $labels,
                'data' => $data,
            ], 200);
        }
    


    // Get events from the last month
    public function getLastMonthEvents()
    {
        $lastMonthStart = Carbon::now()->subMonth()->startOfMonth();
        $lastMonthEnd = Carbon::now()->subMonth()->endOfMonth();

        $events = Event::where('date', '>=', $lastMonthStart)
            ->where('date', '<=', $lastMonthEnd)
            ->get();

        if ($events->isEmpty()) {
            return response()->json(['message' => 'No events found in the last month.'], 404);
        }

        return response()->json(['message' => 'Last month events retrieved successfully.', 'events' => $events], 200);
    }

    // Get upcoming events
    public function getUpcomingEvents()
    {
        $now = Carbon::now();
        $events = Event::where('date', '>=', $now)->get();

        if ($events->isEmpty()) {
            return response()->json(['message' => 'No upcoming events found.'], 404);
        }

        return response()->json(['message' => 'Upcoming events retrieved successfully.', 'events' => $events], 200);
    }

    // Get all events count for the current year
    public function getAllEventsCount()
    {
        $startOfYear = Carbon::now()->startOfYear();
        $endOfYear = Carbon::now()->endOfYear();

        $count = Event::where('date', '>=', $startOfYear)
            ->where('date', '<=', $endOfYear)
            ->count();

        return response()->json(['message' => 'Total events count retrieved.', 'count' => $count], 200);
    }

    // Get upcoming events count
    public function getUpcomingEventsCount()
    {
        $now = Carbon::now();
        $count = Event::where('date', '>=', $now)->count();

        return response()->json(['message' => 'Upcoming events count retrieved.', 'count' => $count], 200);
    }
}