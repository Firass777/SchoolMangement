<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\PerformancePrediction;
use Illuminate\Support\Facades\Log;

class PredictionController extends Controller
{
    public function predict(Request $request)
    {
        $nin = $request->query('nin');

        if (!$nin) {
            return response()->json(['error' => 'Student NIN is required'], 400);
        }

        try {
            // Execute Python script to get the latest prediction
            $command = escapeshellcmd("python ../ML/predict.py {$nin}");
            $output = shell_exec($command);
            
            // Decode the JSON output
            $predictionData = json_decode($output, true);
            
            // Check if prediction is valid
            if (isset($predictionData['error'])) {
                return response()->json(['error' => $predictionData['error']], 500);
            }
            
            if (isset($predictionData['prediction'])) {
                // Store or update prediction in the database
                PerformancePrediction::updateOrCreate(
                    ['student_nin' => $nin], // Find by student_nin
                    ['prediction' => $predictionData['prediction']] // Update or create with new prediction
                );
                
                return response()->json(['prediction' => $predictionData['prediction']]);
            }
            
            return response()->json(['error' => 'No prediction data received'], 500);
            
        } catch (\Exception $e) {
            Log::error("Prediction failed for NIN {$nin}: " . $e->getMessage());
            return response()->json(['error' => 'Prediction failed'], 500);
        }
    }
}