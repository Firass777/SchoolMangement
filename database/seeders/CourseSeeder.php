<?php


namespace Database\Seeders;

use App\Models\Course;
use Illuminate\Database\Seeder;

class CourseSeeder extends Seeder
{
    public function run()
    {
        $courses = [
            [
                'name' => 'Introduction to Mathematics',
                'class' => '11',
                'subject' => 'Math',
                'file_path' => '/courses/math.pdf',
                'teacher_nin' => '12345678902',
            ],
            [
                'name' => 'Advanced Science',
                'class' => '10',
                'subject' => 'Science',
                'file_path' => '/courses/science.pdf',
                'teacher_nin' => '12345678902',
            ],
        ];

        foreach ($courses as $course) {
            Course::create($course);
        }
    }
}
