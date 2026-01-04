<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\FlightController;

Route::get('flights', [FlightController::class, 'index']);
Route::get('flights/{flight}', [FlightController::class, 'show']);
