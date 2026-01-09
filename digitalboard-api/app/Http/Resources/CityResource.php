<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CityResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->city_id,
            'city_id' => $this->city_id,
            'city_code' => $this->city_code,
            'city_name' => $this->city_name,
            'country_id' => $this->country_id,
            'country' => $this->whenLoaded('country', function () {
                return [
                    'id' => $this->country->country_id,
                    'country_id' => $this->country->country_id,
                    'country_code' => $this->country->country_code,
                    'country_name' => $this->country->country_name,
                ];
            }),
            // Backward compatibility
            'country_code' => $this->country?->country_code,
            'country_name' => $this->country?->country_name,
        ];
    }
}
