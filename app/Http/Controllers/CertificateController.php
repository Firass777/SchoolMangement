<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Certificate;
use Illuminate\Support\Facades\Storage;

class CertificateController extends Controller
{

    public function upload(Request $request)
    {
        // Validate the request
        $request->validate([
            'student_nin' => 'required|string',
            'year' => 'required|string|size:4',
            'inscription_pdf' => 'nullable|file|mimes:pdf',
            'attendance_pdf' => 'nullable|file|mimes:pdf',
            'success_pdf' => 'nullable|file|mimes:pdf',
        ]);

        // Store the uploaded files and get their paths
        $inscriptionPath = $request->hasFile('inscription_pdf')
            ? $request->file('inscription_pdf')->store('certificates', 'public')
            : null;

        $attendancePath = $request->hasFile('attendance_pdf')
            ? $request->file('attendance_pdf')->store('certificates', 'public')
            : null;

        $successPath = $request->hasFile('success_pdf')
            ? $request->file('success_pdf')->store('certificates', 'public')
            : null;

        // Create a new certificate record
        $certificate = Certificate::create([
            'student_nin' => $request->student_nin,
            'year' => $request->year,
            'inscription_pdf' => $inscriptionPath,
            'attendance_pdf' => $attendancePath,
            'success_pdf' => $successPath,
        ]);

        return response()->json([
            'message' => 'Certificates uploaded successfully!',
            'data' => $certificate,
        ], 201);
    }


    public function fetch($student_nin)
    {
        $certificates = Certificate::where('student_nin', $student_nin)->get();
    
        if ($certificates->isEmpty()) {
            return response()->json([
                'message' => 'No certificates found for this student.',
            ], 404);
        }
    
        return response()->json([
            'message' => 'Certificates retrieved successfully!',
            'data' => $certificates,
        ], 200);
    }
}