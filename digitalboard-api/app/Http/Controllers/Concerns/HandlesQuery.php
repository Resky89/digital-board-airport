<?php

namespace App\Http\Controllers\Concerns;

use Illuminate\Http\Request;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;

trait HandlesQuery
{
    protected function sortParams(Request $request, string $default, array $allowed): array
    {
        $sort = $request->get('sort', $default);
        if (!in_array($sort, $allowed, true)) {
            $sort = $default;
        }
        $order = strtolower($request->get('order', 'asc')) === 'desc' ? 'desc' : 'asc';
        return [$sort, $order];
    }

    protected function perPage(Request $request, int $default = 20, int $max = 100): int
    {
        $perPage = (int) $request->integer('per_page', $default);
        return max(1, min($perPage, $max));
    }

    protected function collectionResponse(LengthAwarePaginator $paginator, string $resourceClass): array
    {
        return [
            'items' => $resourceClass::collection(collect($paginator->items())),
            'pagination' => [
                'current_page' => $paginator->currentPage(),
                'per_page' => $paginator->perPage(),
                'total' => $paginator->total(),
                'last_page' => $paginator->lastPage(),
            ],
        ];
    }

    protected function paginationMeta(LengthAwarePaginator $paginator): array
    {
        return [
            'current_page' => $paginator->currentPage(),
            'per_page' => $paginator->perPage(),
            'total' => $paginator->total(),
            'last_page' => $paginator->lastPage(),
        ];
    }

    protected function applySearch(Builder $query, ?string $term, array $columns): Builder
    {
        if ($term === null || $term === '') {
            return $query;
        }
        return $query->where(function (Builder $w) use ($term, $columns) {
            foreach ($columns as $col) {
                $w->orWhere($col, 'like', "%{$term}%");
            }
        });
    }
}
