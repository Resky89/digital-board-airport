<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Admin\UserController as AdminUserController;

Route::apiResource('users', AdminUserController::class);
