<?php

// database/migrations/xxxx_xx_xx_xxxxxx_create_attendances_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateAttendancesTable extends Migration
{
    public function up()
    {
        Schema::create('attendances', function (Blueprint $table) {
            $table->id();
            $table->string('student_nin');
            $table->enum('status', ['Present', 'Absent', 'Late']);
            $table->string('class');
            $table->string('subject');
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('attendances');
    }
}
