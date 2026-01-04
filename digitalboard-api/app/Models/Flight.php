<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Flight extends Model
{
    protected $primaryKey = 'flight_id';

    protected $fillable = [
        'flight_code',
        'airline_id',
        'origin_airport_id',
        'destination_airport_id',
        'gate_id',
        'terminal_id',
        'status_id',
        'flight_type',
        'scheduled_time',
        'actual_time',
        'created_by',
    ];

    protected $casts = [
        'scheduled_time' => 'datetime',
        'actual_time' => 'datetime',
    ];

    public function getRouteKeyName(): string
    {
        return 'flight_id';
    }

    public function airline(): BelongsTo
    {
        return $this->belongsTo(Airline::class, 'airline_id', 'airline_id');
    }

    public function originAirport(): BelongsTo
    {
        return $this->belongsTo(Airport::class, 'origin_airport_id', 'airport_id');
    }

    public function destinationAirport(): BelongsTo
    {
        return $this->belongsTo(Airport::class, 'destination_airport_id', 'airport_id');
    }

    public function gate(): BelongsTo
    {
        return $this->belongsTo(Gate::class, 'gate_id', 'gate_id');
    }

    public function terminal(): BelongsTo
    {
        return $this->belongsTo(Terminal::class, 'terminal_id', 'terminal_id');
    }

    public function status(): BelongsTo
    {
        return $this->belongsTo(FlightStatus::class, 'status_id', 'status_id');
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by', 'id');
    }

    public function scopeWithCommon(Builder $query): Builder
    {
        return $query->with([
            'airline',
            'originAirport.country',
            'destinationAirport.country',
            'terminal',
            'gate',
            'status',
        ]);
    }

    public function scopeFilter(Builder $query, array $filters): Builder
    {
        return $query
            ->when($filters['airline'] ?? null, function (Builder $q, $value) {
                if (is_numeric($value)) {
                    $q->where('airline_id', (int) $value);
                } else {
                    $q->whereHas('airline', function (Builder $aq) use ($value) {
                        $aq->where('airline_code', $value)
                           ->orWhere('airline_name', 'like', "%{$value}%");
                    });
                }
            })
            ->when($filters['origin'] ?? null, function (Builder $q, $value) {
                if (is_numeric($value)) {
                    $q->where('origin_airport_id', (int) $value);
                } else {
                    $q->whereHas('originAirport', function (Builder $oq) use ($value) {
                        $oq->where('airport_code', $value)
                           ->orWhere('airport_name', 'like', "%{$value}%");
                    });
                }
            })
            ->when($filters['destination'] ?? null, function (Builder $q, $value) {
                if (is_numeric($value)) {
                    $q->where('destination_airport_id', (int) $value);
                } else {
                    $q->whereHas('destinationAirport', function (Builder $dq) use ($value) {
                        $dq->where('airport_code', $value)
                           ->orWhere('airport_name', 'like', "%{$value}%");
                    });
                }
            })
            ->when($filters['status'] ?? null, function (Builder $q, $value) {
                if (is_numeric($value)) {
                    $q->where('status_id', (int) $value);
                } else {
                    $q->whereHas('status', function (Builder $sq) use ($value) {
                        $sq->where('status_name', $value);
                    });
                }
            })
            ->when($filters['type'] ?? null, function (Builder $q, $value) {
                $q->where('flight_type', $value);
            })
            ->when($filters['from'] ?? null, function (Builder $q, $value) {
                $q->where('scheduled_time', '>=', $value);
            })
            ->when($filters['to'] ?? null, function (Builder $q, $value) {
                $q->where('scheduled_time', '<=', $value);
            })
            ->when($filters['code'] ?? null, function (Builder $q, $value) {
                $q->where('flight_code', 'like', "%{$value}%");
            })
            ->when($filters['terminal'] ?? null, function (Builder $q, $value) {
                if (is_numeric($value)) {
                    $q->where('terminal_id', (int) $value);
                } else {
                    $q->whereHas('terminal', function (Builder $tq) use ($value) {
                        $tq->where('terminal_code', $value)
                           ->orWhere('terminal_name', 'like', "%{$value}%");
                    });
                }
            })
            ->when($filters['gate'] ?? null, function (Builder $q, $value) {
                if (is_numeric($value)) {
                    $q->where('gate_id', (int) $value);
                } else {
                    $q->whereHas('gate', function (Builder $gq) use ($value) {
                        $gq->where('gate_code', $value);
                    });
                }
            });
    }
}
