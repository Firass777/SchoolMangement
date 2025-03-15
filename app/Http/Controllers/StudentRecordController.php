<?php

namespace App\Http\Controllers;

use App\Models\StudentRecord;
use Illuminate\Http\Request;

class StudentRecordController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'full_name' => 'required|string',
            'student_nin' => 'required|string|unique:student_records',
            'date_of_birth' => 'required|date',
            'gender' => 'required|in:Male,Female',
            'grade_class' => 'required|string',
            'section' => 'required|string',
            'enrollment_date' => 'required|date',
            'parent_name' => 'required|string',
            'relationship' => 'required|in:Father,Mother,Other',
            'other_relationship' => 'nullable|string',
            'contact_number' => 'required|string',
            'email_address' => 'required|email',
            'address' => 'required|string',
            'previous_school' => 'nullable|string',
            'transfer_certificate' => 'nullable|boolean',
            'admission_status' => 'required|in:New Admission,Transfer,Returning Student',
            'scholarship' => 'nullable|boolean',
            'emergency_contact_name' => 'required|string',
            'emergency_contact_relationship' => 'required|string',
            'emergency_contact_number' => 'required|string',
            'medical_conditions' => 'nullable|string',
            'special_needs' => 'nullable|boolean',
            'special_needs_details' => 'nullable|string',
            'extracurricular_interests' => 'nullable|string',
            'added_by_admin' => 'required|string',
            'date_of_entry' => 'required|date',
            'remarks' => 'nullable|string',
        ]);
    
        $record = StudentRecord::create($request->all());
        return response()->json($record, 201);
    }

    public function index()
    {
        $records = StudentRecord::all();
        return response()->json($records);
    }

    public function show($nin)
    {
        $record = StudentRecord::where('student_nin', $nin)->first();
        if ($record) {
            return response()->json($record);
        } else {
            return response()->json(['message' => 'Record not found'], 404);
        }
    }
}