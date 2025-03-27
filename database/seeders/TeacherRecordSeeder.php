<?php

namespace Database\Seeders;

use App\Models\TeacherRecord;
use Illuminate\Database\Seeder;

class TeacherRecordSeeder extends Seeder
{
    public function run()
    {
        $teachers = [
            [
                'full_name' => 'Nabil',
                'teacher_nin' => '12345678902',
                'date_of_birth' => '1980-05-15',
                'gender' => 'Male',
                'contact_number' => '111-222-3333',
                'email_address' => 'teacher@gmail.com',
                'address' => '456 Teacher St, Education City',
                'nationality' => 'Tunisian',
                'emergency_contact_name' => 'Samira',
                'emergency_contact_number' => '111-222-4444',
                'department' => 'Computer Science',
                'subjects_assigned' => 'Mathematics,React,Science',
                'class_section_allocation' => '10,11,12',
                'date_of_joining' => '2020-01-15',
                'employment_type' => 'Permanent',
            ],
            [
                'full_name' => 'Mohamed',
                'teacher_nin' => '12345678903',
                'date_of_birth' => '1975-08-20',
                'gender' => 'Male',
                'contact_number' => '222-333-4444',
                'email_address' => 'teacher1@gmail.com',
                'address' => '789 Educator Ave, Knowledge Town',
                'nationality' => 'Tunisian',
                'emergency_contact_name' => 'Karim',
                'emergency_contact_number' => '222-333-5555',
                'department' => 'Information Technology',
                'subjects_assigned' => 'IoT,French,SSI',
                'class_section_allocation' => '9,10,11',
                'date_of_joining' => '2018-03-10',
                'employment_type' => 'Permanent',
            ],
            [
                'full_name' => 'Fatima',
                'teacher_nin' => '12345678912',
                'date_of_birth' => '1985-03-22',
                'gender' => 'Female',
                'contact_number' => '333-444-5555',
                'email_address' => 'teacher2@gmail.com',
                'address' => '321 Instructor Blvd, Learning City',
                'nationality' => 'Tunisian',
                'emergency_contact_name' => 'Ali',
                'emergency_contact_number' => '333-444-6666',
                'department' => 'Languages',
                'subjects_assigned' => 'English,French,Literature',
                'class_section_allocation' => '9,10,11,12',
                'date_of_joining' => '2019-05-18',
                'employment_type' => 'Permanent',
            ],
        ];

        foreach ($teachers as $teacher) {
            TeacherRecord::create($teacher);
        }
    }
}