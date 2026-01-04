<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Admin\CountryController as AdminCountryController;

Route::apiResource('countries', AdminCountryController::class);
