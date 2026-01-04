<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Builder;

class Country extends Model
{
    protected $primaryKey = 'country_id';

    protected $fillable = [
        'country_code',
        'country_name',
    ];

    public function airports(): HasMany
    {
        return $this->hasMany(Airport::class, 'country_id', 'country_id');
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
