<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
    {
        Schema::create('student_records', function (Blueprint $table) {
            $table->id();
            $table->string('full_name');
            $table->string('student_nin')->unique();
            $table->date('date_of_birth');
            $table->enum('gender', ['Male', 'Female']);
            $table->string('grade_class');
            $table->string('section');
            $table->date('enrollment_date');
            $table->string('parent_name');
            $table->enum('relationship', ['Father', 'Mother', 'Other']);
            $table->string('other_relationship')->nullable();
            $table->string('contact_number');
            $table->string('email_address');
            $table->string('address');
            $table->string('previous_school')->nullable();
            $table->boolean('transfer_certificate')->default(false);
            $table->enum('admission_status', ['New Admission', 'Transfer', 'Returning Student']);
            $table->boolean('scholarship')->default(false);
            $table->decimal('payment_amount', 10, 2)->default(0);
            $table->string('emergency_contact_name');
            $table->string('emergency_contact_relationship');
            $table->string('emergency_contact_number');
            $table->text('medical_conditions')->nullable();
            $table->boolean('special_needs')->default(false);
            $table->string('special_needs_details')->nullable();
            $table->text('extracurricular_interests')->nullable();
            $table->string('added_by_admin');
            $table->date('date_of_entry');
            $table->text('remarks')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('student_records');
    }
};