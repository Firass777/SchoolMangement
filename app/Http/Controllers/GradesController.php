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
        ]);

        $grade = Grade::create([
            'student_nin' => $request->student_nin,
            'subject' => $request->subject,
            'grade' => $request->grade,
            'class' => $request->class,
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
}