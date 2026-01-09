<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AirportResource extends JsonResource
{
public function toArray(Request $request): array
    {
        return [
            'id' => $this->airport_id, // Frontend expects 'id'
            'airport_id' => $this->airport_id,
            'airport_code' => $this->airport_code,
            'airport_name' => $this->airport_name,
            'city_id' => $this->city_id,
            'city' => $this->whenLoaded('city', function () {
                if (!$this->city) {
                    return null;
                }
                
                return [
                    'id' => $this->city->city_id, // Frontend expects 'id'
                    'city_id' => $this->city->city_id,
                    'city_name' => $this->city->city_name,
                    'country' => $this->city->whenLoaded('country', function () {
                        if (!$this->city?->country) {
                            return null;
                        }
                        
                        return [
                            'id' => $this->city->country->country_id, // Frontend expects 'id'
                            'country_id' => $this->city->country->country_id,
                            'country_code' => $this->city->country->country_code,
                            'country_name' => $this->city->country->country_name,
                        ];
                    }),
                ];
            }),
            // Backward compatibility: provide city_name directly
            'city_name' => $this->city?->city_name,
            'country_id' => $this->city?->country_id,
            'country_name' => $this->city?->country?->country_name,
        ];
    }
}
