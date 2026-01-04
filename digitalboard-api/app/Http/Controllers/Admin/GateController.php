<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Concerns\ApiResponse;
use App\Http\Controllers\Concerns\HandlesQuery;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreGateRequest;
use App\Http\Requests\UpdateGateRequest;
use App\Http\Resources\GateResource;
use App\Models\Gate;
use Illuminate\Database\QueryException;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class GateController extends Controller
{
    use ApiResponse, HandlesQuery;

    public function index(Request $request)
    {
        [$sort, $order] = $this->sortParams($request, 'gate_code', ['gate_code', 'terminal_id', 'updated_at']);
        $perPage = $this->perPage($request);
        $q = $request->get('q');
        $terminal = $request->get('terminal');

        $items = Gate::query()
            ->when($q, fn($qry) => $this->applySearch($qry, $q, ['gate_code']))
            ->when($terminal, function ($qry, $value) {
                if (is_numeric($value)) {
                    $qry->where('terminal_id', (int) $value);
                } else {
                    $qry->whereHas('terminal', function ($tq) use ($value) {
                        $tq->where('terminal_code', $value)
                           ->orWhere('terminal_name', 'like', "%{$value}%");
                    });
                }
            })
            ->orderBy($sort, $order)
            ->paginate($perPage)
            ->appends($request->query());

        return $this->success([
            'items' => GateResource::collection(collect($items->items())),
            'pagination' => $this->paginationMeta($items),
        ]);
    }

    public function store(StoreGateRequest $request)
    {
        $gate = Gate::create($request->validated());
        return $this->success(new GateResource($gate), 'Created', Response::HTTP_CREATED);
    }

    public function show(Gate $gate)
    {
        return $this->success(new GateResource($gate));
    }

    public function update(UpdateGateRequest $request, Gate $gate)
    {
        $gate->update($request->validated());
        return $this->success(new GateResource($gate->refresh()), 'Updated');
    }

    public function destroy(Gate $gate)
    {
        try {
            $gate->delete();
        } catch (QueryException $e) {
            return $this->error('Unable to delete gate', 409);
        }
        return $this->success(null, 'Deleted');
    }
}
