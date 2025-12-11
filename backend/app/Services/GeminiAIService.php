<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class GeminiAIService
{
    private $apiKey;
    private $baseUrl = 'https://generativelanguage.googleapis.com/v1beta';
    private $model = null; // Will be auto-detected
    private $availableModels = []; // Cache available models
    
    // Models to try in order (FREE TIER ONLY - verified working models)
    // Based on: https://ai.google.dev/pricing and https://ai.google.dev/gemini-api/docs/models
    // IMPORTANT: Only use free tier models to avoid quota errors
    private $modelsToTry = [
        'gemini-2.0-flash-lite', // Free tier - newest, completely free
        'gemini-1.5-flash',      // Free tier - 15 requests/minute, 1,500 requests/day (faster)
        'gemini-pro',            // Free tier - 60 requests/minute, 1,500 requests/day (stable)
    ];

    public function __construct()
    {
        $this->apiKey = config('services.gemini.api_key');
        
        if (!$this->apiKey) {
            Log::warning('GEMINI_API_KEY is not set in .env file');
        } else {
            // Auto-detect available model
            $this->detectAvailableModel();
        }
    }
    
    /**
     * Detect available model by trying to list models or test each one
     */
    private function detectAvailableModel()
    {
        if (!empty($this->model)) {
            return $this->model; // Already detected
        }
        
        // Try to list available models first
        try {
            $listUrl = "{$this->baseUrl}/models?key={$this->apiKey}";
            $response = Http::timeout(10)->get($listUrl);
            
            if ($response->successful()) {
                $models = $response->json();
                if (isset($models['models'])) {
                    $modelNames = array_column($models['models'], 'name');
                    $this->availableModels = array_map(function($name) {
                        return str_replace('models/', '', $name);
                    }, $modelNames);
                    
                    Log::info('Available Gemini models detected', [
                        'models' => $this->availableModels
                    ]);
                    
                    // Find first matching FREE TIER model only (STRICTLY exclude premium)
                    foreach ($this->modelsToTry as $modelToTry) {
                        foreach ($this->availableModels as $availableModel) {
                            // STRICTLY skip premium models
                            if (strpos($availableModel, 'gemini-2.5') !== false || 
                                strpos($availableModel, 'gemini-1.5-pro') !== false ||
                                strpos($availableModel, 'gemini-ultra') !== false ||
                                strpos($availableModel, 'gemini-pro-vision') !== false ||
                                strpos($availableModel, 'gemini-2.0-pro') !== false) {
                                continue;
                            }
                            
                            // Only match exact free tier models
                            if ($availableModel === $modelToTry || 
                                $availableModel === $modelToTry . '-latest' ||
                                strpos($availableModel, $modelToTry) === 0) {
                                $this->model = $availableModel;
                                Log::info("Selected FREE TIER model: {$this->model}");
                                return $this->model;
                            }
                        }
                    }
                }
            }
        } catch (\Exception $e) {
            Log::warning('Failed to list models, will try direct calls', [
                'error' => $e->getMessage()
            ]);
        }
        
        // Fallback: try each FREE TIER model directly with a simple test (in order of preference)
        foreach ($this->modelsToTry as $modelToTry) {
            if ($this->testModel($modelToTry)) {
                $this->model = $modelToTry;
                Log::info("Selected FREE TIER model after testing: {$this->model}");
                return $this->model;
            }
        }
        
        // Last resort: use gemini-pro (most stable free tier model)
        $this->model = 'gemini-pro';
        Log::warning("Using default FREE TIER model: {$this->model}");
        return $this->model;
    }
    
    /**
     * Test if a model is available
     */
    private function testModel($model)
    {
        try {
            $url = "{$this->baseUrl}/models/{$model}:generateContent?key={$this->apiKey}";
            $response = Http::timeout(5)->post($url, [
                'contents' => [
                    [
                        'parts' => [
                            ['text' => 'test']
                        ]
                    ]
                ],
                'generationConfig' => [
                    'maxOutputTokens' => 10,
                ]
            ]);
            
            return $response->successful();
        } catch (\Exception $e) {
            return false;
        }
    }

    /**
     * Rule-based task parsing fallback (when AI is not available)
     */
    private function ruleBasedParseTask($text)
    {
        $textLower = strtolower($text);
        
        // Extract title (first sentence or up to 50 chars)
        $title = $text;
        if (strlen($title) > 50) {
            $title = substr($title, 0, 50) . '...';
        }
        
        // Extract priority
        $priority = 'medium';
        $highKeywords = ['urgent', 'khẩn cấp', 'quan trọng', 'important', 'gấp', 'ngay', 'asap', 'cao'];
        $lowKeywords = ['sau', 'later', 'không gấp', 'tùy chọn', 'optional', 'thấp'];
        
        foreach ($highKeywords as $keyword) {
            if (strpos($textLower, $keyword) !== false) {
                $priority = 'high';
                break;
            }
        }
        
        if ($priority === 'medium') {
            foreach ($lowKeywords as $keyword) {
                if (strpos($textLower, $keyword) !== false) {
                    $priority = 'low';
                    break;
                }
            }
        }
        
        // Extract deadline (look for time patterns)
        $deadline = null;
        $timePatterns = [
            '/mai|tomorrow/i',
            '/ngày mai/i',
            '/chiều|afternoon/i',
            '/sáng|morning/i',
            '/tối|evening|night/i',
            '/\d+\s*(giờ|hour|h)/i',
            '/\d+\s*(ngày|day|d)/i',
        ];
        
        foreach ($timePatterns as $pattern) {
            if (preg_match($pattern, $text)) {
                // Simple date calculation (could be improved)
                $deadline = date('Y-m-d\TH:i:s\Z', strtotime('+1 day'));
                break;
            }
        }
        
        // Extract category
        $category = null;
        $categoryKeywords = [
            'Công việc' => ['công việc', 'work', 'job', 'dự án', 'project', 'meeting', 'báo cáo'],
            'Học tập' => ['học', 'study', 'bài tập', 'homework', 'exam', 'thi'],
            'Cá nhân' => ['cá nhân', 'personal'],
            'Mua sắm' => ['mua', 'buy', 'shopping'],
        ];
        
        foreach ($categoryKeywords as $cat => $keywords) {
            foreach ($keywords as $keyword) {
                if (strpos($textLower, $keyword) !== false) {
                    $category = $cat;
                    break 2;
                }
            }
        }
        
        // Extract tags
        $tags = [];
        $commonTags = ['urgent', 'important', 'gấp', 'quan trọng', 'deadline'];
        foreach ($commonTags as $tag) {
            if (strpos($textLower, $tag) !== false) {
                $tags[] = $tag;
            }
        }
        
        return [
            'success' => true,
            'data' => [
                'title' => trim($title),
                'description' => strlen($text) > 50 ? $text : null,
                'priority' => $priority,
                'deadline' => $deadline,
                'category' => $category,
                'tags' => $tags,
            ],
            'confidence' => 0.6, // Lower confidence for rule-based
            'method' => 'rule-based'
        ];
    }

    /**
     * Parse natural language task input
     */
    public function parseTask($text)
    {
        $prompt = "Bạn là một AI assistant giúp phân tích câu nói tiếng Việt để tạo task. 
Hãy phân tích câu sau và trả về JSON với các trường:
- title: Tiêu đề task (bắt buộc)
- description: Mô tả chi tiết (nếu có)
- priority: 'high', 'medium', hoặc 'low' (dựa trên từ khóa như 'urgent', 'quan trọng', 'cao', 'thấp')
- deadline: Ngày giờ deadline dạng ISO 8601 (nếu có, nếu không thì null)
- category: Danh mục task (nếu có thể suy luận)
- tags: Mảng các tags liên quan (nếu có)

Câu cần phân tích: \"{$text}\"

Chỉ trả về JSON, không có text thêm. Nếu không có thông tin thì để null.";

        if (!$this->apiKey) {
            Log::error('GEMINI_API_KEY is not configured');
            return [
                'success' => false,
                'error' => 'Gemini API key is not configured. Please set GEMINI_API_KEY in .env file.'
            ];
        }

        Log::info('Gemini parseTask called', [
            'text_length' => strlen($text),
            'api_key_set' => !empty($this->apiKey),
            'api_key_prefix' => substr($this->apiKey, 0, 10) . '...'
        ]);

        // Ensure model is detected
        if (!$this->model) {
            $this->detectAvailableModel();
        }
        
        try {
            $url = "{$this->baseUrl}/models/{$this->model}:generateContent?key={$this->apiKey}";
            
            Log::info('Sending request to Gemini API', [
                'url' => str_replace($this->apiKey, 'HIDDEN', $url),
                'prompt_length' => strlen($prompt)
            ]);
            
            $requestData = [
                'contents' => [
                    [
                        'parts' => [
                            ['text' => $prompt]
                        ]
                    ]
                ],
                'generationConfig' => [
                    'temperature' => 0.3,
                    'maxOutputTokens' => 1000,
                ]
            ];
            
            Log::info('Gemini API Request Data', [
                'prompt_preview' => substr($prompt, 0, 100) . '...'
            ]);
            
            $startTime = microtime(true);
            $response = Http::timeout(30)->post($url, $requestData);
            $duration = round((microtime(true) - $startTime) * 1000, 2);
            
            Log::info('Gemini API Response received', [
                'status_code' => $response->status(),
                'duration_ms' => $duration,
                'successful' => $response->successful()
            ]);

            if ($response->successful()) {
                $content = $response->json();
                
                Log::info('Gemini API Response Content', [
                    'has_error' => isset($content['error']),
                    'has_candidates' => isset($content['candidates']),
                    'candidates_count' => isset($content['candidates']) ? count($content['candidates']) : 0
                ]);
                
                // Check for errors in response
                if (isset($content['error'])) {
                    Log::error('Gemini API Error Response', [
                        'error' => $content['error'],
                        'full_response' => $content
                    ]);
                    return [
                        'success' => false,
                        'error' => $content['error']['message'] ?? 'Gemini API returned an error'
                    ];
                }
                
                $text = $content['candidates'][0]['content']['parts'][0]['text'] ?? '';
                
                Log::info('Extracted text from response', [
                    'text_length' => strlen($text),
                    'text_preview' => substr($text, 0, 200) . '...'
                ]);
                
                if (empty($text)) {
                    Log::error('Gemini API returned empty response', [
                        'response' => $content,
                        'response_keys' => array_keys($content)
                    ]);
                    return [
                        'success' => false,
                        'error' => 'Empty response from Gemini API'
                    ];
                }
                
                // Extract JSON from response
                $jsonMatch = preg_match('/\{.*\}/s', $text, $matches);
                Log::info('JSON extraction attempt', [
                    'match_found' => $jsonMatch,
                    'matches_count' => $jsonMatch ? count($matches) : 0
                ]);
                
                if ($jsonMatch) {
                    $parsed = json_decode($matches[0], true);
                    
                    Log::info('JSON decode result', [
                        'json_error' => json_last_error(),
                        'json_error_msg' => json_last_error_msg(),
                        'parsed_keys' => $parsed ? array_keys($parsed) : []
                    ]);
                    
                    if (json_last_error() !== JSON_ERROR_NONE) {
                        Log::error('Failed to parse JSON from Gemini response', [
                            'text' => $text,
                            'matched_text' => $matches[0],
                            'json_error' => json_last_error_msg()
                        ]);
                        return [
                            'success' => false,
                            'error' => 'Failed to parse JSON response: ' . json_last_error_msg()
                        ];
                    }
                    
                    Log::info('Successfully parsed task from Gemini', [
                        'parsed_data' => $parsed
                    ]);
                    
                    return [
                        'success' => true,
                        'data' => $parsed,
                        'confidence' => 0.9
                    ];
                } else {
                    Log::error('No JSON found in Gemini response', [
                        'text' => $text,
                        'text_length' => strlen($text)
                    ]);
                    return [
                        'success' => false,
                        'error' => 'No valid JSON found in response'
                    ];
                }
            } else {
                $statusCode = $response->status();
                $errorBody = $response->body();
                $errorJson = $response->json();
                
                Log::error("Gemini API HTTP Error: {$statusCode}", [
                    'status_code' => $statusCode,
                    'response_body' => $errorBody,
                    'response_json' => $errorJson,
                    'url' => str_replace($this->apiKey, 'HIDDEN', $url),
                    'base_url' => $this->baseUrl,
                    'model' => $this->model
                ]);
                
                // If 429 (Quota exceeded), try other FREE TIER models
                if ($statusCode === 429) {
                    Log::warning('Quota exceeded', [
                        'current_model' => $this->model,
                        'error_message' => $errorJson['error']['message'] ?? 'Quota exceeded'
                    ]);
                    
                    // Check if current model is premium (shouldn't happen but just in case)
                    $isPremiumModel = strpos($this->model, 'gemini-2.5') !== false || 
                                     strpos($this->model, 'gemini-1.5-pro') !== false ||
                                     strpos($this->model, 'gemini-ultra') !== false ||
                                     strpos($this->model, 'gemini-2.0-pro') !== false;
                    
                    if ($isPremiumModel) {
                        Log::warning('Premium model detected, switching to free tier');
                        $freeTierModels = $this->modelsToTry; // Try all free tier models
                    } else {
                        // Already using free tier, try other free tier models
                        $freeTierModels = array_filter($this->modelsToTry, function($m) {
                            return $m !== $this->model;
                        });
                    }
                    
                    foreach ($freeTierModels as $freeModel) {
                        $freeUrl = str_replace("/models/{$this->model}:", "/models/{$freeModel}:", $url);
                        Log::info("Trying FREE TIER model: {$freeModel}");
                        
                        try {
                            $freeResponse = Http::timeout(30)->post($freeUrl, $requestData);
                            
                            if ($freeResponse->successful()) {
                                Log::info("FREE TIER model {$freeModel} worked!");
                                $content = $freeResponse->json();
                                
                                if (isset($content['error'])) {
                                    continue;
                                }
                                
                                $text = $content['candidates'][0]['content']['parts'][0]['text'] ?? '';
                                
                                if (!empty($text)) {
                                    $jsonMatch = preg_match('/\{.*\}/s', $text, $matches);
                                    if ($jsonMatch) {
                                        $parsed = json_decode($matches[0], true);
                                        if (json_last_error() === JSON_ERROR_NONE) {
                                            // Update model for future use
                                            $this->model = $freeModel;
                                            return [
                                                'success' => true,
                                                'data' => $parsed,
                                                'confidence' => 0.9
                                            ];
                                        }
                                    }
                                }
                            }
                        } catch (\Exception $e) {
                            Log::warning("FREE TIER model {$freeModel} failed", [
                                'error' => $e->getMessage()
                            ]);
                            continue;
                        }
                    }
                    
                    // If all free tier models fail, check if it's a "limit: 0" error (free tier not activated)
                    $hasLimitZero = false;
                    if ($errorJson && isset($errorJson['error']['message'])) {
                        $errorMsg = $errorJson['error']['message'];
                        if (strpos($errorMsg, 'limit: 0') !== false) {
                            $hasLimitZero = true;
                        }
                    }
                    
                    if ($hasLimitZero) {
                        // Free tier not activated - provide helpful message
                        $errorMessage = 'Free tier quota not activated. To enable free tier:';
                        $errorMessage .= "\n1. Link a billing account to your Google Cloud project (no charges for free tier)";
                        $errorMessage .= "\n2. Visit: https://ai.dev/usage?tab=rate-limit to check your quota";
                        $errorMessage .= "\n3. Free tier provides: 60 req/min (gemini-pro) or 15 req/min (gemini-1.5-flash)";
                        
                        Log::error('Free tier not activated (limit: 0)', [
                            'models_tried' => array_values($freeTierModels),
                            'current_model' => $this->model,
                            'error' => $errorJson['error']['message'] ?? 'Quota limit: 0'
                        ]);
                        
                        // Free tier not activated - use rule-based fallback
                        Log::info('Free tier not activated, using rule-based parsing fallback');
                        return $this->ruleBasedParseTask($text);
                    } else {
                        // Quota exceeded but free tier is activated - just wait
                        $errorMessage = 'Quota exceeded for all free tier models. ';
                        if ($errorJson && isset($errorJson['error']['message'])) {
                            $errorMessage = $errorJson['error']['message'];
                        } else {
                            $errorMessage .= 'Please check your API quota at https://ai.dev/usage?tab=rate-limit or wait before retrying.';
                        }
                        
                        Log::error('All free tier models quota exceeded', [
                            'models_tried' => array_values($freeTierModels),
                            'current_model' => $this->model
                        ]);
                        
                        return [
                            'success' => false,
                            'error' => $errorMessage,
                            'quota_exceeded' => true,
                            'suggestion' => 'Please wait a few minutes or check your quota limits. Free tier limits: 60 requests/minute for gemini-pro, 15 requests/minute for gemini-1.5-flash.'
                        ];
                    }
                }
                
                // If 404, try fallback models
                if ($statusCode === 404 && isset($errorJson['error']['message'])) {
                    Log::info('Model not found, trying FREE TIER fallback models', [
                        'current_model' => $this->model
                    ]);
                    
                    // Only try FREE TIER models as fallback (exclude current model)
                    $fallbackModels = array_filter($this->modelsToTry, function($m) {
                        return $m !== $this->model;
                    });
                    
                    foreach ($fallbackModels as $fallbackModel) {
                        $fallbackUrl = str_replace("/models/{$this->model}:", "/models/{$fallbackModel}:", $url);
                        Log::info("Trying fallback model: {$fallbackModel}", [
                            'url' => str_replace($this->apiKey, 'HIDDEN', $fallbackUrl)
                        ]);
                        
                        try {
                            $fallbackResponse = Http::timeout(30)->post($fallbackUrl, $requestData);
                            
                            if ($fallbackResponse->successful()) {
                                Log::info("Fallback model {$fallbackModel} worked!");
                                $content = $fallbackResponse->json();
                                
                                if (isset($content['error'])) {
                                    continue; // Try next fallback
                                }
                                
                                $text = $content['candidates'][0]['content']['parts'][0]['text'] ?? '';
                                
                                if (!empty($text)) {
                                    $jsonMatch = preg_match('/\{.*\}/s', $text, $matches);
                                    if ($jsonMatch) {
                                        $parsed = json_decode($matches[0], true);
                                        if (json_last_error() === JSON_ERROR_NONE) {
                                            return [
                                                'success' => true,
                                                'data' => $parsed,
                                                'confidence' => 0.9
                                            ];
                                        }
                                    }
                                }
                            }
                        } catch (\Exception $e) {
                            Log::warning("Fallback model {$fallbackModel} failed", [
                                'error' => $e->getMessage()
                            ]);
                            continue; // Try next fallback
                        }
                    }
                }
                
                $errorMessage = 'Unknown error';
                if ($errorJson && isset($errorJson['error'])) {
                    $errorMessage = $errorJson['error']['message'] ?? json_encode($errorJson['error']);
                } elseif ($errorBody) {
                    $errorMessage = $errorBody;
                }
                
                return [
                    'success' => false,
                    'error' => "HTTP {$statusCode}: {$errorMessage}"
                ];
            }
        } catch (\Illuminate\Http\Client\ConnectionException $e) {
            Log::error('Gemini API Connection Error: ' . $e->getMessage());
            return [
                'success' => false,
                'error' => 'Connection error: ' . $e->getMessage()
            ];
        } catch (\Exception $e) {
            Log::error('Gemini AI Error: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString()
            ]);
            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }

    /**
     * Suggest priority for a task
     */
    public function suggestPriority($title, $description = null, $deadline = null)
    {
        $deadlineInfo = $deadline ? "Deadline: " . date('Y-m-d H:i', strtotime($deadline)) : "Không có deadline";
        $daysUntilDeadline = $deadline ? ceil((strtotime($deadline) - time()) / 86400) : null;

        $prompt = "Phân tích task sau và đề xuất mức độ ưu tiên (high, medium, low):
Title: {$title}
Description: " . ($description ?? 'Không có') . "
{$deadlineInfo}
" . ($daysUntilDeadline !== null ? "Còn {$daysUntilDeadline} ngày nữa" : "") . "

Trả về JSON:
{
  \"priority\": \"high|medium|low\",
  \"reason\": \"Lý do đề xuất\",
  \"confidence\": 0.0-1.0
}";

        if (!$this->apiKey) {
            return $this->ruleBasedPriority($title, $description, $deadline);
        }

        // Ensure model is detected
        if (!$this->model) {
            $this->detectAvailableModel();
        }
        
        try {
            $url = "{$this->baseUrl}/models/{$this->model}:generateContent?key={$this->apiKey}";
            
            $response = Http::timeout(30)->post($url, [
                'contents' => [
                    [
                        'parts' => [
                            ['text' => $prompt]
                        ]
                    ]
                ],
                'generationConfig' => [
                    'temperature' => 0.2,
                    'maxOutputTokens' => 500,
                ]
            ]);

            if ($response->successful()) {
                $content = $response->json();
                
                if (isset($content['error'])) {
                    Log::error('Gemini Priority API Error: ' . json_encode($content['error']));
                    return $this->ruleBasedPriority($title, $description, $deadline);
                }
                
                $text = $content['candidates'][0]['content']['parts'][0]['text'] ?? '';
                
                if (!empty($text)) {
                    $jsonMatch = preg_match('/\{.*\}/s', $text, $matches);
                    if ($jsonMatch) {
                        $parsed = json_decode($matches[0], true);
                        if (json_last_error() === JSON_ERROR_NONE && isset($parsed['priority'])) {
                            return [
                                'success' => true,
                                'data' => $parsed
                            ];
                        }
                    }
                }
            }

            // Fallback to rule-based
            return $this->ruleBasedPriority($title, $description, $deadline);
        } catch (\Exception $e) {
            Log::error('Gemini Priority Error: ' . $e->getMessage());
            return $this->ruleBasedPriority($title, $description, $deadline);
        }
    }

    /**
     * Rule-based priority fallback
     */
    private function ruleBasedPriority($title, $description, $deadline)
    {
        $text = strtolower($title . ' ' . ($description ?? ''));
        $daysUntilDeadline = $deadline ? ceil((strtotime($deadline) - time()) / 86400) : null;

        $highKeywords = ['urgent', 'khẩn cấp', 'quan trọng', 'important', 'gấp', 'ngay', 'asap'];
        $lowKeywords = ['sau', 'later', 'không gấp', 'tùy chọn', 'optional'];

        $hasHighKeyword = false;
        $hasLowKeyword = false;

        foreach ($highKeywords as $keyword) {
            if (strpos($text, $keyword) !== false) {
                $hasHighKeyword = true;
                break;
            }
        }

        foreach ($lowKeywords as $keyword) {
            if (strpos($text, $keyword) !== false) {
                $hasLowKeyword = true;
                break;
            }
        }

        $priority = 'medium';
        $reason = 'Mức độ ưu tiên trung bình';

        if ($hasHighKeyword || ($daysUntilDeadline !== null && $daysUntilDeadline <= 1)) {
            $priority = 'high';
            $reason = 'Có từ khóa ưu tiên cao hoặc deadline gần';
        } elseif ($hasLowKeyword || ($daysUntilDeadline !== null && $daysUntilDeadline > 7)) {
            $priority = 'low';
            $reason = 'Có từ khóa ưu tiên thấp hoặc deadline xa';
        } elseif ($daysUntilDeadline !== null && $daysUntilDeadline <= 3) {
            $priority = 'high';
            $reason = 'Deadline trong 3 ngày';
        }

        return [
            'success' => true,
            'data' => [
                'priority' => $priority,
                'reason' => $reason,
                'confidence' => 0.7
            ]
        ];
    }

    /**
     * Auto-categorize and suggest tags
     */
    public function categorizeAndTag($title, $description = null)
    {
        $prompt = "Phân tích task sau và đề xuất:
1. Category (danh mục): Chọn một trong các danh mục phổ biến như: Công việc, Học tập, Cá nhân, Mua sắm, Sức khỏe, Du lịch, Tài chính, Gia đình, Giải trí, Khác
2. Tags: Mảng các tags liên quan (tối đa 5 tags)

Title: {$title}
Description: " . ($description ?? 'Không có') . "

Trả về JSON:
{
  \"category\": \"Tên danh mục\",
  \"tags\": [\"tag1\", \"tag2\", ...],
  \"confidence\": 0.0-1.0
}";

        if (!$this->apiKey) {
            return $this->keywordBasedCategorization($title, $description);
        }

        // Ensure model is detected
        if (!$this->model) {
            $this->detectAvailableModel();
        }

        // Ensure model is detected
        if (!$this->model) {
            $this->detectAvailableModel();
        }
        
        try {
            $url = "{$this->baseUrl}/models/{$this->model}:generateContent?key={$this->apiKey}";
            
            $response = Http::timeout(30)->post($url, [
                'contents' => [
                    [
                        'parts' => [
                            ['text' => $prompt]
                        ]
                    ]
                ],
                'generationConfig' => [
                    'temperature' => 0.3,
                    'maxOutputTokens' => 500,
                ]
            ]);

            if ($response->successful()) {
                $content = $response->json();
                
                if (isset($content['error'])) {
                    Log::error('Gemini Categorization API Error: ' . json_encode($content['error']));
                    return $this->keywordBasedCategorization($title, $description);
                }
                
                $text = $content['candidates'][0]['content']['parts'][0]['text'] ?? '';
                
                if (!empty($text)) {
                    $jsonMatch = preg_match('/\{.*\}/s', $text, $matches);
                    if ($jsonMatch) {
                        $parsed = json_decode($matches[0], true);
                        if (json_last_error() === JSON_ERROR_NONE && isset($parsed['category'])) {
                            return [
                                'success' => true,
                                'data' => $parsed
                            ];
                        }
                    }
                }
            }

            // Fallback to keyword-based
            return $this->keywordBasedCategorization($title, $description);
        } catch (\Exception $e) {
            Log::error('Gemini Categorization Error: ' . $e->getMessage());
            return $this->keywordBasedCategorization($title, $description);
        }
    }

    /**
     * Keyword-based categorization fallback
     */
    private function keywordBasedCategorization($title, $description)
    {
        $text = strtolower($title . ' ' . ($description ?? ''));
        
        $categories = [
            'Công việc' => ['công việc', 'work', 'job', 'dự án', 'project', 'meeting', 'báo cáo', 'report'],
            'Học tập' => ['học', 'study', 'bài tập', 'homework', 'exam', 'thi', 'đề thi'],
            'Cá nhân' => ['cá nhân', 'personal', 'riêng tư'],
            'Mua sắm' => ['mua', 'buy', 'shopping', 'mua sắm'],
            'Sức khỏe' => ['sức khỏe', 'health', 'bác sĩ', 'doctor', 'khám'],
            'Du lịch' => ['du lịch', 'travel', 'trip', 'vacation'],
            'Tài chính' => ['tài chính', 'finance', 'tiền', 'money', 'bill', 'hóa đơn'],
            'Gia đình' => ['gia đình', 'family', 'con', 'bố', 'mẹ'],
        ];

        $category = 'Khác';
        $tags = [];
        $confidence = 0.6;

        foreach ($categories as $cat => $keywords) {
            foreach ($keywords as $keyword) {
                if (strpos($text, $keyword) !== false) {
                    $category = $cat;
                    $tags[] = $keyword;
                    $confidence = 0.8;
                    break 2;
                }
            }
        }

        // Extract additional tags from text
        $commonTags = ['urgent', 'important', 'gấp', 'quan trọng', 'deadline', 'hạn chót'];
        foreach ($commonTags as $tag) {
            if (strpos($text, $tag) !== false && !in_array($tag, $tags)) {
                $tags[] = $tag;
            }
        }

        return [
            'success' => true,
            'data' => [
                'category' => $category,
                'tags' => array_slice($tags, 0, 5),
                'confidence' => $confidence
            ]
        ];
    }

    /**
     * Break down task into subtasks
     */
    public function breakDownTask($title, $description)
    {
        $prompt = "Chia nhỏ task sau thành các subtasks cụ thể, có thể thực hiện được:

Title: {$title}
Description: {$description}

Trả về JSON với mảng subtasks:
{
  \"subtasks\": [
    {
      \"title\": \"Tên subtask\",
      \"description\": \"Mô tả ngắn\",
      \"estimated_hours\": số giờ ước tính
    }
  ]
}";

        if (!$this->apiKey) {
            return [
                'success' => false,
                'error' => 'Gemini API key is not configured'
            ];
        }

        // Ensure model is detected
        if (!$this->model) {
            $this->detectAvailableModel();
        }

        // Ensure model is detected
        if (!$this->model) {
            $this->detectAvailableModel();
        }
        
        try {
            $url = "{$this->baseUrl}/models/{$this->model}:generateContent?key={$this->apiKey}";
            
            $response = Http::timeout(30)->post($url, [
                'contents' => [
                    [
                        'parts' => [
                            ['text' => $prompt]
                        ]
                    ]
                ],
                'generationConfig' => [
                    'temperature' => 0.4,
                    'maxOutputTokens' => 2000,
                ]
            ]);

            if ($response->successful()) {
                $content = $response->json();
                
                if (isset($content['error'])) {
                    Log::error('Gemini Breakdown API Error: ' . json_encode($content['error']));
                    return [
                        'success' => false,
                        'error' => $content['error']['message'] ?? 'Gemini API returned an error'
                    ];
                }
                
                $text = $content['candidates'][0]['content']['parts'][0]['text'] ?? '';
                
                if (!empty($text)) {
                    $jsonMatch = preg_match('/\{.*\}/s', $text, $matches);
                    if ($jsonMatch) {
                        $parsed = json_decode($matches[0], true);
                        if (json_last_error() === JSON_ERROR_NONE && isset($parsed['subtasks'])) {
                            return [
                                'success' => true,
                                'data' => $parsed
                            ];
                        }
                    }
                }
            } else {
                $statusCode = $response->status();
                $errorBody = $response->body();
                Log::error("Gemini Breakdown API HTTP Error: {$statusCode}", [
                    'response' => $errorBody
                ]);
            }

            return [
                'success' => false,
                'error' => 'Failed to break down task'
            ];
        } catch (\Illuminate\Http\Client\ConnectionException $e) {
            Log::error('Gemini Breakdown Connection Error: ' . $e->getMessage());
            return [
                'success' => false,
                'error' => 'Connection error: ' . $e->getMessage()
            ];
        } catch (\Exception $e) {
            Log::error('Gemini Breakdown Error: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString()
            ]);
            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }
}

