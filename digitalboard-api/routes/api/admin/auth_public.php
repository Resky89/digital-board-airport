<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Admin\AuthController as AdminAuthController;

Route::post('auth/login', [AdminAuthController::class, 'login']);
Route::post('auth/refresh', [AdminAuthController::class, 'refresh']);
