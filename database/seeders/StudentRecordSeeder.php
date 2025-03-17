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
            ],

        ];

        foreach ($records as $record) {
            StudentRecord::create($record);
        }
    }
}
