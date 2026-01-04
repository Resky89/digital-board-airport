<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return response()->json([
        'success' => true,
        'message' => 'OK',
        'service' => 'digitalboard-api',
        'timestamp' => now()->toIso8601String(),
    ]);
});
