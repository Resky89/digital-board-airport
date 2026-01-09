<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AirportResource extends JsonResource
{
public function toArray(Request $request): array
    {
        // Basic airport info - use only 'id' for frontend compatibility
        $data = [
            'id' => $this->airport_id,
            'airport_code' => $this->airport_code,
            'airport_name' => $this->airport_name,
        ];

        // Add city information - check if city relation exists and is loaded
        if ($this->relationLoaded('city') && $this->city) {
            $cityData = [
                'id' => $this->city->city_id, // Frontend expects 'id'
                'city_name' => $this->city->city_name,
            ];

            // Add country information if available
            if ($this->city->relationLoaded('country') && $this->city->country) {
                $cityData['country'] = [
                    'id' => $this->city->country->country_id, // Frontend expects 'id'
                    'country_code' => $this->city->country->country_code,
                    'country_name' => $this->city->country->country_name,
                ];
            }

            $data['city'] = $cityData;
        } else {
            // City not found or not loaded
            $data['city'] = null;
        }

        return $data;
    }
}
