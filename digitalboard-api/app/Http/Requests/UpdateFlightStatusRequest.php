<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateFlightStatusRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $status = $this->route('flight_status') ?? $this->route('status');
        $ignoreId = is_object($status) ? $status->status_id : $status;

        return [
            'status_name' => [
                'sometimes', 'string', 'max:255',
                Rule::unique('flight_status', 'status_name')->ignore($ignoreId, 'status_id'),
            ],
        ];
    }
}
