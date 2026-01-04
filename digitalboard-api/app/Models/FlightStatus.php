<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class FlightStatus extends Model
{
    protected $table = 'flight_status';

    protected $primaryKey = 'status_id';

    protected $fillable = [
        'status_name',
    ];

    public function flights(): HasMany
    {
        return $this->hasMany(Flight::class, 'status_id', 'status_id');
    }

    public function getRouteKeyName(): string
    {
        return 'status_id';
    }
}
