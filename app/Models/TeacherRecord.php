<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TeacherRecord extends Model
{
    use HasFactory;

    protected $fillable = [
        'full_name',
        'teacher_nin',
        'date_of_birth',
        'gender',
        'contact_number',
        'email_address',
        'address',
        'nationality',
        'emergency_contact_name',
        'emergency_contact_number',
        'department',
        'subjects_assigned',
        'class_section_allocation',
        'date_of_joining',
        'employment_type',
        'attendance_leave_records',
    ];
}