<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Concerns\ApiResponse;
use App\Http\Controllers\Concerns\HandlesQuery;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreCityRequest;
use App\Http\Requests\UpdateCityRequest;
use App\Http\Resources\CityResource;
use App\Models\City;
use Illuminate\Database\QueryException;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class CityController extends Controller
{
    use ApiResponse, HandlesQuery;

    public function index(Request $request)
    {
        [$sort, $order] = $this->sortParams($request, 'city_name', ['city_name', 'city_code', 'updated_at']);
        $perPage = $this->perPage($request);
        $q = $request->get('q');
        $country = $request->get('country');

        $items = City::query()
            ->with(['country'])
            ->when($q, function ($qry, $value) {
                $qry->where(function ($query) use ($value) {
                    $query->where('city_name', 'like', "%{$value}%")
                        ->orWhere('city_code', 'like', "%{$value}%")
                        ->orWhereHas('country', function ($cq) use ($value) {
                            $cq->where('country_name', 'like', "%{$value}%")
                               ->orWhere('country_code', 'like', "%{$value}%");
                        });
                });
            })
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
            'items' => CityResource::collection(collect($items->items())),
            'pagination' => $this->paginationMeta($items),
        ]);
    }

    public function store(StoreCityRequest $request)
    {
        $city = City::create($request->validated());
        $city->load('country');
        return $this->success(new CityResource($city), 'Created', Response::HTTP_CREATED);
    }

    public function show(City $city)
    {
        $city->load('country');
        return $this->success(new CityResource($city));
    }

    public function update(UpdateCityRequest $request, City $city)
    {
        $city->update($request->validated());
        $city->load('country');
        return $this->success(new CityResource($city->refresh()), 'Updated');
    }

    public function destroy(City $city)
    {
        try {
            $city->delete();
        } catch (QueryException $e) {
            return $this->error('Unable to delete city. It may be referenced by airports.', 409);
        }
        return $this->success(null, 'Deleted');
    }
}
