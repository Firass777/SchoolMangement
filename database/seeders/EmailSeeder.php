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

        ];

        foreach ($emails as $email) {
            Email::create($email);
        }
    }
}
