<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateFlightRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

public function rules(): array
    {
        return [
            'airline_id' => ['sometimes', 'integer', 'exists:airlines,airline_id'],
            'origin_airport_id' => ['sometimes', 'integer', 'exists:airports,airport_id'],
            'destination_airport_id' => ['sometimes', 'integer', 'exists:airports,airport_id'],
            'gate_id' => ['sometimes', 'integer', 'exists:gates,gate_id'],
            'terminal_id' => ['sometimes', 'integer', 'exists:terminals,terminal_id'],
            'status_id' => ['sometimes', 'integer', 'exists:flight_status,status_id'],
            'flight_type' => ['sometimes', 'string', 'in:arrival,departure'],
            'scheduled_time' => ['sometimes', 'date'],
            'actual_time' => ['sometimes', 'nullable', 'date'],
        ];
    }
}
