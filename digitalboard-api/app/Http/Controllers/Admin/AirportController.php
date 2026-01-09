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
        [$sort, $order] = $this->sortParams($request, 'airport_name', ['airport_name', 'airport_code', 'updated_at']);
        $perPage = $this->perPage($request);
        $q = $request->get('q');
        $country = $request->get('country');
        $city = $request->get('city');

        $items = Airport::query()
            ->with(['city.country'])
            ->when($q, function ($qry, $value) {
                $qry->where(function ($query) use ($value) {
                    $query->where('airport_name', 'like', "%{$value}%")
                        ->orWhere('airport_code', 'like', "%{$value}%")
                        ->orWhereHas('city', function ($cq) use ($value) {
                            $cq->where('city_name', 'like', "%{$value}%");
                        });
                });
            })
            ->when($country, function ($qry, $value) {
                $qry->whereHas('city.country', function ($cq) use ($value) {
                    if (is_numeric($value)) {
                        $cq->where('country_id', (int) $value);
                    } else {
                        $cq->where('country_code', $value)
                           ->orWhere('country_name', 'like', "%{$value}%");
                    }
                });
            })
            ->when($city, function ($qry, $value) {
                if (is_numeric($value)) {
                    $qry->where('city_id', (int) $value);
                } else {
                    $qry->whereHas('city', function ($cq) use ($value) {
                        $cq->where('city_name', 'like', "%{$value}%");
                    });
                }
            })
            ->orderBy($sort, $order)
            ->paginate($perPage)
            ->appends($request->query());

return $this->success([
            'items' => AirportResource::collection($items->items()),
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
        $airport->load('city.country');
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
