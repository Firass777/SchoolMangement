<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Tymon\JWTAuth\Facades\JWTAuth;
use App\Models\User;
use Illuminate\Support\Facades\Log;

class RoleCheckController extends Controller
{
    public function getUserRole(Request $request)
    {
        try {
            // Get token from Authorization header, query string, or request body
            $token = $request->bearerToken() ?? $request->query('token') ?? $request->input('token');

            if (!$token) {
                Log::warning('No token provided for /api/user-role');
                return response()->json([
                    'status' => 'error',
                    'message' => 'Token not provided'
                ], 400);
            }

            // Decode the token to get the payload
            $payload = JWTAuth::setToken($token)->getPayload();

            // Extract the 'sub' (user ID) from the payload
            $userId = $payload['sub'];

            // Fetch the user from the database
            $user = User::find($userId);

            if (!$user) {
                Log::warning("User not found for ID: {$userId}");
                return response()->json([
                    'status' => 'error',
                    'message' => 'User not found'
                ], 404);
            }

            // Return the user's role
            return response()->json([
                'status' => 'success',
                'role' => $user->role
            ], 200);

        } catch (\Tymon\JWTAuth\Exceptions\TokenInvalidException $e) {
            Log::error('Invalid token provided: ' . $e->getMessage());
            return response()->json([
                'status' => 'error',
                'message' => 'Invalid token'
            ], 401);
        } catch (\Tymon\JWTAuth\Exceptions\TokenExpiredException $e) {
            Log::error('Token expired: ' . $e->getMessage());
            return response()->json([
                'status' => 'error',
                'message' => 'Token expired'
            ], 401);
        } catch (\Tymon\JWTAuth\Exceptions\JWTException $e) {
            Log::error('JWT error: ' . $e->getMessage());
            return response()->json([
                'status' => 'error',
                'message' => 'Token malformed or invalid'
            ], 400);
        } catch (\Exception $e) {
            Log::error('Unexpected error in RoleCheckController: ' . $e->getMessage());
            return response()->json([
                'status' => 'error',
                'message' => 'An error occurred'
            ], 500);
        }
    }
}