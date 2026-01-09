<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Admin\GateController as AdminGateController;

Route::apiResource('gates', AdminGateController::class)->parameters([
    'gates' => 'gate:gate_id'
]);
