<?php


namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run()
    {
        $users = [
            [
                'name' => 'Admin',
                'email' => 'admin@gmail.com',
                'nin' => '00000000000',
                'password' => Hash::make('123456789'),
                'class' => '10',
                'role' => 'admin',
            ],
            [
                'name' => 'Ahmed',
                'email' => 'student@gmail.com',
                'nin' => '12345678900',
                'password' => Hash::make('123456789'),
                'class' => '10',
                'role' => 'student',
            ],
            [
                'name' => 'Ala',
                'email' => 'student1@gmail.com',
                'nin' => '12345678901',
                'password' => Hash::make('123456789'),
                'class' => '9',
                'role' => 'student',
            ],
            [
                'name' => 'Nabil',
                'email' => 'teacher@gmail.com',
                'nin' => '12345678902',
                'password' => Hash::make('123456789'),
                'role' => 'teacher',
            ],
            [
                'name' => 'Mohamed',
                'email' => 'teacher1@gmail.com',
                'nin' => '12345678903',
                'password' => Hash::make('123456789'),
                'role' => 'teacher',
            ],
        ];

        foreach ($users as $user) {
            User::create($user);
        }
    }
}