<?php

namespace App\Http\Controllers;

use App\Models\Document;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;

class DocumentController extends Controller
{
    public function index()
    {
        try {
            $documents = Document::with('prediction')
                ->orderBy('created_at', 'desc')
                ->get()
                ->map(function ($document) {
                    $prediction = $document->prediction ? [
                        'category' => $document->prediction->predicted_category,
                        'confidence' => round($document->prediction->confidence_score * 100),
                        'processed_at' => optional($document->prediction->created_at)->format('Y-m-d H:i'),
                        'status' => $document->prediction->confidence_score >= 0.5 
                            ? 'confirmed' 
                            : ($document->prediction->confidence_score > 0 ? 'pending' : 'processing')
                    ] : null;
    
                    return [
                        'id' => $document->id,
                        'file_name' => $document->file_name,
                        'url' => Storage::url($document->file_path),
                        'uploaded_by' => $document->uploaded_by,
                        'uploaded_at' => $document->created_at->format('Y-m-d H:i'),
                        'prediction' => $prediction
                    ];
                });
    
            return response()->json([
                'success' => true,
                'documents' => $documents
            ]);
    
        } catch (\Exception $e) {
            Log::error("Document fetch failed: " . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch documents'
            ], 500);
        }
    }

    public function upload(Request $request)
    {
        $request->validate([
            'document' => 'required|file|mimes:pdf|max:10240',
            'uploaded_by' => 'required|string|max:100'
        ]);

        try {
            $file = $request->file('document');
            $path = $file->store('documents', 'public');
            
            $document = Document::create([
                'file_name' => $file->getClientOriginalName(),
                'file_path' => $path,
                'uploaded_by' => $request->uploaded_by
            ]);

            $this->classifyDocument($document->id);
            
            return response()->json([
                'success' => true,
                'message' => 'Document uploaded and processing started',
                'document' => $document
            ]);

        } catch (\Exception $e) {
            Log::error("Document upload failed: " . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Document upload failed: ' . $e->getMessage()
            ], 500);
        }
    }

    protected function classifyDocument($documentId)
    {
        try {
            $pythonPath = config('app.python_path', 'python'); 
            $scriptPath = base_path('ML/classify_document.py');
            $command = $pythonPath . ' ' . escapeshellarg($scriptPath) . ' ' . escapeshellarg($documentId);
            $output = shell_exec($command . ' 2>&1');
            Log::info("Classification output", ['command' => $command, 'output' => $output]);
            $predictionData = json_decode($output, true);
            if (isset($predictionData['error'])) {
                Log::error("Classification failed: " . $predictionData['error']);
                return false;
            }
            $document = Document::find($documentId);
            if ($document) {
                $document->prediction()->create([
                    'predicted_category' => $predictionData['category'],
                    'confidence_score' => $predictionData['confidence']
                ]);
            }
            return true;
        } catch (\Exception $e) {
            Log::error("Classification error: " . $e->getMessage());
            return false;
        }
    }

    public function download($id)
    {
        try {
            $document = Document::findOrFail($id);
            $filePath = storage_path('app/public/' . $document->file_path);
            if (!file_exists($filePath)) {
                throw new \Exception("File not found");
            }
            return response()->download($filePath, $document->file_name);
        } catch (\Exception $e) {
            Log::error("Document download failed: " . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Document download failed'
            ], 404);
        }
    }

    public function delete($id)
    {
        try {
            $document = Document::findOrFail($id);
            Storage::delete('public/' . $document->file_path);
            $document->delete();
            return response()->json([
                'success' => true,
                'message' => 'Document deleted successfully'
            ]);
        } catch (\Exception $e) {
            Log::error("Document deletion failed: " . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Document deletion failed'
            ], 500);
        }
    }
}
