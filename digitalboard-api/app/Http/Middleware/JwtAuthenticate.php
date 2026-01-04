<?php

namespace App\Http\Middleware;

use App\Models\User;
use App\Services\JwtService;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class JwtAuthenticate
{
    public function __construct(private JwtService $jwt)
    {
    }

    public function handle(Request $request, Closure $next)
    {
        $authHeader = $request->header('Authorization', '');
        if (!str_starts_with($authHeader, 'Bearer ')) {
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 401);
        }
        $token = substr($authHeader, 7);
        try {
            $payload = $this->jwt->decodeAccess($token);
        } catch (\Throwable $e) {
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 401);
        }
        if (($payload['type'] ?? null) !== 'access') {
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 401);
        }
        $userId = $payload['sub'] ?? null;
        $user = $userId ? User::find($userId) : null;
        if (!$user) {
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 401);
        }
        Auth::setUser($user);
        $request->setUserResolver(fn () => $user);
        return $next($request);
    }
}
