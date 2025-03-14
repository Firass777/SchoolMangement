<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\UsersController;
use App\Http\Controllers\AttendanceController;
use App\Http\Controllers\GradesController;
use App\Http\Controllers\CourseController;
use App\Http\Controllers\EventController;
use App\Http\Controllers\EmailController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\TimetableController;
use App\Http\Controllers\CertificateController;


Route::post('/certificates/upload', [CertificateController::class, 'upload']);
Route::get('/certificates/student/{student_nin}', [CertificateController::class, 'fetch']);


Route::get('/student-timetable/{class}', [TimetableController::class, 'getStudentTimetable']);
Route::post('/student-timetable/add', [TimetableController::class, 'addStudentTimetable']);

Route::get('/teacher-timetable/{email}', [TimetableController::class, 'getTeacherTimetable']);
Route::post('/teacher-timetable/add', [TimetableController::class, 'addTeacherTimetable']);

Route::post('/notification/send', [NotificationController::class, 'sendNotification']);
Route::get('/notifications/{recipient}', [NotificationController::class, 'getNotifications']);

Route::post('/emails/send', [EmailController::class, 'sendEmail']);
Route::get('/emails', [EmailController::class, 'getEmails']);

Route::post('/events/add', [EventController::class, 'addEvent']);
Route::get('/events', [EventController::class, 'getEvents']);
Route::get('/events/latest', [EventController::class, 'getLatestEvents']);


Route::post('/courses/add', [CourseController::class, 'addCourse']);
Route::get('/courses/teacher/{teacherNin}', [CourseController::class, 'getCoursesByTeacherNin']);
Route::delete('/courses/delete/{id}', [CourseController::class, 'deleteCourse']);
Route::get('/courses/download/{id}', [CourseController::class, 'downloadCourse']);

Route::post('grades/add', [GradesController::class, 'addGrade']);
Route::get('grades', [GradesController::class, 'getAllGrades']);
Route::get('grades/{studentNIN}', [GradesController::class, 'getGrades']);
Route::get('grades/teacher/{teacherNin}', [GradesController::class, 'getGradesByTeacherNin']);
Route::delete('grades/delete/{id}', [GradesController::class, 'deleteGrade']);

Route::post('attendance/add', [AttendanceController::class, 'addAttendance']);
Route::get('attendance/{studentNIN}', [AttendanceController::class, 'getAttendance']);
Route::get('attendance/teacher/{teacherNin}', [AttendanceController::class, 'getAttendanceByTeacherNin']);
Route::delete('attendance/delete/{id}', [AttendanceController::class, 'deleteAttendance']);


Route::get('/users/latest/students', [UsersController::class, 'getLatestStudents']);
Route::get('/users/latest/teachers', [UsersController::class, 'getLatestTeachers']);
Route::put('/users/{id}', [UsersController::class, 'update']); 
Route::delete('/users/{id}', [UsersController::class, 'destroy']);
Route::post('/register', [UsersController::class, 'register']);
Route::post('/login', [UsersController::class, 'login']);
Route::get('/dashboard', [UsersController::class, 'dashboard']);
Route::post('/logout', [UsersController::class, 'logout']);
Route::get('/users', [UsersController::class, 'index']);