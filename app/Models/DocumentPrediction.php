<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DocumentPrediction extends Model
{
    protected $fillable = ['document_id','file_name', 'predicted_category', 'confidence_score', 'processed_at'];
    
    protected $casts = [
        'processed_at' => 'datetime',
    ];

    public function document()
    {
        return $this->belongsTo(Document::class);
    }
}