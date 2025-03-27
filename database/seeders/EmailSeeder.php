<?php

namespace Database\Seeders;

use App\Models\Email;
use Illuminate\Database\Seeder;

class EmailSeeder extends Seeder
{
    public function run()
    {
        $emails = [
            [
                'from' => 'admin@gmail.com',
                'to' => 'student@gmail.com',
                'title' => 'Welcome to the School',
                'description' => 'We are excited to have you on board!',
            ],
            [
                'from' => 'teacher@gmail.com',
                'to' => 'student1@gmail.com',
                'title' => 'Homework Assignment',
                'description' => 'Please complete the assignment by Friday.',
            ],
            [
                'from' => 'admin@gmail.com',
                'to' => 'teacher@gmail.com',
                'title' => 'Documents requested',
                'description' => 'The documents that you requested are ready at the adminstration',
            ],
            [
                'from' => 'student@gmail.com',
                'to' => 'teacher@gmail.com',
                'title' => 'Courses request',
                'description' => 'Hello , sir please upload the last course we had to the platform thanks',
            ],
            [
                'from' => 'teacher1@gmail.com',
                'to' => 'student@gmail.com',
                'title' => 'Test Results',
                'description' => 'Your test results are available. Please check your portal',
            ],
            [
                'from' => 'parent@gmail.com',
                'to' => 'admin@gmail.com',
                'title' => 'Transport Query',
                'description' => 'When will the bus routes for next semester be announced?',
            ],
        ];

        foreach ($emails as $email) {
            Email::create($email);
        }
    }
}