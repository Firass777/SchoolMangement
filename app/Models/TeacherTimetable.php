<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class TeacherTimetable extends Model
{
    use HasFactory;

    protected $fillable = [
        'teacher_email',
        'day',
        'subject',
        'time',
        'location',
    ];
}
