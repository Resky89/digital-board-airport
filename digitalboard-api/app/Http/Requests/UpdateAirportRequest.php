<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateAirportRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $airport = $this->route('airport');
        $ignoreId = is_object($airport) ? $airport->airport_id : $airport;

        return [
            'airport_code' => [
                'sometimes', 'string', 'max:10',
                Rule::unique('airports', 'airport_code')->ignore($ignoreId, 'airport_id'),
            ],
            'airport_name' => ['sometimes', 'string', 'max:255'],
            'city' => ['sometimes', 'string', 'max:255'],
            'country_id' => ['sometimes', 'integer', 'exists:countries,country_id'],
        ];
    }
}
