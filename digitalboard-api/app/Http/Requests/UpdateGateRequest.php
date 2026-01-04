<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateGateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $gate = $this->route('gate');
        $ignoreId = is_object($gate) ? $gate->gate_id : $gate;
        $terminalId = $this->input('terminal_id');
        if ($terminalId === null && is_object($gate)) {
            $terminalId = $gate->terminal_id;
        }

        return [
            'gate_code' => [
                'sometimes', 'string', 'max:20',
                Rule::unique('gates', 'gate_code')
                    ->ignore($ignoreId, 'gate_id')
                    ->where(fn($q) => $q->where('terminal_id', $terminalId)),
            ],
            'terminal_id' => ['sometimes', 'integer', 'exists:terminals,terminal_id'],
        ];
    }
}
