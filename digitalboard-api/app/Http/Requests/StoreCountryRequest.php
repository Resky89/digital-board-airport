<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreCountryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'country_code' => ['required', 'string', 'max:10', 'unique:countries,country_code'],
            'country_name' => ['required', 'string', 'max:255'],
        ];
    }
}
