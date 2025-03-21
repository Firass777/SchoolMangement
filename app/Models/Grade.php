<?php

// app/Models/Grade.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Grade extends Model
{
    use HasFactory;

    protected $fillable = [
        'student_nin',
        'subject',
        'grade',
        'class',
        'teacher_nin',
    ];
}