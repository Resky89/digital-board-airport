<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Controllers\Concerns\ApiResponse;
use App\Http\Controllers\Concerns\HandlesQuery;
use App\Http\Requests\StoreAirlineRequest;
use App\Http\Requests\UpdateAirlineRequest;
use App\Http\Resources\AirlineResource;
use App\Models\Airline;
use Illuminate\Database\QueryException;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class AirlineController extends Controller
{
    use ApiResponse, HandlesQuery;

    public function index(Request $request)
    {
        [$sort, $order] = $this->sortParams($request, 'airline_name', ['airline_name', 'airline_code', 'updated_at']);
        $perPage = $this->perPage($request);
        $q = $request->get('q');

        $items = Airline::query()
            ->when($q, function ($qry, $value) {
                $qry->where(function ($query) use ($value) {
                    $query->where('airline_name', 'like', "%{$value}%")
                        ->orWhere('airline_code', 'like', "%{$value}%");
                });
            })
            ->orderBy($sort, $order)
            ->paginate($perPage)
            ->appends($request->query());

        return $this->success([
            'items' => AirlineResource::collection($items->items()),
            'pagination' => $this->paginationMeta($items),
        ]);
    }

    public function store(StoreAirlineRequest $request)
    {
        $airline = Airline::create($request->validated());
        return $this->success(new AirlineResource($airline), 'Created', Response::HTTP_CREATED);
    }

    public function show(Airline $airline)
    {
        return $this->success(new AirlineResource($airline));
    }

    public function update(UpdateAirlineRequest $request, Airline $airline)
    {
        $airline->update($request->validated());
        return $this->success(new AirlineResource($airline->refresh()), 'Updated');
    }

    public function destroy(Airline $airline)
    {
        try {
            $airline->delete();
        } catch (QueryException $e) {
            return $this->error('Unable to delete airline. It may be referenced by flights.', 409);
        }
        return $this->success(null, 'Deleted');
    }
}
