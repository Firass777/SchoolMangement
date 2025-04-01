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

    // Get all grade records with student names
    public function getAllGradesWithNames()
    {
        $grades = Grade::join('users', 'grades.student_nin', '=', 'users.nin')
            ->select('grades.*', 'users.name as student_name')
            ->get();

        if ($grades->isEmpty()) {
            return response()->json(['message' => 'No grade records found.'], 404);
        }

        return response()->json(['message' => 'Grade records retrieved successfully.', 'grades' => $grades], 200);
    }

    public function getAverageGradeByTeacher($teacherNin)
    {
        $grades = Grade::where('teacher_nin', $teacherNin)->get();
    
        if ($grades->isEmpty()) {
            return response()->json(['average_grade' => 'N/A'], 200);
        }
    
        $total = 0;
        $count = 0;
    
        foreach ($grades as $grade) {
            switch ($grade->grade) {
                case 'A':
                    $total += 4;
                    break;
                case 'B':
                    $total += 3;
                    break;
                case 'C':
                    $total += 2;
                    break;
                case 'D':
                    $total += 1;
                    break;
                default:
                    $total += 0;
                    break;
            }
            $count++;
        }
    
        $average = $count > 0 ? $total / $count : 0;
    
        $letterGrade = 'N/A';
        if ($average >= 3.5) {
            $letterGrade = 'A';
        } elseif ($average >= 2.5) {
            $letterGrade = 'B';
        } elseif ($average >= 1.5) {
            $letterGrade = 'C';
        } elseif ($average >= 0.5) {
            $letterGrade = 'D';
        }
    
        return response()->json(['average_grade' => $letterGrade], 200);
    }

    public function getLast7DaysGrades($teacherNin)
{
    $grades = Grade::where('teacher_nin', $teacherNin)
        ->where('created_at', '>=', now()->subDays(7))
        ->get();

    if ($grades->isEmpty()) {
        return response()->json(['labels' => [], 'data' => []], 200);
    }

    $groupedGrades = $grades->groupBy(function ($grade) {
        return $grade->created_at->format('Y-m-d');
    });

    $labels = [];
    $data = [];

    for ($i = 6; $i >= 0; $i--) {
        $date = now()->subDays($i)->format('Y-m-d');
        $labels[] = $date;

        if (isset($groupedGrades[$date])) {
            $total = 0;
            $count = 0;

            foreach ($groupedGrades[$date] as $grade) {
                switch ($grade->grade) {
                    case 'A':
                        $total += 4;
                        break;
                    case 'B':
                        $total += 3;
                        break;
                    case 'C':
                        $total += 2;
                        break;
                    case 'D':
                        $total += 1;
                        break;
                    default:
                        $total += 0;
                        break;
                }
                $count++;
            }

            $data[] = $count > 0 ? round($total / $count, 2) : 0;
        } else {
            $data[] = 0;
        }
    }

    return response()->json(['labels' => $labels, 'data' => $data], 200);
}


public function getRecentGrades($studentNIN)
{
    $grades = Grade::where('student_nin', $studentNIN)
        ->orderBy('created_at', 'desc')
        ->take(2)
        ->get();

    if ($grades->isEmpty()) {
        return response()->json(['message' => 'No recent grades found'], 404);
    }

    return response()->json(['grades' => $grades], 200);
}
}