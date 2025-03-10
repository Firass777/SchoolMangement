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
}