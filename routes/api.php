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
use App\Http\Controllers\CertificatesController;
use App\Http\Controllers\StudentRecordController;

Route::get('/student-records', [StudentRecordController::class, 'index']);
Route::post('/student-records', [StudentRecordController::class, 'store']);
Route::get('/student-records/{nin}', [StudentRecordController::class, 'show']);
Route::put('/student-records/{id}', [StudentRecordController::class, 'update']);
Route::delete('/student-records/{id}', [StudentRecordController::class, 'destroy']);

Route::post('/certificates/upload', [CertificatesController::class, 'upload']); 
Route::get('/certificates', [CertificatesController::class, 'index']); 
Route::delete('/certificates/delete/{id}', [CertificatesController::class, 'delete']); 
Route::get('/certificates/edit/{id}', [CertificatesController::class, 'edit']); 
Route::put('/certificates/update/{id}', [CertificatesController::class, 'update']); 


Route::get('/student-timetable/{class}', [TimetableController::class, 'getStudentTimetable']);
Route::post('/student-timetable/add', [TimetableController::class, 'addStudentTimetable']);
Route::delete('/student-timetable/delete/{id}', [TimetableController::class, 'deleteStudentTimetable']);
Route::put('/student-timetable/update/{id}', [TimetableController::class, 'updateStudentTimetable']);

Route::get('/teacher-timetable/{email}', [TimetableController::class, 'getTeacherTimetable']);
Route::post('/teacher-timetable/add', [TimetableController::class, 'addTeacherTimetable']);
Route::delete('/teacher-timetable/delete/{id}', [TimetableController::class, 'deleteTeacherTimetable']);
Route::put('/teacher-timetable/update/{id}', [TimetableController::class, 'updateTeacherTimetable']);

Route::post('/notification/send', [NotificationController::class, 'sendNotification']);
Route::get('/notifications/{recipient}', [NotificationController::class, 'getNotifications']);

Route::post('/emails/send', [EmailController::class, 'sendEmail']);
Route::get('/emails', [EmailController::class, 'getEmails']);

Route::post('/events/add', [EventController::class, 'addEvent']);
Route::get('/events', [EventController::class, 'getEvents']);
Route::get('/events/latest', [EventController::class, 'getLatestEvents']);
Route::get('/events/last-month', [EventController::class, 'getLastMonthEvents']);
Route::get('/events/upcoming', [EventController::class, 'getUpcomingEvents']);
Route::get('/events/count/all', [EventController::class, 'getAllEventsCount']);
Route::get('/events/count/upcoming', [EventController::class, 'getUpcomingEventsCount']);
Route::get('events/monthly', [EventController::class, 'getMonthlyEvents']);


Route::get('/courses', [CourseController::class, 'getAllCourses']);
Route::post('/courses/add', [CourseController::class, 'addCourse']);
Route::get('/courses/teacher/{teacherNin}', [CourseController::class, 'getCoursesByTeacherNin']);
Route::delete('/courses/delete/{id}', [CourseController::class, 'deleteCourse']);
Route::get('/courses/download/{id}', [CourseController::class, 'downloadCourse']);

Route::post('grades/add', [GradesController::class, 'addGrade']);
Route::get('grades', [GradesController::class, 'getAllGrades']);
Route::get('grades/{studentNIN}', [GradesController::class, 'getGrades']);
Route::get('grades/teacher/{teacherNin}', [GradesController::class, 'getGradesByTeacherNin']);
Route::delete('grades/delete/{id}', [GradesController::class, 'deleteGrade']);
Route::get('grades-with-names', [GradesController::class, 'getAllGradesWithNames']);


Route::post('/attendance/add', [AttendanceController::class, 'addAttendance']);
Route::get('/attendance/{studentNIN?}', [AttendanceController::class, 'getAttendance']);
Route::get('/attendance/teacher/{teacherNin}', [AttendanceController::class, 'getAttendanceByTeacherNin']);
Route::delete('/attendance/{id}', [AttendanceController::class, 'deleteAttendance']);
Route::get('/attendance-rate', [AttendanceController::class, 'getAttendanceRate']);
Route::get('/daily-attendance-trends', [AttendanceController::class, 'getDailyAttendanceTrends']);

Route::get('/users/latest/students', [UsersController::class, 'getLatestStudents']);
Route::get('/users/latest/teachers', [UsersController::class, 'getLatestTeachers']);
Route::put('/users/{id}', [UsersController::class, 'update']); 
Route::delete('/users/{id}', [UsersController::class, 'destroy']);
Route::post('/register', [UsersController::class, 'register']);
Route::post('/login', [UsersController::class, 'login']);
Route::get('/dashboard', [UsersController::class, 'dashboard']);
Route::post('/logout', [UsersController::class, 'logout']);
Route::get('/users', [UsersController::class, 'index']);