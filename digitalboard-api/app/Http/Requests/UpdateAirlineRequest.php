<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateAirlineRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $airline = $this->route('airline');
        $ignoreId = is_object($airline) ? $airline->airline_id : $airline;

        return [
            'airline_code' => [
                'sometimes', 'string', 'max:10',
                Rule::unique('airlines', 'airline_code')->ignore($ignoreId, 'airline_id'),
            ],
            'airline_name' => ['sometimes', 'string', 'max:255'],
        ];
    }
}
