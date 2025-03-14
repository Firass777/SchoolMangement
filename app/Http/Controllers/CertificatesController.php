<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Certificate;
use Illuminate\Support\Facades\Storage;

class CertificatesController extends Controller
{
    // Upload certificates
    public function upload(Request $request)
    {
        $request->validate([
            'student_nin' => 'required|string',
            'year' => 'required|string',
            'inscription_pdf' => 'nullable|file|mimes:pdf',
            'attendance_pdf' => 'nullable|file|mimes:pdf',
            'success_pdf' => 'nullable|file|mimes:pdf',
        ]);

        // Store files and get paths
        $inscriptionPath = $request->hasFile('inscription_pdf')
            ? $request->file('inscription_pdf')->store('certificates', 'public')
            : null;

        $attendancePath = $request->hasFile('attendance_pdf')
            ? $request->file('attendance_pdf')->store('certificates', 'public')
            : null;

        $successPath = $request->hasFile('success_pdf')
            ? $request->file('success_pdf')->store('certificates', 'public')
            : null;

        // Create certificate record
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

    // Fetch all certificates
    public function index()
    {
        $certificates = Certificate::all();

        if ($certificates->isEmpty()) {
            return response()->json([
                'message' => 'No certificates found.',
            ], 404);
        }

        return response()->json([
            'message' => 'Certificates retrieved successfully!',
            'data' => $certificates,
        ], 200);
    }

    // Delete a certificate
    public function delete($id)
    {
        $certificate = Certificate::find($id);

        if (!$certificate) {
            return response()->json([
                'message' => 'Certificate not found.',
            ], 404);
        }

        // Delete files from storage
        if ($certificate->inscription_pdf) {
            Storage::disk('public')->delete($certificate->inscription_pdf);
        }
        if ($certificate->attendance_pdf) {
            Storage::disk('public')->delete($certificate->attendance_pdf);
        }
        if ($certificate->success_pdf) {
            Storage::disk('public')->delete($certificate->success_pdf);
        }

        $certificate->delete();

        return response()->json([
            'message' => 'Certificate deleted successfully!',
        ], 200);
    }

    // Fetch a single certificate for editing
    public function edit($id)
    {
        $certificate = Certificate::find($id);

        if (!$certificate) {
            return response()->json([
                'message' => 'Certificate not found.',
            ], 404);
        }

        return response()->json([
            'message' => 'Certificate retrieved successfully!',
            'data' => $certificate,
        ], 200);
    }

    // Update a certificate
    public function update(Request $request, $id)
    {
        $certificate = Certificate::find($id);

        if (!$certificate) {
            return response()->json([
                'message' => 'Certificate not found.',
            ], 404);
        }

        $request->validate([
            'student_nin' => 'required|string',
            'year' => 'required|string',
            'inscription_pdf' => 'nullable|file|mimes:pdf',
            'attendance_pdf' => 'nullable|file|mimes:pdf',
            'success_pdf' => 'nullable|file|mimes:pdf',
        ]);

        // Update file paths if new files are uploaded
        if ($request->hasFile('inscription_pdf')) {
            // Delete the old file
            if ($certificate->inscription_pdf) {
                Storage::disk('public')->delete($certificate->inscription_pdf);
            }
            // Store the new file
            $certificate->inscription_pdf = $request->file('inscription_pdf')->store('certificates', 'public');
        }

        if ($request->hasFile('attendance_pdf')) {
            // Delete the old file
            if ($certificate->attendance_pdf) {
                Storage::disk('public')->delete($certificate->attendance_pdf);
            }
            // Store the new file
            $certificate->attendance_pdf = $request->file('attendance_pdf')->store('certificates', 'public');
        }

        if ($request->hasFile('success_pdf')) {
            // Delete the old file
            if ($certificate->success_pdf) {
                Storage::disk('public')->delete($certificate->success_pdf);
            }
            // Store the new file
            $certificate->success_pdf = $request->file('success_pdf')->store('certificates', 'public');
        }

        // Update other fields
        $certificate->student_nin = $request->student_nin;
        $certificate->year = $request->year;
        $certificate->save();

        return response()->json([
            'message' => 'Certificate updated successfully!',
            'data' => $certificate,
        ], 200);
    }
}