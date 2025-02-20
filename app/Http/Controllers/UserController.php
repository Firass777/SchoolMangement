<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;

class UserController extends Controller
{
    // This method will return all users
    public function index()
    {
        $users = User::all(); // Get all users
        return response()->json($users); // Return users as JSON
    }
}
