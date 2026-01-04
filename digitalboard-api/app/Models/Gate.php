<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Gate extends Model
{
    protected $primaryKey = 'gate_id';

    protected $fillable = [
        'gate_code',
        'terminal_id',
    ];

    public function terminal(): BelongsTo
    {
        return $this->belongsTo(Terminal::class, 'terminal_id', 'terminal_id');
    }

    public function flights(): HasMany
    {
        return $this->hasMany(Flight::class, 'gate_id', 'gate_id');
    }

    public function getRouteKeyName(): string
    {
        return 'gate_id';
    }
}
