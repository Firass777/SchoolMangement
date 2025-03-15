<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StudentRecord extends Model
{
    use HasFactory;

    protected $fillable = [
        'full_name',
        'student_nin',
        'date_of_birth',
        'gender',
        'grade_class',
        'section',
        'enrollment_date',
        'parent_name',
        'relationship',
        'other_relationship',
        'contact_number',
        'email_address',
        'address',
        'previous_school',
        'transfer_certificate',
        'admission_status',
        'scholarship',
        'emergency_contact_name',
        'emergency_contact_relationship',
        'emergency_contact_number',
        'medical_conditions',
        'special_needs',
        'special_needs_details',
        'extracurricular_interests',
        'added_by_admin',
        'date_of_entry',
        'remarks',
    ];
}
