<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreCityRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'city_code' => ['required', 'string', 'max:10', 'unique:cities,city_code'],
            'city_name' => ['required', 'string', 'max:255'],
            'country_id' => ['required', 'integer', 'exists:countries,country_id'],
        ];
    }
}
