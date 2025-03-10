<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class StudentTimetable extends Model
{
    use HasFactory;

    protected $fillable = [
        'class',
        'day',
        'subject',
        'time',
        'location',
    ];
}
