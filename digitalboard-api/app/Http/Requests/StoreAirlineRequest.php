<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreAirlineRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'airline_code' => ['required', 'string', 'max:10', 'unique:airlines,airline_code'],
            'airline_name' => ['required', 'string', 'max:255'],
        ];
    }
}
