<?php


namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Document extends Model
{
    protected $fillable = ['file_name', 'file_path', 'uploaded_by', 'uploaded_at'];
    
    protected $casts = [
        'uploaded_at' => 'datetime', 
    ];

    public function prediction()
    {
        return $this->hasOne(DocumentPrediction::class);
    }
}
