<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreFlightRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'flight_code' => ['required', 'string', 'max:20'],
            'airline_id' => ['required', 'integer', 'exists:airlines,airline_id'],
            'origin_airport_id' => ['required', 'integer', 'exists:airports,airport_id'],
            'destination_airport_id' => ['required', 'integer', 'exists:airports,airport_id'],
            'gate_id' => ['required', 'integer', 'exists:gates,gate_id'],
            'terminal_id' => ['required', 'integer', 'exists:terminals,terminal_id'],
            'status_id' => ['required', 'integer', 'exists:flight_status,status_id'],
            'flight_type' => ['required', 'string', 'in:arrival,departure'],
            'scheduled_time' => ['required', 'date'],
            'actual_time' => ['nullable', 'date'],
        ];
    }
}
