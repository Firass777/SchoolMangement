<?php

// database/migrations/xxxx_xx_xx_xxxxxx_create_courses_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateCoursesTable extends Migration
{
    public function up()
    {
        Schema::create('courses', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // Name of the course
            $table->string('class'); // Class associated with the course
            $table->string('subject'); // Subject associated with the course
            $table->string('file_path'); // Path to the uploaded PDF file
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('courses');
    }
}