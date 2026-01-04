<?php

return [
    'issuer' => env('APP_URL', 'http://localhost'),
    'algo' => env('JWT_ALGO', 'HS256'),
    'access' => [
        'secret' => env('JWT_ACCESS_SECRET', env('APP_KEY')),
        'ttl' => (int) env('JWT_ACCESS_TTL', 900),
    ],
    'refresh' => [
        'secret' => env('JWT_REFRESH_SECRET', env('APP_KEY')),
        'ttl' => (int) env('JWT_REFRESH_TTL', 1209600),
    ],
];
