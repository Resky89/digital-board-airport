<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Airport extends Model
{
    protected $primaryKey = 'airport_id';

    protected $fillable = [
        'airport_code',
        'airport_name',
        'city_id',
    ];

    public function city(): BelongsTo
    {
        return $this->belongsTo(City::class, 'city_id', 'city_id');
    }

    public function country(): BelongsTo
    {
        // Akses country melalui city
        return $this->city->country();
    }

    public function getRouteKeyName(): string
    {
        return 'airport_id';
    }
}
