<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Services\GeminiAIService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class AIController extends Controller
{
    protected $geminiService;

    public function __construct(GeminiAIService $geminiService)
    {
        $this->geminiService = $geminiService;
    }

    /**
     * Parse natural language task input
     */
    public function parseTask(Request $request)
    {
        \Log::info('AIController::parseTask called', [
            'request_data' => $request->all(),
            'text_length' => strlen($request->text ?? ''),
            'user_id' => auth()->id()
        ]);

        $validator = Validator::make($request->all(), [
            'text' => 'required|string|max:1000',
        ]);

        if ($validator->fails()) {
            \Log::warning('AIController::parseTask validation failed', [
                'errors' => $validator->errors()->toArray()
            ]);
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            \Log::info('Calling GeminiAIService::parseTask');
            $result = $this->geminiService->parseTask($request->text);
            \Log::info('GeminiAIService::parseTask result', [
                'success' => $result['success'] ?? false,
                'has_data' => isset($result['data']),
                'error' => $result['error'] ?? null
            ]);

            if ($result['success']) {
                $response = [
                    'success' => true,
                    'data' => $result['data'],
                    'confidence' => $result['confidence'] ?? 0.8
                ];
                
                // Include method info if available
                if (isset($result['method'])) {
                    $response['method'] = $result['method']; // 'ai' or 'rule-based'
                }
                
                // Include warnings if available
                if (isset($result['warning'])) {
                    $response['warning'] = $result['warning'];
                }
                
                return response()->json($response);
            }

            $statusCode = 500;
            if (isset($result['quota_exceeded']) && $result['quota_exceeded']) {
                $statusCode = 429; // Too Many Requests
            }
            
            return response()->json([
                'success' => false,
                'error' => $result['error'] ?? 'Failed to parse task',
                'message' => $result['error'] ?? 'Failed to parse task',
                'quota_exceeded' => $result['quota_exceeded'] ?? false
            ], $statusCode);
        } catch (\Exception $e) {
            \Log::error('AIController parseTask exception: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'success' => false,
                'error' => 'Internal server error: ' . $e->getMessage(),
                'message' => 'An error occurred while parsing the task'
            ], 500);
        }
    }

    /**
     * Suggest priority for a task
     */
    public function suggestPriority(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'description' => 'nullable|string|max:2000',
            'deadline' => 'nullable|date',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $result = $this->geminiService->suggestPriority(
            $request->title,
            $request->description,
            $request->deadline
        );

        if ($result['success']) {
            return response()->json([
                'success' => true,
                'data' => $result['data']
            ]);
        }

        return response()->json([
            'success' => false,
            'error' => 'Failed to suggest priority'
        ], 500);
    }

    /**
     * Auto-categorize and suggest tags
     */
    public function categorizeAndTag(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'description' => 'nullable|string|max:2000',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $result = $this->geminiService->categorizeAndTag(
            $request->title,
            $request->description
        );

        if ($result['success']) {
            return response()->json([
                'success' => true,
                'data' => $result['data']
            ]);
        }

        return response()->json([
            'success' => false,
            'error' => 'Failed to categorize task'
        ], 500);
    }

    /**
     * Break down task into subtasks
     */
    public function breakDownTask(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'description' => 'required|string|max:2000',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $result = $this->geminiService->breakDownTask(
            $request->title,
            $request->description
        );

        if ($result['success']) {
            return response()->json([
                'success' => true,
                'data' => $result['data']
            ]);
        }

        return response()->json([
            'success' => false,
            'error' => $result['error'] ?? 'Failed to break down task'
        ], 500);
    }
}

