<?php

use App\Http\Controllers\Admin\CityController;
use Illuminate\Support\Facades\Route;

Route::apiResource('cities', CityController::class)->parameters([
    'cities' => 'city:city_id'
]);
