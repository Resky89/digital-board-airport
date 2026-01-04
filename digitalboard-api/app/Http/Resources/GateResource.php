<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class GateResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'gate_id' => $this->gate_id,
            'gate_code' => $this->gate_code,
            'terminal_id' => $this->terminal_id,
        ];
    }
}
