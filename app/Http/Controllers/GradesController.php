<?php

namespace App\Http\Controllers;

use App\Models\Grade;
use Illuminate\Http\Request;

class GradesController extends Controller
{
    // Add grade record
    public function addGrade(Request $request)
    {
        $request->validate([
            'student_nin' => 'required|string',
            'subject' => 'required|string',
            'grade' => 'required|string',
            'class' => 'required|string',
            'teacher_nin' => 'required|string',
        ]);

        $grade = Grade::create([
            'student_nin' => $request->student_nin,
            'subject' => $request->subject,
            'grade' => $request->grade,
            'class' => $request->class,
            'teacher_nin' => $request->teacher_nin,
        ]);

        return response()->json(['message' => 'Grade added successfully!', 'grade' => $grade], 201);
    }

    // Get all grade records
    public function getAllGrades()
    {
        $grades = Grade::all();

        if ($grades->isEmpty()) {
            return response()->json(['message' => 'No grade records found.'], 404);
        }

        return response()->json(['message' => 'Grade records retrieved successfully.', 'grades' => $grades], 200);
    }

    // Get grade records for a student
    public function getGrades($studentNIN)
    {
        $grades = Grade::where('student_nin', $studentNIN)->get();

        if ($grades->isEmpty()) {
            return response()->json(['message' => 'No grade records found.'], 404);
        }

        return response()->json(['message' => 'Grade records retrieved successfully.', 'grades' => $grades], 200);
    }

    // Get grade records for a teacher
    public function getGradesByTeacherNin($teacherNin)
    {
        $grades = Grade::where('teacher_nin', $teacherNin)->get();

        if ($grades->isEmpty()) {
            return response()->json(['message' => 'No grade records found.'], 404);
        }

        return response()->json(['message' => 'Grade records retrieved successfully.', 'grades' => $grades], 200);
    }

    // Delete a grade record
    public function deleteGrade($id)
    {
        $grade = Grade::find($id);

        if (!$grade) {
            return response()->json(['message' => 'Grade record not found.'], 404);
        }

        $grade->delete();

        return response()->json(['message' => 'Grade record deleted successfully.'], 200);
    }
}