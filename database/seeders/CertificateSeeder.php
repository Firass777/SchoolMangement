<?php


namespace Database\Seeders;

use App\Models\Certificate;
use Illuminate\Database\Seeder;

class CertificateSeeder extends Seeder
{
    public function run()
    {
        $certificates = [
            [
                'student_nin' => '12345678900', 
                'year' => '2023',
                'inscription_pdf' => '/certificates/inscription.pdf',
                'attendance_pdf' => '/certificates/attendance.pdf',
                'success_pdf' => '/certificates/success.pdf',
            ],
            [
                'student_nin' => '12345678900',
                'year' => '2022',
                'inscription_pdf' => '/certificates/inscription.pdf',
                'attendance_pdf' => '/certificates/attendance.pdf',
                'success_pdf' => '/certificates/success.pdf',
            ],

        ];

        foreach ($certificates as $certificate) {
            Certificate::create($certificate);
        }
    }
}