<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Session;
use Illuminate\Support\Facades\Validator;
use Tymon\JWTAuth\Facades\JWTAuth;

class UsersController extends Controller
{
    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'nin' => 'required|string|size:11|unique:users,nin',
            'password' => 'required|string|min:8|max:12',
            'role' => 'required|string|in:student,teacher,admin,parent',
            'class' => 'nullable|string|required_if:role,student', // Add this line
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $userData = [
            'name' => $request->name,
            'email' => $request->email,
            'nin' => $request->nin,
            'password' => Hash::make($request->password),
            'role' => $request->role,
        ];

        // Only add class if the role is student
        if ($request->role === 'student') {
            $userData['class'] = $request->class;
        }

        $user = User::create($userData);

        $token = JWTAuth::fromUser($user);

        return response()->json([
            'message' => 'User registered successfully',
            'user' => $user,
            'token' => $token
        ], 201);
    }

    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required|min:8|max:12',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user) {
            return response()->json(['error' => 'Invalid email address'], 401);
        } elseif (!Hash::check($request->password, $user->password)) {
            return response()->json(['error' => 'Incorrect password'], 401);
        }

        $token = JWTAuth::fromUser($user);

        return response()->json([
            'message' => 'Login successful',
            'token' => $token,
            'user' => $user->makeHidden(['password', 'created_at', 'updated_at']),
            'role' => $user->role,
        ]);
    }

    public function dashboard(Request $request)
    {
        try {
            $user = JWTAuth::parseToken()->authenticate();
        } catch (\Tymon\JWTAuth\Exceptions\TokenExpiredException $e) {
            return response()->json(['error' => 'Token is expired'], 401);
        } catch (\Tymon\JWTAuth\Exceptions\TokenInvalidException $e) {
            return response()->json(['error' => 'Token is invalid'], 401);
        } catch (\Tymon\JWTAuth\Exceptions\JWTException $e) {
            return response()->json(['error' => 'Token not provided'], 401);
        }

        return response()->json([
            'user' => $user,
            'message' => 'Welcome to your dashboard'
        ]);
    }

    public function logout(Request $request)
    {
        try {
            $token = JWTAuth::getToken();

            if (!$token) {
                return response()->json(['error' => 'Token not provided'], 401);
            }

            JWTAuth::invalidate($token);

            return response()->json(['message' => 'Logged out successfully']);
        } catch (\Tymon\JWTAuth\Exceptions\JWTException $e) {
            return response()->json(['error' => 'Failed to log out'], 500);
        }
    }

    // This method will return all users
    public function index()
    {
        $users = User::all();
        return response()->json($users);
    }

    public function totalStudents()
    {
        $total = User::count();
        return response()->json(['total' => $total]);
    }

    public function update(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|email|unique:users,email,' . $id,
            'nin' => 'sometimes|string|size:11|unique:users,nin,' . $id,
            'password' => 'sometimes|string|min:8|max:12',
            'role' => 'sometimes|string|in:student,teacher,admin,parent',
            'class' => 'nullable|string|required_if:role,student', 
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user = User::find($id);
        if (!$user) {
            return response()->json(['error' => 'User not found'], 404);
        }

        if ($request->has('name')) {
            $user->name = $request->name;
        }
        if ($request->has('email')) {
            $user->email = $request->email;
        }
        if ($request->has('nin')) {
            $user->nin = $request->nin;
        }
        if ($request->has('password')) {
            $user->password = Hash::make($request->password);
        }
        if ($request->has('role')) {
            $user->role = $request->role;
        }
        if ($request->has('class') && $request->role === 'student') {
            $user->class = $request->class;
        } elseif ($request->role !== 'student') {
            $user->class = null; // Clear class if role is not student
        }

        $user->save();

        return response()->json(['message' => 'User updated successfully', 'user' => $user]);
    }

    // Delete a user
    public function destroy($id)
    {
        $user = User::find($id);
        if (!$user) {
            return response()->json(['error' => 'User not found'], 404);
        }

        $user->delete();

        return response()->json(['message' => 'User deleted successfully']);
    }

    public function getLatestStudents()
    {
        $students = User::where('role', 'student')->latest()->take(3)->get();

        if ($students->isEmpty()) {
            return response()->json(['message' => 'No students found.'], 404);
        }

        return response()->json(['message' => 'Latest students retrieved successfully.', 'students' => $students], 200);
    }

    public function getLatestTeachers()
    {
        $teachers = User::where('role', 'teacher')->latest()->take(3)->get();

        if ($teachers->isEmpty()) {
            return response()->json(['message' => 'No teachers found.'], 404);
        }

        return response()->json(['message' => 'Latest teachers retrieved successfully.', 'teachers' => $teachers], 200);
    }
}