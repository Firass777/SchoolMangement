<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Notification extends Model
{
    use HasFactory;

    protected $fillable = [
        'to',
        'title',
        'description',
        'read_at'
    ];

    protected $dates = [
        'read_at',
        'created_at',
        'updated_at'
    ];
}