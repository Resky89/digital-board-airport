<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreFlightRequest;
use App\Http\Requests\UpdateFlightRequest;
use App\Http\Resources\FlightResource;
use App\Models\Flight;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use App\Http\Controllers\Concerns\ApiResponse;
use App\Http\Controllers\Concerns\HandlesQuery;
use Illuminate\Database\QueryException;

class FlightController extends Controller
{
    use ApiResponse, HandlesQuery;

    public function index(Request $request)
    {
        $filters = $request->only([
            'airline', 'origin', 'destination', 'status', 'type', 'from', 'to', 'code', 'terminal', 'gate'
        ]);
        [$sort, $order] = $this->sortParams($request, 'scheduled_time', ['scheduled_time', 'actual_time', 'flight_code', 'updated_at']);
        $perPage = $this->perPage($request);

        $flights = Flight::query()
            ->withCommon()
            ->filter($filters)
            ->orderBy($sort, $order)
            ->paginate($perPage)
            ->appends($request->query());

        $data = [
            'items' => FlightResource::collection($flights->items()),
            'pagination' => $this->paginationMeta($flights),
        ];

        return $this->success($data);
    }

    public function store(StoreFlightRequest $request)
    {
        $data = $request->validated();
        $data['created_by'] = auth()->id();

        $flight = Flight::create($data);
        $flight->load(['airline', 'originAirport.country', 'destinationAirport.country', 'terminal', 'gate', 'status']);

        return $this->success(new FlightResource($flight), 'Created', Response::HTTP_CREATED);
    }

public function show($id)
    {
        $flight = Flight::with(['airline', 'originAirport.country', 'destinationAirport.country', 'terminal', 'gate', 'status'])->findOrFail($id);
        return $this->success(new FlightResource($flight));
    }

public function update(UpdateFlightRequest $request, $id)
    {
        $data = $request->validated();
        $data['created_by'] = auth()->id();

        $flight = Flight::findOrFail($id);
        $flight->update($data);
        $flight->refresh()->load(['airline', 'originAirport.country', 'destinationAirport.country', 'terminal', 'gate', 'status']);
        return $this->success(new FlightResource($flight), 'Updated');
    }

    public function destroy($id)
    {
        try {
            $flight = Flight::findOrFail($id);
            $flight->delete();
        } catch (QueryException $e) {
            return $this->error('Unable to delete flight', 409);
        }
        return $this->success(null, 'Deleted');
    }
}
