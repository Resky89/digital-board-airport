<?php

namespace App\Services;

use App\Models\User;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use Illuminate\Support\Str;

class JwtService
{
    public function issueAccessToken(User $user): string
    {
        $now = time();
        $ttl = (int) config('jwt.access.ttl', 900);
        $payload = [
            'iss' => config('jwt.issuer'),
            'sub' => $user->id,
            'iat' => $now,
            'exp' => $now + $ttl,
            'jti' => (string) Str::uuid(),
            'type' => 'access',
        ];
        return JWT::encode($payload, (string) config('jwt.access.secret'), (string) config('jwt.algo'));
    }

    public function issueRefreshToken(User $user): string
    {
        $now = time();
        $ttl = (int) config('jwt.refresh.ttl', 1209600);
        $payload = [
            'iss' => config('jwt.issuer'),
            'sub' => $user->id,
            'iat' => $now,
            'exp' => $now + $ttl,
            'jti' => (string) Str::uuid(),
            'type' => 'refresh',
        ];
        return JWT::encode($payload, (string) config('jwt.refresh.secret'), (string) config('jwt.algo'));
    }

    public function decodeAccess(string $token): array
    {
        $decoded = JWT::decode($token, new Key((string) config('jwt.access.secret'), (string) config('jwt.algo')));
        return (array) $decoded;
    }

    public function decodeRefresh(string $token): array
    {
        $decoded = JWT::decode($token, new Key((string) config('jwt.refresh.secret'), (string) config('jwt.algo')));
        return (array) $decoded;
    }
}
