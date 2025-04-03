<?php


namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Email extends Model
{
    use HasFactory;

    protected $fillable = [
        'from',
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