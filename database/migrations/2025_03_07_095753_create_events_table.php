<?php

// database/migrations/xxxx_xx_xx_xxxxxx_create_events_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateEventsTable extends Migration
{
    public function up()
    {
        Schema::create('events', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // Event name
            $table->date('date'); // Event date
            $table->text('description'); // Event description
            $table->string('type'); // Event type (Event, Training, Meeting)
            $table->json('visible_to'); // Roles that can see the event (e.g., ["student", "teacher"])
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('events');
    }
}