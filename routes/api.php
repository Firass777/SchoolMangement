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

Route::post('/notification/send', [NotificationController::class, 'sendNotification']);
Route::get('/notifications/{recipient}', [NotificationController::class, 'getNotifications']);

Route::post('/emails/send', [EmailController::class, 'sendEmail']);
Route::get('/emails', [EmailController::class, 'getEmails']);

Route::post('/events/add', [EventController::class, 'addEvent']);
Route::get('/events', [EventController::class, 'getEvents']);

Route::post('/courses/add', [CourseController::class, 'addCourse']);
Route::get('/courses', [CourseController::class, 'getCourses']);
Route::get('/courses/download/{id}', [CourseController::class, 'downloadCourse']);

Route::post('/grades/add', [GradesController::class, 'addGrade']);
Route::get('/grades/{studentNIN}', [GradesController::class, 'getGrades']);

Route::post('attendance/add', [AttendanceController::class, 'addAttendance']);
Route::get('attendance/{studentNIN}', [AttendanceController::class, 'getAttendance']);


Route::put('/users/{id}', [UsersController::class, 'update']); 
Route::delete('/users/{id}', [UsersController::class, 'destroy']);
Route::post('/register', [UsersController::class, 'register']);
Route::post('/login', [UsersController::class, 'login']);
Route::get('/dashboard', [UsersController::class, 'dashboard']);
Route::post('/logout', [UsersController::class, 'logout']);
Route::get('/users', [UsersController::class, 'index']);