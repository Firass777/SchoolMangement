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

    public function index(Request $request)
    {
        $query = StudentRecord::query();

        if ($request->has('search')) {
            $search = $request->input('search');
            $query->where('full_name', 'like', "%$search%")
                  ->orWhere('student_nin', 'like', "%$search%");
        }

        $records = $query->paginate(5);
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

    public function update(Request $request, $id)
    {
        $record = StudentRecord::find($id);
        if (!$record) {
            return response()->json(['message' => 'Record not found'], 404);
        }

        $request->validate([
            'full_name' => 'sometimes|string',
            'student_nin' => 'sometimes|string|unique:student_records,student_nin,' . $id,
            'date_of_birth' => 'sometimes|date',
            'gender' => 'sometimes|in:Male,Female',
            'grade_class' => 'sometimes|string',
            'section' => 'sometimes|string',
            'enrollment_date' => 'sometimes|date',
            'parent_name' => 'sometimes|string',
            'relationship' => 'sometimes|in:Father,Mother,Other',
            'other_relationship' => 'nullable|string',
            'contact_number' => 'sometimes|string',
            'email_address' => 'sometimes|email',
            'address' => 'sometimes|string',
            'previous_school' => 'nullable|string',
            'transfer_certificate' => 'nullable|boolean',
            'admission_status' => 'sometimes|in:New Admission,Transfer,Returning Student',
            'scholarship' => 'nullable|boolean',
            'emergency_contact_name' => 'sometimes|string',
            'emergency_contact_relationship' => 'sometimes|string',
            'emergency_contact_number' => 'sometimes|string',
            'medical_conditions' => 'nullable|string',
            'special_needs' => 'nullable|boolean',
            'special_needs_details' => 'nullable|string',
            'extracurricular_interests' => 'nullable|string',
            'added_by_admin' => 'sometimes|string',
            'date_of_entry' => 'sometimes|date',
            'remarks' => 'nullable|string',
        ]);

        $record->update($request->all());
        return response()->json(['message' => 'Record updated successfully', 'record' => $record]);
    }

    public function destroy($id)
    {
        $record = StudentRecord::find($id);
        if (!$record) {
            return response()->json(['message' => 'Record not found'], 404);
        }

        $record->delete();
        return response()->json(['message' => 'Record deleted successfully']);
    }
}