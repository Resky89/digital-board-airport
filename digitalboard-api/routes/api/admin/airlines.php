<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Admin\AirlineController as AdminAirlineController;

Route::apiResource('airlines', AdminAirlineController::class)->parameters([
    'airlines' => 'airline'
]);
