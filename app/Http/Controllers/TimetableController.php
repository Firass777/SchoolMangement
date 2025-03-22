<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\StudentTimetable;
use App\Models\TeacherTimetable;

class TimetableController extends Controller
{
    // Get student timetable by class
    public function getStudentTimetable($class)
    {
        $timetable = StudentTimetable::where('class', $class)->get();
        return response()->json($timetable);
    }

    // Get teacher timetable by email
    public function getTeacherTimetable($email)
    {
        $timetable = TeacherTimetable::where('teacher_email', $email)->get();
        return response()->json($timetable);
    }

    // Add student timetable
    public function addStudentTimetable(Request $request)
    {
        $request->validate([
            'class' => 'required|string',
            'day' => 'required|string',
            'subject' => 'required|string',
            'time' => 'required|string',
            'location' => 'required|string',
        ]);

        $timetable = StudentTimetable::create($request->all());
        return response()->json(['message' => 'Student timetable added successfully!', 'timetable' => $timetable], 201);
    }

    // Add teacher timetable
    public function addTeacherTimetable(Request $request)
    {
        $request->validate([
            'teacher_email' => 'required|string',
            'day' => 'required|string',
            'subject' => 'required|string',
            'time' => 'required|string',
            'location' => 'required|string',
        ]);

        $timetable = TeacherTimetable::create($request->all());
        return response()->json(['message' => 'Teacher timetable added successfully!', 'timetable' => $timetable], 201);
    }

    // Delete student timetable
    public function deleteStudentTimetable($id)
    {
        $timetable = StudentTimetable::find($id);
        if ($timetable) {
            $timetable->delete();
            return response()->json(['message' => 'Student timetable deleted successfully!'], 200);
        }
        return response()->json(['message' => 'Timetable not found!'], 404);
    }

    // Delete teacher timetable
    public function deleteTeacherTimetable($id)
    {
        $timetable = TeacherTimetable::find($id);
        if ($timetable) {
            $timetable->delete();
            return response()->json(['message' => 'Teacher timetable deleted successfully!'], 200);
        }
        return response()->json(['message' => 'Timetable not found!'], 404);
    }

    // Update student timetable
    public function updateStudentTimetable(Request $request, $id)
    {
        $request->validate([
            'class' => 'required|string',
            'day' => 'required|string',
            'subject' => 'required|string',
            'time' => 'required|string',
            'location' => 'required|string',
        ]);

        $timetable = StudentTimetable::find($id);
        if ($timetable) {
            $timetable->update($request->all());
            return response()->json(['message' => 'Student timetable updated successfully!', 'timetable' => $timetable], 200);
        }
        return response()->json(['message' => 'Timetable not found!'], 404);
    }

    // Update teacher timetable
    public function updateTeacherTimetable(Request $request, $id)
    {
        $request->validate([
            'teacher_email' => 'required|string',
            'day' => 'required|string',
            'subject' => 'required|string',
            'time' => 'required|string',
            'location' => 'required|string',
        ]);

        $timetable = TeacherTimetable::find($id);
        if ($timetable) {
            $timetable->update($request->all());
            return response()->json(['message' => 'Teacher timetable updated successfully!', 'timetable' => $timetable], 200);
        }
        return response()->json(['message' => 'Timetable not found!'], 404);
    }

    public function getNextClass($email)
    {
        $now = now();
        $currentDay = $now->format('l');
        $currentTime = $now->format('H:i:s');

        $timetable = TeacherTimetable::where('teacher_email', $email)
            ->orderByRaw("FIELD(day, 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday')")
            ->orderBy('time')
            ->get();

        $nextClass = null;
        $daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        $currentDayIndex = array_search($currentDay, $daysOfWeek);

        foreach ($timetable as $class) {
            $classDayIndex = array_search($class->day, $daysOfWeek);
            if ($classDayIndex > $currentDayIndex || 
            ($classDayIndex == $currentDayIndex && $class->time > $currentTime)) {
                $nextClass = $class;
                break;
            }
        }

        if (!$nextClass && !$timetable->isEmpty()) {
            $nextClass = $timetable->first();
        }

        return response()->json(['nextClass' => $nextClass], 200);
    }
}