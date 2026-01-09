<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class FlightResource extends JsonResource
{
    public function toArray(Request $request): array
    {
return [
            'id' => $this->flight_id,
            'flight_id' => $this->flight_id,
            'flight_code' => $this->flight_code,
            'flight_type' => $this->flight_type,
            'scheduled_time' => $this->scheduled_time?->toIso8601String(),
            'actual_time' => $this->actual_time?->toIso8601String(),

            'airline' => $this->whenLoaded('airline', function () {
                return [
                    'airline_id' => $this->airline?->airline_id,
                    'airline_code' => $this->airline?->airline_code,
                    'airline_name' => $this->airline?->airline_name,
                ];
            }),

            'origin_airport' => $this->whenLoaded('originAirport', function () {
                $isDomestic = false;
                if ($this->destinationAirport && $this->originAirport->city && $this->destinationAirport->city) {
                     $isDomestic = $this->originAirport->city->country_id === $this->destinationAirport->city->country_id;
                }
                
                return [
                    'airport_id' => $this->originAirport->airport_id,
                    'airport_code' => $this->originAirport->airport_code,
                    'airport_name' => $this->originAirport->airport_name,
                    'city' => $this->originAirport->city, // Updated structure in AirportResource
                    'country' => $this->originAirport->city?->country?->country_code,
                    // Dynamic location code logic
                    'location_code' => $isDomestic 
                        ? $this->originAirport->city?->city_code 
                        : $this->originAirport->city?->country?->country_code,
                ];
            }),

            'destination_airport' => $this->whenLoaded('destinationAirport', function () {
                 $isDomestic = false;
                 if ($this->originAirport && $this->destinationAirport->city && $this->originAirport->city) {
                      $isDomestic = $this->destinationAirport->city->country_id === $this->originAirport->city->country_id;
                 }

                return [
                    'airport_id' => $this->destinationAirport->airport_id,
                    'airport_code' => $this->destinationAirport->airport_code,
                    'airport_name' => $this->destinationAirport->airport_name,
                    'city' => $this->destinationAirport->city,
                    'country' => $this->destinationAirport->city?->country?->country_code,
                     // Dynamic location code logic
                    'location_code' => $isDomestic 
                        ? $this->destinationAirport->city?->city_code 
                        : $this->destinationAirport->city?->country?->country_code,
                ];
            }),

            'terminal' => $this->whenLoaded('terminal', function () {
                return [
                    'terminal_id' => $this->terminal?->terminal_id,
                    'terminal_code' => $this->terminal?->terminal_code,
                    'terminal_name' => $this->terminal?->terminal_name,
                ];
            }),

            'gate' => $this->whenLoaded('gate', function () {
                return [
                    'gate_id' => $this->gate?->gate_id,
                    'gate_code' => $this->gate?->gate_code,
                ];
            }),

            'status' => $this->whenLoaded('status', function () {
                return [
                    'status_id' => $this->status?->status_id,
                    'status_name' => $this->status?->status_name,
                ];
            }),
        ];
    }

        private function getLocationCode($airport, $otherAirport)
    {
        if (!$airport || !$airport->city || !$airport->city->country) {
            return null;
        }

        // Check if same country
        $isSameCountry = $otherAirport && 
                        $otherAirport->city && 
                        $otherAirport->city->country && 
                        $otherAirport->city->country->country_id === $airport->city->country->country_id;

        if ($isSameCountry) {
            // Show city code (e.g. JKT, SUB)
            return $airport->city->city_code;
        }

        // Show country code (e.g. ID, SG)
        return $airport->city->country->country_code;
    }
}
