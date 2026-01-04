<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreGateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'gate_code' => [
                'required', 'string', 'max:20',
                Rule::unique('gates', 'gate_code')->where(fn($q) => $q->where('terminal_id', $this->input('terminal_id'))),
            ],
            'terminal_id' => ['required', 'integer', 'exists:terminals,terminal_id'],
        ];
    }
}
