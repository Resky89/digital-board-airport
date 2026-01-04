<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Airline extends Model
{
    protected $primaryKey = 'airline_id';

    protected $fillable = [
        'airline_code',
        'airline_name',
    ];

    public function flights(): HasMany
    {
        return $this->hasMany(Flight::class, 'airline_id', 'airline_id');
    }

    public function getRouteKeyName(): string
    {
        return 'airline_id';
    }
}
