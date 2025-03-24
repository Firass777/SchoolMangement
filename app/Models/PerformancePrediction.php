<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PerformancePrediction extends Model
{
    use HasFactory;
    
    protected $fillable = [
        'student_nin',
        'prediction'
    ];
}