<?php

namespace App\Http\Controllers;

use App\Models\TeacherRecord;
use Illuminate\Http\Request;

class TeacherRecordController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'full_name' => 'required|string',
            'teacher_nin' => 'required|string|unique:teacher_records',
            'date_of_birth' => 'required|date',
            'gender' => 'required|in:Male,Female',
            'contact_number' => 'required|string',
            'email_address' => 'required|email',
            'address' => 'required|string',
            'nationality' => 'required|string',
            'emergency_contact_name' => 'required|string',
            'emergency_contact_number' => 'required|string',
            'department' => 'required|string',
            'subjects_assigned' => 'required|string',
            'class_section_allocation' => 'required|string',
            'date_of_joining' => 'required|date',
            'employment_type' => 'required|in:Permanent,Contractual,Part-time',
            'attendance_leave_records' => 'nullable|string',
        ]);

        $record = TeacherRecord::create($request->all());
        return response()->json($record, 201);
    }

    public function index(Request $request)
    {
        $query = TeacherRecord::query();

        if ($request->has('search')) {
            $search = $request->input('search');
            $query->where('full_name', 'like', "%$search%")
                  ->orWhere('teacher_nin', 'like', "%$search%");
        }

        $records = $query->paginate(5);
        return response()->json($records);
    }

    public function show($nin)
    {
        $record = TeacherRecord::where('teacher_nin', $nin)->first();
        if ($record) {
            return response()->json($record);
        } else {
            return response()->json(['message' => 'Record not found'], 404);
        }
    }

    public function update(Request $request, $id)
    {
        $record = TeacherRecord::find($id);
        if (!$record) {
            return response()->json(['message' => 'Record not found'], 404);
        }

        $request->validate([
            'full_name' => 'sometimes|string',
            'teacher_nin' => 'sometimes|string|unique:teacher_records,teacher_nin,' . $id,
            'date_of_birth' => 'sometimes|date',
            'gender' => 'sometimes|in:Male,Female',
            'contact_number' => 'sometimes|string',
            'email_address' => 'sometimes|email',
            'address' => 'sometimes|string',
            'nationality' => 'sometimes|string',
            'emergency_contact_name' => 'sometimes|string',
            'emergency_contact_number' => 'sometimes|string',
            'department' => 'sometimes|string',
            'subjects_assigned' => 'sometimes|string',
            'class_section_allocation' => 'sometimes|string',
            'date_of_joining' => 'sometimes|date',
            'employment_type' => 'sometimes|in:Permanent,Contractual,Part-time',
            'attendance_leave_records' => 'nullable|string',
        ]);

        $record->update($request->all());
        return response()->json(['message' => 'Record updated successfully', 'record' => $record]);
    }

    public function destroy($id)
    {
        $record = TeacherRecord::find($id);
        if (!$record) {
            return response()->json(['message' => 'Record not found'], 404);
        }

        $record->delete();
        return response()->json(['message' => 'Record deleted successfully']);
    }

public function getTeacherStatistics()
{
    $teachers = TeacherRecord::all();

    $genderCount = ['male' => 0, 'female' => 0];
    $subjectCount = [];
    $classCount = [];

    foreach ($teachers as $teacher) {
        // Count gender
        if ($teacher->gender === 'Male') $genderCount['male']++;
        if ($teacher->gender === 'Female') $genderCount['female']++;

        // Count subjects
        $subjects = explode(',', $teacher->subjects_assigned);
        foreach ($subjects as $subject) {
            $subject = trim($subject);
            if (!isset($subjectCount[$subject])) {
                $subjectCount[$subject] = 0;
            }
            $subjectCount[$subject]++;
        }

        // Count classes
        $classes = explode(',', $teacher->class_section_allocation);
        foreach ($classes as $class) {
            $class = trim($class);
            if (!isset($classCount[$class])) {
                $classCount[$class] = 0;
            }
            $classCount[$class]++;
        }
    }

    return response()->json([
        'gender' => $genderCount,
        'subjects' => $subjectCount,
        'classes' => $classCount,
    ]);
}
}