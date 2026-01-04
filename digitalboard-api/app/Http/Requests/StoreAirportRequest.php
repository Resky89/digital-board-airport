<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreAirportRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'airport_code' => ['required', 'string', 'max:10', 'unique:airports,airport_code'],
            'airport_name' => ['required', 'string', 'max:255'],
            'city' => ['required', 'string', 'max:255'],
            'country_id' => ['required', 'integer', 'exists:countries,country_id'],
        ];
    }
}
