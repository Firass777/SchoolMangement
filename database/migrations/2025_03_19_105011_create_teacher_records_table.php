<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('teacher_records', function (Blueprint $table) {
            $table->id();
            $table->string('full_name');
            $table->string('teacher_nin')->unique();
            $table->date('date_of_birth');
            $table->enum('gender', ['Male', 'Female']);
            $table->string('contact_number');
            $table->string('email_address');
            $table->string('address');
            $table->string('nationality');
            $table->string('emergency_contact_name');
            $table->string('emergency_contact_number');
            $table->string('department');
            $table->string('subjects_assigned');
            $table->string('class_section_allocation');
            $table->date('date_of_joining');
            $table->enum('employment_type', ['Permanent', 'Contractual', 'Part-time']);
            $table->text('attendance_leave_records')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('teacher_records');
    }
};