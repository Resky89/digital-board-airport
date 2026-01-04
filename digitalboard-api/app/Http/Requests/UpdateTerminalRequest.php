<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateTerminalRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $terminal = $this->route('terminal');
        $ignoreId = is_object($terminal) ? $terminal->terminal_id : $terminal;

        return [
            'terminal_code' => ['sometimes', 'string', 'max:20', Rule::unique('terminals', 'terminal_code')->ignore($ignoreId, 'terminal_id')],
            'terminal_name' => ['sometimes', 'string', 'max:255'],
            'description' => ['sometimes', 'nullable', 'string'],
        ];
    }
}
