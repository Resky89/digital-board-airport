<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Admin\FlightStatusController as AdminFlightStatusController;

Route::apiResource('flight-statuses', AdminFlightStatusController::class)->parameters([
    'flight-statuses' => 'flight_status:flight_status_id'
]);
