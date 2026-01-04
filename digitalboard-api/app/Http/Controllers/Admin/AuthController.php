<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Concerns\ApiResponse;
use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\JwtService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    use ApiResponse;

    public function __construct(private JwtService $jwt)
    {
    }

    public function login(Request $request)
    {
        $data = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        $user = User::where('email', $data['email'])->first();
        if (!$user || !Hash::check($data['password'], $user->password)) {
            return $this->error('Invalid credentials', 401);
        }

        $access = $this->jwt->issueAccessToken($user);
        $refresh = $this->jwt->issueRefreshToken($user);

        $user->forceFill(['remember_token' => hash('sha256', $refresh)])->save();

        return $this->success([
            'access_token' => $access,
            'refresh_token' => $refresh,
        ]);
    }

    public function refresh(Request $request)
    {
        $data = $request->validate([
            'refresh_token' => ['required', 'string'],
        ]);

        try {
            $payload = $this->jwt->decodeRefresh($data['refresh_token']);
        } catch (\Throwable $e) {
            return $this->error('Invalid refresh token', 401);
        }

        if (($payload['type'] ?? null) !== 'refresh') {
            return $this->error('Invalid refresh token', 401);
        }

        $user = User::find($payload['sub'] ?? null);
        if (!$user) {
            return $this->error('Invalid refresh token', 401);
        }

        if (!hash_equals((string) $user->remember_token, hash('sha256', $data['refresh_token']))) {
            return $this->error('Invalid refresh token', 401);
        }

        $access = $this->jwt->issueAccessToken($user);
        $newRefresh = $this->jwt->issueRefreshToken($user);

        $user->forceFill(['remember_token' => hash('sha256', $newRefresh)])->save();

        return $this->success([
            'access_token' => $access,
            'refresh_token' => $newRefresh,
        ]);
    }

    public function logout(Request $request)
    {
        $user = $request->user();
        if ($user) {
            $user->forceFill(['remember_token' => null])->save();
        }
        return $this->success(null, 'Logged out');
    }
}
