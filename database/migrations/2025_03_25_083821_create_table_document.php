<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('documents', function (Blueprint $table) {
            $table->id();
            $table->string('file_name');
            $table->string('file_path');
            $table->string('uploaded_by');
            $table->timestamp('uploaded_at')->useCurrent();
            $table->timestamps(); 
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('documents');
    }
};