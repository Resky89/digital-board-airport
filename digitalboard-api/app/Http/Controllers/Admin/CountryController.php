<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Concerns\ApiResponse;
use App\Http\Controllers\Concerns\HandlesQuery;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreCountryRequest;
use App\Http\Requests\UpdateCountryRequest;
use App\Http\Resources\CountryResource;
use App\Models\Country;
use Illuminate\Database\QueryException;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class CountryController extends Controller
{
    use ApiResponse, HandlesQuery;

    public function index(Request $request)
    {
        [$sort, $order] = $this->sortParams($request, 'country_name', ['country_name', 'country_code', 'updated_at']);
        $perPage = $this->perPage($request);
        $q = $request->get('q');

        $items = Country::query()
            ->when($q, fn($qry) => $this->applySearch($qry, $q, ['country_name', 'country_code']))
            ->orderBy($sort, $order)
            ->paginate($perPage)
            ->appends($request->query());

        return $this->success([
            'items' => CountryResource::collection($items->items()),
            'pagination' => $this->paginationMeta($items),
        ]);
    }

    public function store(StoreCountryRequest $request)
    {
        $country = Country::create($request->validated());
        return $this->success(new CountryResource($country), 'Created', Response::HTTP_CREATED);
    }

    public function show(Country $country)
    {
        return $this->success(new CountryResource($country));
    }

    public function update(UpdateCountryRequest $request, Country $country)
    {
        $country->update($request->validated());
        return $this->success(new CountryResource($country->refresh()), 'Updated');
    }

    public function destroy(Country $country)
    {
        try {
            $country->delete();
        } catch (QueryException $e) {
            return $this->error('Unable to delete country', 409);
        }
        return $this->success(null, 'Deleted');
    }
}
