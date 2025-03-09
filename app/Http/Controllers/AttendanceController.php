<?php

namespace App\Http\Controllers;

use App\Models\Attendance;
use Illuminate\Http\Request;

class AttendanceController extends Controller
{
    // Add attendance record
    public function addAttendance(Request $request)
    {
        $request->validate([
            'student_nin' => 'required|string',
            'status' => 'required|in:Present,Absent,Late',
            'class' => 'required|string',
            'subject' => 'required|string',
        ]);

        $attendance = Attendance::create([
            'student_nin' => $request->student_nin,
            'status' => $request->status,
            'class' => $request->class,
            'subject' => $request->subject,
        ]);

        return response()->json(['message' => 'Attendance added successfully!', 'attendance' => $attendance], 201);
    }

    // Get all attendance records
    public function getAllAttendance()
    {
        $attendances = Attendance::all();

        if ($attendances->isEmpty()) {
            return response()->json(['message' => 'No attendance records found.'], 404);
        }

        return response()->json(['message' => 'Attendance records retrieved successfully.', 'attendances' => $attendances], 200);
    }

    // Get attendance records for a student
    public function getAttendance($studentNIN)
    {
        $attendances = Attendance::where('student_nin', $studentNIN)->get();

        if ($attendances->isEmpty()) {
            return response()->json(['message' => 'No attendance records found.'], 404);
        }

        return response()->json(['message' => 'Attendance records retrieved successfully.', 'attendances' => $attendances], 200);
    }
}