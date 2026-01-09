<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Admin\FlightController as AdminFlightController;

Route::apiResource('flights', AdminFlightController::class)->parameters([
    'flights' => 'flight'
]);
