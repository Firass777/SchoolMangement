<?php

// database/seeders/TeacherTimetableSeeder.php

namespace Database\Seeders;

use App\Models\TeacherTimetable;
use Illuminate\Database\Seeder;

class TeacherTimetableSeeder extends Seeder
{
    public function run()
    {
        $timetables = [
            [
                'teacher_email' => 'teacher@gmail.com',
                'day' => 'Monday',
                'subject' => 'Mathematics',
                'time' => '08:30 - 10:00 AM',
                'location' => 'Room 95',
            ],
            [
                'teacher_email' => 'teacher@gmail.com',
                'day' => 'Tuesday',
                'subject' => 'Mathematics 2',
                'time' => '10:05 - 11:35 AM',
                'location' => 'Room 1',
            ],

        ];

        foreach ($timetables as $timetable) {
            TeacherTimetable::create($timetable);
        }
    }
}
