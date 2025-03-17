<?php

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
            'file' => 'required|mimes:pdf|max:2048',
            'teacher_nin' => 'required|string',
        ]);

        // Store the file
        $filePath = $request->file('file')->store('courses', 'public');

        // Create the course record
        $course = Course::create([
            'name' => $request->name,
            'class' => $request->class,
            'subject' => $request->subject,
            'file_path' => $filePath,
            'teacher_nin' => $request->teacher_nin,
        ]);

        return response()->json(['message' => 'Course added successfully!', 'course' => $course], 201);
    }

    // Get all courses
    public function getAllCourses(Request $request)
    {
        // Fetch all courses
        $courses = Course::all();

        if ($courses->isEmpty()) {
            return response()->json(['message' => 'No courses found.'], 404);
        }

        return response()->json(['message' => 'Courses retrieved successfully.', 'courses' => $courses], 200);
    }

    // Get courses by teacher_nin
    public function getCoursesByTeacherNin($teacherNin)
    {
        $courses = Course::where('teacher_nin', $teacherNin)->get();

        if ($courses->isEmpty()) {
            return response()->json(['message' => 'No courses found for this teacher.'], 404);
        }

        return response()->json(['message' => 'Courses retrieved successfully.', 'courses' => $courses], 200);
    }

    // Delete a course
    public function deleteCourse($id)
    {
        $course = Course::find($id);

        if (!$course) {
            return response()->json(['message' => 'Course not found.'], 404);
        }

        // Delete the file from storage
        Storage::disk('public')->delete($course->file_path);

        // Delete the course record
        $course->delete();

        return response()->json(['message' => 'Course deleted successfully.'], 200);
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