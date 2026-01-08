<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class City extends Model
{
    protected $primaryKey = 'city_id';

    protected $fillable = [
        'city_code',
        'city_name',
        'country_id',
    ];

    public function country(): BelongsTo
    {
        return $this->belongsTo(Country::class, 'country_id', 'country_id');
    }

    public function airports(): HasMany
    {
        return $this->hasMany(Airport::class, 'city_id', 'city_id');
    }
}
