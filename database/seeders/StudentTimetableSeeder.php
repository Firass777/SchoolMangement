<?php


namespace Database\Seeders;

use App\Models\StudentTimetable;
use Illuminate\Database\Seeder;

class StudentTimetableSeeder extends Seeder
{
    public function run()
    {
        $timetables = [
            [
                'class' => '10',
                'day' => 'Monday',
                'subject' => 'Mathematics',
                'time' => '08:30 - 10:00 AM',
                'location' => 'Room 85',
            ],
            [
                'class' => '10',
                'day' => 'Monday',
                'subject' => 'Mathematics',
                'time' => '10:05 - 11:35 AM',
                'location' => 'Room 85',
            ],
            [
                'class' => '10',
                'day' => 'Tuesday',
                'subject' => 'French',
                'time' => '08:30 - 10:00 AM',
                'location' => 'Room 8',
            ],
            [
                'class' => '10',
                'day' => 'Tuesday',
                'subject' => 'English',
                'time' => '10:05 - 11:35 AM',
                'location' => 'Room 71',
            ],

        ];

        foreach ($timetables as $timetable) {
            StudentTimetable::create($timetable);
        }
    }
}