<?php

/**
 * Test script to find available Gemini models
 * Run: php test-gemini-models.php
 */

require __DIR__ . '/vendor/autoload.php';

$apiKey = getenv('GEMINI_API_KEY') ?: (file_exists(__DIR__ . '/.env') ? 
    parse_ini_file(__DIR__ . '/.env')['GEMINI_API_KEY'] ?? '' : '');

if (empty($apiKey)) {
    echo "❌ GEMINI_API_KEY not found in environment or .env file\n";
    exit(1);
}

echo "🔍 Testing Gemini API models...\n\n";

$baseUrls = [
    'v1beta' => 'https://generativelanguage.googleapis.com/v1beta',
    'v1' => 'https://generativelanguage.googleapis.com/v1',
];

$models = [
    'gemini-1.5-flash',
    'gemini-1.5-pro',
    'gemini-pro',
    'gemini-1.0-pro',
];

$testPrompt = 'Hello, test';

foreach ($baseUrls as $version => $baseUrl) {
    echo "📡 Testing API version: {$version}\n";
    echo str_repeat('-', 50) . "\n";
    
    foreach ($models as $model) {
        $url = "{$baseUrl}/models/{$model}:generateContent?key={$apiKey}";
        
        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
            'contents' => [
                [
                    'parts' => [
                        ['text' => $testPrompt]
                    ]
                ]
            ]
        ]));
        curl_setopt($ch, CURLOPT_TIMEOUT, 10);
        
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        
        if ($httpCode === 200) {
            echo "✅ {$model} - WORKS!\n";
            $data = json_decode($response, true);
            if (isset($data['candidates'][0]['content']['parts'][0]['text'])) {
                echo "   Response: " . substr($data['candidates'][0]['content']['parts'][0]['text'], 0, 50) . "...\n";
            }
        } elseif ($httpCode === 404) {
            echo "❌ {$model} - NOT FOUND (404)\n";
        } else {
            $error = json_decode($response, true);
            $errorMsg = $error['error']['message'] ?? 'Unknown error';
            echo "⚠️  {$model} - HTTP {$httpCode}: {$errorMsg}\n";
        }
    }
    
    echo "\n";
}

echo "✅ Test completed!\n";
echo "\n💡 Recommendation: Use the model that shows ✅ for your preferred API version.\n";


