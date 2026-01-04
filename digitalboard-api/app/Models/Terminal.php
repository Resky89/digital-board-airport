<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Terminal extends Model
{
    protected $primaryKey = 'terminal_id';

    protected $fillable = [
        'terminal_code',
        'terminal_name',
        'description',
    ];

    public function gates(): HasMany
    {
        return $this->hasMany(Gate::class, 'terminal_id', 'terminal_id');
    }

    public function getRouteKeyName(): string
    {
        return 'terminal_id';
    }
}
