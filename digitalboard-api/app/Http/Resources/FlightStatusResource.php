<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class FlightStatusResource extends JsonResource
{
public function toArray(Request $request): array
    {
        return [
            'id' => $this->status_id, // Frontend expects 'id'
            'status_id' => $this->status_id,
            'status_name' => $this->status_name,
        ];
    }
}
