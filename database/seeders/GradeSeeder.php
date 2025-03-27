<?php

namespace Database\Seeders;

use App\Models\Grade;
use Illuminate\Database\Seeder;

class GradeSeeder extends Seeder
{
    public function run()
    {
        $grades = [
            [
                'student_nin' => '12345678900',
                'subject' => 'Mathematics',
                'grade' => 'A',
                'class' => '10',
                'teacher_nin' => '12345678902', 
            ],
            [
                'student_nin' => '12345678900',
                'subject' => 'Science',
                'grade' => 'B',
                'class' => '10',
                'teacher_nin' => '12345678902',
            ],
            [
                'student_nin' => '12345678900',
                'subject' => 'React',
                'grade' => 'A',
                'class' => '10',
                'teacher_nin' => '12345678902', 
            ],
            [
                'student_nin' => '12345678900',
                'subject' => 'IoT',
                'grade' => 'C',
                'class' => '10',
                'teacher_nin' => '12345678902',
            ],
            [
                'student_nin' => '12345678901',
                'subject' => 'Mathematics',
                'grade' => 'C',
                'class' => '9',
                'teacher_nin' => '12345678903', 
            ],
            [
                'student_nin' => '12345678901',
                'subject' => 'English',
                'grade' => 'B',
                'class' => '9',
                'teacher_nin' => '12345678903',
            ],
            [
                'student_nin' => '12345678901',
                'subject' => 'React',
                'grade' => 'A',
                'class' => '9',
                'teacher_nin' => '12345678903', 
            ],
            [
                'student_nin' => '12345678901',
                'subject' => 'IoT',
                'grade' => 'A',
                'class' => '9',
                'teacher_nin' => '12345678903',
            ],
            [
                'student_nin' => '12345678904',
                'subject' => 'Mathematics',
                'grade' => 'B',
                'class' => '11',
                'teacher_nin' => '12345678902',
            ],
            [
                'student_nin' => '12345678905',
                'subject' => 'Science',
                'grade' => 'A',
                'class' => '12',
                'teacher_nin' => '12345678902',
            ],
        ];

        foreach ($grades as $grade) {
            Grade::create($grade);
        }
    }
}