<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateCityRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $city = $this->route('city');
        $ignoreId = is_object($city) ? $city->city_id : $city;

        return [
            'city_code' => [
                'sometimes', 'string', 'max:10',
                Rule::unique('cities', 'city_code')->ignore($ignoreId, 'city_id'),
            ],
            'city_name' => ['sometimes', 'string', 'max:255'],
            'country_id' => ['sometimes', 'integer', 'exists:countries,country_id'],
        ];
    }
}
