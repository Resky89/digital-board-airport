<?php

use Illuminate\Support\Facades\Route;

require __DIR__.'/api/public/flights.php';

Route::prefix('admin')->group(function () {
    require __DIR__.'/api/admin/auth_public.php';

    Route::middleware('auth.jwt')->group(function () {
        require __DIR__.'/api/admin/auth_protected.php';
        require __DIR__.'/api/admin/flights.php';
        require __DIR__.'/api/admin/countries.php';
        require __DIR__.'/api/admin/cities.php';
        require __DIR__.'/api/admin/airlines.php';
        require __DIR__.'/api/admin/airports.php';
        require __DIR__.'/api/admin/terminals.php';
        require __DIR__.'/api/admin/gates.php';
        require __DIR__.'/api/admin/flight_statuses.php';
        require __DIR__.'/api/admin/users.php';
    });
});

Route::fallback(function () {
    return response()->json([
        'success' => false,
        'message' => 'Not Found',
    ], 404);
});
