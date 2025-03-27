<?php

namespace Database\Seeders;

use App\Models\StudentRecord;
use Illuminate\Database\Seeder;

class StudentRecordSeeder extends Seeder
{
    public function run()
    {
        $records = [
            [
                'full_name' => 'Ahmed',
                'student_nin' => '12345678900',
                'date_of_birth' => '2005-05-15',
                'gender' => 'Male',
                'grade_class' => '10',
                'section' => 'Computer Science',
                'enrollment_date' => '2023-09-01',
                'parent_name' => 'Hasna',
                'relationship' => 'Mother',
                'contact_number' => '123-456-7890',
                'email_address' => 'parent@gmail.com',
                'address' => '123 Main St, City, Country',
                'emergency_contact_name' => 'Najla',
                'emergency_contact_relationship' => 'Sister',
                'emergency_contact_number' => '123-456-7890',
                'added_by_admin' => 'admin@gmail.com',
                'date_of_entry' => '2023-09-01',
                'payment_amount' => 4500.00,
            ],
            [
                'full_name' => 'Sofia',
                'student_nin' => '12345678901', 
                'date_of_birth' => '2006-06-20',
                'gender' => 'Female',
                'grade_class' => '9',
                'section' => 'AI',
                'enrollment_date' => '2023-09-01',
                'parent_name' => 'Ala',
                'relationship' => 'Father',
                'contact_number' => '987-654-3210',
                'email_address' => 'parent1@gmail.com',
                'address' => '456 Elm St, City, Country',
                'emergency_contact_name' => 'Monji',
                'emergency_contact_relationship' => 'Grand-Father',
                'emergency_contact_number' => '987-654-3210',
                'added_by_admin' => 'admin@gmail.com',
                'date_of_entry' => '2023-09-01',
                'payment_amount' => 3500.00,
            ],
            [
                'full_name' => 'Mohamed Ali',
                'student_nin' => '12345678904',
                'date_of_birth' => '2005-03-12',
                'gender' => 'Male',
                'grade_class' => '11',
                'section' => 'Science',
                'enrollment_date' => '2023-09-01',
                'parent_name' => 'Fatima',
                'relationship' => 'Mother',
                'contact_number' => '555-123-4567',
                'email_address' => 'parent2@gmail.com',
                'address' => '789 Oak St, City, Country',
                'emergency_contact_name' => 'Karim',
                'emergency_contact_relationship' => 'Uncle',
                'emergency_contact_number' => '555-987-6543',
                'added_by_admin' => 'admin@gmail.com',
                'date_of_entry' => '2023-09-01',
                'payment_amount' => 5000.00,
            ],
            [
                'full_name' => 'Lina',
                'student_nin' => '12345678905',
                'date_of_birth' => '2004-07-25',
                'gender' => 'Female',
                'grade_class' => '12',
                'section' => 'Literature',
                'enrollment_date' => '2023-09-01',
                'parent_name' => 'Samir',
                'relationship' => 'Father',
                'contact_number' => '555-234-5678',
                'email_address' => 'parent3@gmail.com',
                'address' => '321 Pine St, City, Country',
                'emergency_contact_name' => 'Yasmine',
                'emergency_contact_relationship' => 'Aunt',
                'emergency_contact_number' => '555-876-5432',
                'added_by_admin' => 'admin@gmail.com',
                'date_of_entry' => '2023-09-01',
                'payment_amount' => 5500.00,
            ],
        ];

        foreach ($records as $record) {
            StudentRecord::create($record);
        }
    }
}