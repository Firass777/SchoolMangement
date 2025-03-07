<?php

// app/Models/Event.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Event extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'date',
        'description',
        'type',
        'visible_to',
    ];

    // Cast the 'visible_to' field to an array
    protected $casts = [
        'visible_to' => 'array',
    ];
}