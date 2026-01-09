<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Concerns\ApiResponse;
use App\Http\Controllers\Concerns\HandlesQuery;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreTerminalRequest;
use App\Http\Requests\UpdateTerminalRequest;
use App\Http\Resources\TerminalResource;
use App\Models\Terminal;
use Illuminate\Database\QueryException;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class TerminalController extends Controller
{
    use ApiResponse, HandlesQuery;

    public function index(Request $request)
    {
        [$sort, $order] = $this->sortParams($request, 'terminal_code', ['terminal_code', 'terminal_name', 'updated_at']);
        $perPage = $this->perPage($request);
        $q = $request->get('q');

        $items = Terminal::query()
            ->when($q, fn($qry) => $this->applySearch($qry, $q, ['terminal_code', 'terminal_name']))
            ->orderBy($sort, $order)
            ->paginate($perPage)
            ->appends($request->query());

        return $this->success([
            'items' => TerminalResource::collection($items->items()),
            'pagination' => $this->paginationMeta($items),
        ]);
    }

    public function store(StoreTerminalRequest $request)
    {
        $terminal = Terminal::create($request->validated());
        return $this->success(new TerminalResource($terminal), 'Created', Response::HTTP_CREATED);
    }

    public function show(Terminal $terminal)
    {
        return $this->success(new TerminalResource($terminal));
    }

    public function update(UpdateTerminalRequest $request, Terminal $terminal)
    {
        $terminal->update($request->validated());
        return $this->success(new TerminalResource($terminal->refresh()), 'Updated');
    }

    public function destroy(Terminal $terminal)
    {
        try {
            $terminal->delete();
        } catch (QueryException $e) {
            return $this->error('Unable to delete terminal', 409);
        }
        return $this->success(null, 'Deleted');
    }
}
