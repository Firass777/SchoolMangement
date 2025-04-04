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
use App\Http\Controllers\TeacherRecordController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\PredictionController;
use App\Http\Controllers\DocumentController;

Route::get('/documents', [DocumentController::class, 'index']);
Route::post('/documents', [DocumentController::class, 'upload']);
Route::get('/documents/{id}/download', [DocumentController::class, 'download']);
Route::delete('/documents/{id}', [DocumentController::class, 'delete']);



Route::get('/predict', [PredictionController::class, 'predict']);

Route::post('/create-payment', [PaymentController::class, 'create']);
Route::post('/stripe-webhook', [PaymentController::class, 'handleWebhook']);
Route::get('/get-payments', [PaymentController::class, 'getPayments']);
Route::get('/get-all-payments', [PaymentController::class, 'getAllPayments']);
Route::get('/payment-summary', [PaymentController::class, 'getPaymentSummary']);

Route::get('/payments-by-month', [PaymentController::class, 'getPaymentsByMonth']);
Route::get('/payments-by-week', [PaymentController::class, 'getPaymentsByWeek']);
Route::get('/get-all-payments', [PaymentController::class, 'getAllPaymentsAdmin']);

Route::get('/get-children', [PaymentController::class, 'getChildren']);
Route::post('/create-payment', [PaymentController::class, 'create']);
Route::get('/get-parent-payments', [PaymentController::class, 'getParentPayments']);
Route::get('/get-all-parent-payments', [PaymentController::class, 'getAllParentPayments']);
Route::get('/get-parent-payment-summary', [PaymentController::class, 'getParentPaymentSummary']);

Route::get('/teacher-records', [TeacherRecordController::class, 'index']);
Route::post('/teacher-records', [TeacherRecordController::class, 'store']);
Route::get('/teacher-records/{nin}', [TeacherRecordController::class, 'show']);
Route::put('/teacher-records/{id}', [TeacherRecordController::class, 'update']);
Route::delete('/teacher-records/{id}', [TeacherRecordController::class, 'destroy']);
Route::get('/teacher-statistics', [TeacherRecordController::class, 'getTeacherStatistics']);

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

Route::get('/timetable/next-class/{email}', [TimetableController::class, 'getNextClass']);
Route::get('/teacher-timetable/{email}', [TimetableController::class, 'getTeacherTimetable']);
Route::post('/teacher-timetable/add', [TimetableController::class, 'addTeacherTimetable']);
Route::delete('/teacher-timetable/delete/{id}', [TimetableController::class, 'deleteTeacherTimetable']);
Route::put('/teacher-timetable/update/{id}', [TimetableController::class, 'updateTeacherTimetable']);

Route::post('/notification/send', [NotificationController::class, 'sendNotification']);
Route::get('/notifications/{recipient}', [NotificationController::class, 'getNotifications']);
Route::get('/notifications/{email}', [NotificationController::class, 'getNotifications']);
Route::get('/notifications/unread-count/{email}', [NotificationController::class, 'getUnreadCount']);
Route::post('/notifications/mark-as-read', [NotificationController::class, 'markAsRead']);

Route::post('/emails/send', [EmailController::class, 'sendEmail']);
Route::get('/emails', [EmailController::class, 'getEmails']);
Route::get('/emails/unread-count/{email}', [EmailController::class, 'getUnreadCount']);
Route::post('/emails/mark-as-read', [EmailController::class, 'markAsRead']);

Route::post('/events/add', [EventController::class, 'addEvent']);
Route::get('/events', [EventController::class, 'getEvents']);
Route::get('/events/latest-for-teacher', [EventController::class, 'getLatestEventsForTeacher']);
Route::get('/events/latest', [EventController::class, 'getLatestEvents']);
Route::get('/events/last-month', [EventController::class, 'getLastMonthEvents']);
Route::get('/events/upcoming', [EventController::class, 'getUpcomingEvents']);
Route::get('/events/count/all', [EventController::class, 'getAllEventsCount']);
Route::get('/events/count/upcoming', [EventController::class, 'getUpcomingEventsCount']);
Route::get('events/monthly', [EventController::class, 'getMonthlyEvents']);


Route::get('/courses', [CourseController::class, 'getAllCourses']);
Route::post('/courses/add', [CourseController::class, 'addCourse']);
Route::get('/courses/teacher/{teacherNin}', [CourseController::class, 'getCoursesByTeacherNin']);
Route::get('/courses/latest', [CourseController::class, 'getLatestCourses']);
Route::delete('/courses/delete/{id}', [CourseController::class, 'deleteCourse']);
Route::get('/courses/download/{id}', [CourseController::class, 'downloadCourse']);


Route::get('/grades/last-7-days/{teacherNin}', [GradesController::class, 'getLast7DaysGrades']);
Route::get('/grades/average/{teacherNin}', [GradesController::class, 'getAverageGradeByTeacher']);
Route::get('/grades/monthly-average/{teacherNin}', [GradesController::class, 'getMonthlyAverageGrades']);
Route::post('grades/add', [GradesController::class, 'addGrade']);
Route::get('grades', [GradesController::class, 'getAllGrades']);
Route::get('grades/{studentNIN}', [GradesController::class, 'getGrades']);
Route::get('grades/teacher/{teacherNin}', [GradesController::class, 'getGradesByTeacherNin']);
Route::delete('grades/delete/{id}', [GradesController::class, 'deleteGrade']);
Route::get('grades-with-names', [GradesController::class, 'getAllGradesWithNames']);
Route::get('/grades/recent/{studentNIN}', [GradesController::class, 'getRecentGrades']);
Route::get('/attendance/recent/{studentNIN}', [AttendanceController::class, 'getRecentAttendance']);


Route::get('/attendance/students-count/{teacherNin}', [AttendanceController::class, 'getStudentsCountByTeacher']);
Route::get('/attendance/rate/{teacherNin}', [AttendanceController::class, 'getAttendanceRateByTeacher']);
Route::get('/attendance/last-7-days/{teacherNin}', [AttendanceController::class, 'getLast7DaysAttendance']);
Route::post('/attendance/add', [AttendanceController::class, 'addAttendance']);
Route::get('/attendance/{studentNIN?}', [AttendanceController::class, 'getAttendance']);
Route::get('/attendance/teacher/{teacherNin}', [AttendanceController::class, 'getAttendanceByTeacherNin']);
Route::delete('/attendance/{id}', [AttendanceController::class, 'deleteAttendance']);
Route::get('/attendance-rate', [AttendanceController::class, 'getAttendanceRate']);
Route::get('/daily-attendance-trends', [AttendanceController::class, 'getDailyAttendanceTrends']);



Route::get('/user-by-nin/{nin}', [UsersController::class, 'getUserByNin']);
Route::get('/users/latest/students', [UsersController::class, 'getLatestStudents']);
Route::get('/users/latest/teachers', [UsersController::class, 'getLatestTeachers']);
Route::put('/users/{id}', [UsersController::class, 'update']); 
Route::delete('/users/{id}', [UsersController::class, 'destroy']);
Route::post('/register', [UsersController::class, 'register']);
Route::post('/login', [UsersController::class, 'login']);
Route::get('/dashboard', [UsersController::class, 'dashboard']);
Route::post('/logout', [UsersController::class, 'logout']);
Route::get('/users', [UsersController::class, 'index']);


