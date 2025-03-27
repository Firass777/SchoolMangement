<?php


namespace Database\Seeders;

use App\Models\Attendance;
use Illuminate\Database\Seeder;

class AttendanceSeeder extends Seeder
{
    public function run()
    {
        $attendances = [
            [
                'student_nin' => '12345678900', 
                'status' => 'Present',
                'class' => '10',
                'subject' => 'Mathematics',
                'teacher_nin' => '12345678902', 
            ],
            [
                'student_nin' => '12345678900',
                'status' => 'Late',
                'class' => '10',
                'subject' => 'Science',
                'teacher_nin' => '12345678902',
            ],
            [
                'student_nin' => '12345678900', 
                'status' => 'Absent',
                'class' => '10',
                'subject' => 'IoT',
                'teacher_nin' => '12345678902', 
            ],
            [
                'student_nin' => '12345678900',
                'status' => 'Late',
                'class' => '10',
                'subject' => 'React',
                'teacher_nin' => '12345678902',
            ],

            [
                'student_nin' => '12345678901', 
                'status' => 'Present',
                'class' => '9',
                'subject' => 'SSI',
                'teacher_nin' => '12345678903', 
            ],
            [
                'student_nin' => '12345678901',
                'status' => 'Late',
                'class' => '9',
                'subject' => 'French',
                'teacher_nin' => '12345678903',
            ],
            [
                'student_nin' => '12345678901', 
                'status' => 'Absent',
                'class' => '9',
                'subject' => 'IoT',
                'teacher_nin' => '12345678903', 
            ],
            [
                'student_nin' => '12345678901',
                'status' => 'Late',
                'class' => '9',
                'subject' => 'Laravel',
                'teacher_nin' => '12345678903',
            ],


        [
            'student_nin' => '12345678904', 
            'status' => 'Present',
            'class' => '11',
            'subject' => 'SSI',
            'teacher_nin' => '12345678912', 
        ],
        [
            'student_nin' => '12345678904',
            'status' => 'Late',
            'class' => '11',
            'subject' => 'French',
            'teacher_nin' => '12345678912',
        ],
        [
            'student_nin' => '12345678905', 
            'status' => 'Present',
            'class' => '12',
            'subject' => 'Mathematics',
            'teacher_nin' => '12345678902', 
        ],
        [
            'student_nin' => '12345678905',
            'status' => 'Present',
            'class' => '12',
            'subject' => 'Science',
            'teacher_nin' => '12345678902',
        ],
        [
            'student_nin' => '12345678905', 
            'status' => 'Absent',
            'class' => '12',
            'subject' => 'IoT',
            'teacher_nin' => '12345678902', 
        ],
        [
            'student_nin' => '12345678905',
            'status' => 'Late',
            'class' => '12',
            'subject' => 'React',
            'teacher_nin' => '12345678902',
        ],
        
    ];

        foreach ($attendances as $attendance) {
            Attendance::create($attendance);
        }
    }
}