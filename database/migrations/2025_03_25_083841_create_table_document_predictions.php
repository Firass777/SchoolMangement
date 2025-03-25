<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('document_predictions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('document_id')->constrained()->onDelete('cascade');
            $table->string('file_name'); 
            $table->string('predicted_category');
            $table->float('confidence_score', 5, 2);  
            $table->timestamp('processed_at')->useCurrent();
            $table->timestamps();
            
            $table->index('predicted_category');
            $table->index('confidence_score');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('document_predictions');
    }
};