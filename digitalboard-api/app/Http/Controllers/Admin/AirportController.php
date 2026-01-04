<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Concerns\ApiResponse;
use App\Http\Controllers\Concerns\HandlesQuery;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreAirportRequest;
use App\Http\Requests\UpdateAirportRequest;
use App\Http\Resources\AirportResource;
use App\Models\Airport;
use Illuminate\Database\QueryException;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class AirportController extends Controller
{
    use ApiResponse, HandlesQuery;

    public function index(Request $request)
    {
        [$sort, $order] = $this->sortParams($request, 'airport_name', ['airport_name', 'airport_code', 'city', 'updated_at']);
        $perPage = $this->perPage($request);
        $q = $request->get('q');
        $country = $request->get('country');

        $items = Airport::query()
            ->when($q, fn($qry) => $this->applySearch($qry, $q, ['airport_name', 'airport_code', 'city']))
            ->when($country, function ($qry, $value) {
                if (is_numeric($value)) {
                    $qry->where('country_id', (int) $value);
                } else {
                    $qry->whereHas('country', function ($cq) use ($value) {
                        $cq->where('country_code', $value)
                           ->orWhere('country_name', 'like', "%{$value}%");
                    });
                }
            })
            ->orderBy($sort, $order)
            ->paginate($perPage)
            ->appends($request->query());

        return $this->success([
            'items' => AirportResource::collection(collect($items->items())),
            'pagination' => $this->paginationMeta($items),
        ]);
    }

    public function store(StoreAirportRequest $request)
    {
        $airport = Airport::create($request->validated());
        return $this->success(new AirportResource($airport), 'Created', Response::HTTP_CREATED);
    }

    public function show(Airport $airport)
    {
        return $this->success(new AirportResource($airport));
    }

    public function update(UpdateAirportRequest $request, Airport $airport)
    {
        $airport->update($request->validated());
        return $this->success(new AirportResource($airport->refresh()), 'Updated');
    }

    public function destroy(Airport $airport)
    {
        try {
            $airport->delete();
        } catch (QueryException $e) {
            return $this->error('Unable to delete airport', 409);
        }
        return $this->success(null, 'Deleted');
    }
}
