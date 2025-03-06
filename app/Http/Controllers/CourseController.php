<?php

// app/Http/Controllers/CourseController.php

namespace App\Http\Controllers;

use App\Models\Course;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class CourseController extends Controller
{
    // Add a new course
    public function addCourse(Request $request)
    {
        $request->validate([
            'name' => 'required|string',
            'class' => 'required|string',
            'subject' => 'required|string',
            'file' => 'required|mimes:pdf|max:2048', // Allow only PDF files up to 2MB
        ]);

        // Store the file
        $filePath = $request->file('file')->store('courses', 'public');

        // Create the course record
        $course = Course::create([
            'name' => $request->name,
            'class' => $request->class,
            'subject' => $request->subject,
            'file_path' => $filePath,
        ]);

        return response()->json(['message' => 'Course added successfully!', 'course' => $course], 201);
    }

    // Get courses by class and subject
    public function getCourses(Request $request)
    {
        $request->validate([
            'class' => 'required|string',
            'subject' => 'required|string',
        ]);

        $courses = Course::where('class', $request->class)
            ->where('subject', $request->subject)
            ->get();

        if ($courses->isEmpty()) {
            return response()->json(['message' => 'No courses found.'], 404);
        }

        return response()->json(['message' => 'Courses retrieved successfully.', 'courses' => $courses], 200);
    }

    // Download a course file
    public function downloadCourse($id)
    {
        $course = Course::find($id);

        if (!$course) {
            return response()->json(['message' => 'Course not found.'], 404);
        }

        $filePath = storage_path('app/public/' . $course->file_path);

        if (!file_exists($filePath)) {
            return response()->json(['message' => 'File not found.'], 404);
        }

        return response()->download($filePath, $course->name . '.pdf');
    }
}