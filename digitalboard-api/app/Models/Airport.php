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
        'city',
        'country_id',
    ];

    public function country(): BelongsTo
    {
        return $this->belongsTo(Country::class, 'country_id', 'country_id');
    }

    public function getRouteKeyName(): string
    {
        return 'airport_id';
    }
}
