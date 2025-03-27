<?php

namespace Database\Seeders;

use App\Models\Event;
use Illuminate\Database\Seeder;

class EventSeeder extends Seeder
{
    public function run()
    {
        $events = [
            [
                'name' => 'School Assembly',
                'date' => '2025-05-15',
                'description' => 'Monthly school assembly for all students.',
                'type' => 'Event',
                'visible_to' => ['student', 'teacher'],
            ],
            [
                'name' => 'Teacher Training',
                'date' => '2025-08-20',
                'description' => 'Training session for all teachers.',
                'type' => 'Training',
                'visible_to' => ['teacher'], 
            ],
            [
                'name' => 'Students Meetings',
                'date' => '2025-03-20',
                'description' => 'Meeting for all students.',
                'type' => 'Training',
                'visible_to' => ['student'], 
            ],
            [
                'name' => 'Science Fair',
                'date' => '2025-07-10',
                'description' => 'Showcase of student science projects.',
                'type' => 'Event',
                'visible_to' => ['student', 'teacher', 'parent'],
            ],
            [
                'name' => 'Parent-Teacher Meeting',
                'date' => '2025-09-30',
                'description' => 'Discuss student progress with teachers.',
                'type' => 'Meeting',
                'visible_to' => ['parent'],
            ],
        ];

        foreach ($events as $event) {
            Event::create($event);
        }
    }
}