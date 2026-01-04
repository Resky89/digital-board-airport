<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateCountryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $country = $this->route('country');
        $ignoreId = is_object($country) ? $country->country_id : $country;

        return [
            'country_code' => [
                'sometimes', 'string', 'max:10',
                Rule::unique('countries', 'country_code')->ignore($ignoreId, 'country_id'),
            ],
            'country_name' => ['sometimes', 'string', 'max:255'],
        ];
    }
}
