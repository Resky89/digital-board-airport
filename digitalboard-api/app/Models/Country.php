<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;
use Illuminate\Database\Eloquent\Builder;

class Country extends Model
{
    protected $primaryKey = 'country_id';

    protected $fillable = [
        'country_code',
        'country_name',
    ];

    public function cities(): HasMany
    {
        return $this->hasMany(City::class, 'country_id', 'country_id');
    }

    public function airports(): HasManyThrough
    {
        return $this->hasManyThrough(
            Airport::class,
            City::class,
            'country_id',  // Foreign key on cities table
            'city_id',     // Foreign key on airports table
            'country_id',  // Local key on countries table
            'city_id'      // Local key on cities table
        );
    }

    public function getRouteKeyName(): string
    {
        return 'country_id';
    }

    public function scopeFilter(Builder $query, array $filters): Builder
    {
        return $query
            ->when($filters['q'] ?? null, function (Builder $q, $value) {
                $q->where(function (Builder $w) use ($value) {
                    $w->where('country_code', 'like', "%{$value}%")
                      ->orWhere('country_name', 'like', "%{$value}%");
                });
            });
    }
}
