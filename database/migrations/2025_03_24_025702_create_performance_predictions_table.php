<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreatePerformancePredictionsTable extends Migration
{
    public function up()
    {
        Schema::create('performance_predictions', function (Blueprint $table) {
            $table->id();
            $table->string('student_nin');  
            $table->string('prediction');   
            $table->timestamps();           
        });
    }

    public function down()
    {
        Schema::dropIfExists('performance_predictions');
    }
}