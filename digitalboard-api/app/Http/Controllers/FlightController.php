<?php

namespace App\Http\Controllers;

use App\Http\Resources\FlightResource;
use App\Models\Flight;
use Illuminate\Http\Request;
use App\Http\Controllers\Concerns\ApiResponse;
use App\Http\Controllers\Concerns\HandlesQuery;

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
            'items' => FlightResource::collection(collect($flights->items())),
            'pagination' => $this->paginationMeta($flights),
        ];

        return $this->success($data);
    }

    public function show(Flight $flight)
    {
        $flight->loadMissing(['airline', 'originAirport.country', 'destinationAirport.country', 'terminal', 'gate', 'status']);
        return $this->success(new FlightResource($flight));
    }
}
