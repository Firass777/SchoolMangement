<?php


namespace Database\Seeders;

use App\Models\Notification;
use Illuminate\Database\Seeder;

class NotificationSeeder extends Seeder
{
    public function run()
    {
        $notifications = [
            [
                'to' => 'student1@gmail.com',
                'title' => 'New Grade Posted',
                'description' => 'Your grade for Mathematics has been posted.',
            ],
            [
                'to' => 'student@gmail.com',
                'title' => 'Event Reminder',
                'description' => 'Don\'t forget the school assembly tomorrow.',
            ],

            [
                'to' => 'student1@gmail.com',
                'title' => 'Time Table updated',
                'description' => 'Your Timetable is updated.',
            ],
            [
                'to' => 'student@gmail.com',
                'title' => 'Class Cancled',
                'description' => 'French teacher is absent ! class is cancled today',
            ],

            [
                'to' => 'teacher@gmail.com',
                'title' => 'Meeting Reminder',
                'description' => 'This is a reminder for tomorrow meeting',
            ],

            [
                'to' => 'teacher1@gmail.com',
                'title' => 'Time Table updated',
                'description' => 'Your Class on Monday is moved to Friday morning please check your time table',
            ],

        ];

        foreach ($notifications as $notification) {
            Notification::create($notification);
        }
    }
}