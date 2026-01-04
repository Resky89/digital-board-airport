<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AirportResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'airport_id' => $this->airport_id,
            'airport_code' => $this->airport_code,
            'airport_name' => $this->airport_name,
            'city' => $this->city,
            'country_id' => $this->country_id,
        ];
    }
}
