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



public function getRouteKeyName(): string
    {
        return 'airport_id';
    }

    public function resolveRouteBinding($value, $field = null)
    {
        return $this->where('airport_id', $value)->firstOrFail();
    }
}
