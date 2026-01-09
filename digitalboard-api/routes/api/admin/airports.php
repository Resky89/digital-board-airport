<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Admin\AirportController as AdminAirportController;

Route::apiResource('airports', AdminAirportController::class)->parameters([
    'airports' => 'airport'
]);
