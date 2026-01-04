<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TerminalResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'terminal_id' => $this->terminal_id,
            'terminal_code' => $this->terminal_code,
            'terminal_name' => $this->terminal_name,
            'description' => $this->description,
        ];
    }
}
