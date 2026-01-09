<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AirlineResource extends JsonResource
{
public function toArray(Request $request): array
    {
        return [
            'id' => $this->airline_id, // Frontend expects 'id'
            'airline_id' => $this->airline_id,
            'airline_code' => $this->airline_code,
            'airline_name' => $this->airline_name,
        ];
    }
}
