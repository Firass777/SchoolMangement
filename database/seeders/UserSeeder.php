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
                'password' => Hash::make('12345678900'),
                'role' => 'admin',
            ],
            [
                'name' => 'Ahmed',
                'email' => 'student@gmail.com',
                'nin' => '12345678900',
                'password' => Hash::make('12345678901'),
                'class' => '10',
                'role' => 'student',
            ],
            [
                'name' => 'Sofia',
                'email' => 'student1@gmail.com',
                'nin' => '12345678901',
                'password' => Hash::make('12345678902'),
                'class' => '9',
                'role' => 'student',
            ],
            [
                'name' => 'Nabil',
                'email' => 'teacher@gmail.com',
                'nin' => '12345678902',
                'password' => Hash::make('12345678903'),
                'role' => 'teacher',
            ],
            [
                'name' => 'Mohamed',
                'email' => 'teacher1@gmail.com',
                'nin' => '12345678903',
                'password' => Hash::make('12345678904'),
                'role' => 'teacher',
            ],
            [
                'name' => 'Mohamed Ali',
                'email' => 'student2@gmail.com',
                'nin' => '12345678904',
                'password' => Hash::make('12345678905'),
                'class' => '11',
                'role' => 'student',
            ],
            [
                'name' => 'Lina',
                'email' => 'student3@gmail.com',
                'nin' => '12345678905',
                'password' => Hash::make('12345678906'),
                'class' => '12',
                'role' => 'student',
            ],
            [
                'name' => 'Fatima',
                'email' => 'teacher2@gmail.com',
                'nin' => '12345678912',
                'password' => Hash::make('12345678907'),
                'role' => 'teacher',
            ],
            [
                'name' => 'Hasna',
                'email' => 'parent@gmail.com',
                'nin' => '12345678914',
                'password' => Hash::make('12345678908'),
                'role' => 'parent',
            ],
            [
                'name' => 'Ala',
                'email' => 'parent1@gmail.com',
                'nin' => '12345678915',
                'password' => Hash::make('12345678909'),
                'role' => 'parent',
            ],
        ];

        foreach ($users as $user) {
            User::create($user);
        }
    }
}