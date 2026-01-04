<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Admin\AuthController as AdminAuthController;

Route::post('auth/logout', [AdminAuthController::class, 'logout']);
