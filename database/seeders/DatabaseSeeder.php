<?php

// database/seeders/DatabaseSeeder.php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run()
    {
        $this->call([
            UserSeeder::class,
            AttendanceSeeder::class,
            GradeSeeder::class,
            CourseSeeder::class,
            EventSeeder::class,
            EmailSeeder::class,
            NotificationSeeder::class,
            StudentTimetableSeeder::class,
            TeacherTimetableSeeder::class,
            CertificateSeeder::class,
            StudentRecordSeeder::class,
        ]);
    }
}