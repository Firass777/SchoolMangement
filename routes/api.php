<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\UsersController;
use App\Http\Controllers\AttendanceController;
use App\Http\Controllers\GradesController;
use App\Http\Controllers\CourseController;
use App\Http\Controllers\EventController;

Route::post('/events/add', [EventController::class, 'addEvent']);
Route::get('/events', [EventController::class, 'getEvents']);

Route::post('/courses/add', [CourseController::class, 'addCourse']);
Route::get('/courses', [CourseController::class, 'getCourses']);
Route::get('/courses/download/{id}', [CourseController::class, 'downloadCourse']);

Route::post('/grades/add', [GradesController::class, 'addGrade']);
Route::get('/grades/{studentNIN}', [GradesController::class, 'getGrades']);

Route::post('attendance/add', [AttendanceController::class, 'addAttendance']);
Route::get('attendance/{studentNIN}', [AttendanceController::class, 'getAttendance']);

Route::post('/register', [UsersController::class, 'register']);
Route::post('/login', [UsersController::class, 'login']);
Route::get('/dashboard', [UsersController::class, 'dashboard']);
Route::post('/logout', [UsersController::class, 'logout']);
Route::get('/users', [UsersController::class, 'index']);
