<?php

namespace App\Http\Controllers\Concerns;

use Illuminate\Http\JsonResponse;

trait ApiResponse
{
    protected function success(mixed $data = null, string $message = 'OK', int $status = 200, array $extra = []): JsonResponse
    {
        $payload = array_merge([
            'success' => true,
            'message' => $message,
        ], $extra);

        if ($data !== null) {
            $payload['data'] = $data;
        }

        return response()->json($payload, $status);
    }

    protected function error(string $message = 'Error', int $status = 400, mixed $errors = null, array $extra = []): JsonResponse
    {
        $payload = array_merge([
            'success' => false,
            'message' => $message,
        ], $extra);

        if ($errors !== null) {
            $payload['errors'] = $errors;
        }

        return response()->json($payload, $status);
    }
}
