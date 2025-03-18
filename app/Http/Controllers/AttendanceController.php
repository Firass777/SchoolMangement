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

    // Get all attendance records or records for a specific student
    public function getAttendance(Request $request, $studentNIN = null)
    {
        if ($studentNIN) {
            // Fetch attendance records for a specific student
            $attendances = Attendance::where('student_nin', $studentNIN)->get();
        } else {
            // Fetch all attendance records
            $attendances = Attendance::all();
        }

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

    // Calculate attendance rate for all students
    public function getAttendanceRate()
    {
        // Fetch all attendance records
        $attendances = Attendance::all();

        if ($attendances->isEmpty()) {
            return response()->json(['message' => 'No attendance records found.'], 404);
        }

        // Group attendance records by student_nin
        $groupedAttendances = $attendances->groupBy('student_nin');

        $totalStudents = $groupedAttendances->count();
        $totalPresent = 0;
        $totalRecords = 0;

        // Calculate total present and total records for all students
        foreach ($groupedAttendances as $studentAttendances) {
            $totalRecords += $studentAttendances->count();
            $totalPresent += $studentAttendances->where('status', 'Present')->count();
        }

        // Calculate attendance rate
        if ($totalRecords === 0) {
            return response()->json(['message' => 'No attendance records found.'], 404);
        }

        $attendanceRate = ($totalPresent / $totalRecords) * 100;

        return response()->json([
            'message' => 'Attendance rate calculated successfully.',
            'attendance_rate' => round($attendanceRate, 2),
        ], 200);
    }

    public function getDailyAttendanceTrends()
{
    // Fetch attendance records for the last 7 days
    $attendanceTrends = Attendance::where('created_at', '>=', now()->subDays(7))
        ->selectRaw('DATE(created_at) as date, COUNT(*) as total, SUM(CASE WHEN status = "Present" THEN 1 ELSE 0 END) as present')
        ->groupBy('date')
        ->orderBy('date', 'asc')
        ->get();

    if ($attendanceTrends->isEmpty()) {
        return response()->json(['message' => 'No attendance records found for the last 7 days.'], 404);
    }

    // Format data for the chart
    $labels = [];
    $data = [];
    foreach ($attendanceTrends as $trend) {
        $labels[] = $trend->date;
        $data[] = $trend->total > 0 ? round(($trend->present / $trend->total) * 100, 2) : 0;
    }

    return response()->json([
        'message' => 'Daily attendance trends retrieved successfully.',
        'labels' => $labels,
        'data' => $data,
    ], 200);
}
}