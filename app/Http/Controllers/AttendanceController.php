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
            'teacher_nin' => 'required|string',
        ]);

        $attendance = Attendance::create([
            'student_nin' => $request->student_nin,
            'status' => $request->status,
            'class' => $request->class,
            'subject' => $request->subject,
            'teacher_nin' => $request->teacher_nin,
        ]);

        return response()->json(['message' => 'Attendance added successfully!', 'attendance' => $attendance], 201);
    }

    // Get all attendance records
    public function getAttendance($studentNIN)
    {
        $attendances = Attendance::where('student_nin', $studentNIN)->get();
    
        if ($attendances->isEmpty()) {
            return response()->json(['message' => 'No attendance records found.'], 404);
        }
    
        return response()->json(['message' => 'Attendance records retrieved successfully.', 'attendances' => $attendances], 200);
    }

    // Get all attendance records for a teacher
    public function getAttendanceByTeacherNin($teacherNin)
    {
        $attendances = Attendance::where('teacher_nin', $teacherNin)->get();

        if ($attendances->isEmpty()) {
            return response()->json(['message' => 'No attendance records found.'], 404);
        }

        return response()->json(['message' => 'Attendance records retrieved successfully.', 'attendances' => $attendances], 200);
    }

    // Delete an attendance record
    public function deleteAttendance($id)
    {
        $attendance = Attendance::find($id);

        if (!$attendance) {
            return response()->json(['message' => 'Attendance record not found.'], 404);
        }

        $attendance->delete();

        return response()->json(['message' => 'Attendance record deleted successfully.'], 200);
    }
}