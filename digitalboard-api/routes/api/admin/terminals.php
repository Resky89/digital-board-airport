<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Admin\TerminalController as AdminTerminalController;

Route::apiResource('terminals', AdminTerminalController::class)->parameters([
    'terminals' => 'terminal:terminal_id'
]);
