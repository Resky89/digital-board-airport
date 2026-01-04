<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Concerns\ApiResponse;
use App\Http\Controllers\Concerns\HandlesQuery;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreFlightStatusRequest;
use App\Http\Requests\UpdateFlightStatusRequest;
use App\Http\Resources\FlightStatusResource;
use App\Models\FlightStatus;
use Illuminate\Database\QueryException;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class FlightStatusController extends Controller
{
    use ApiResponse, HandlesQuery;

    public function index(Request $request)
    {
        [$sort, $order] = $this->sortParams($request, 'status_name', ['status_name', 'updated_at']);
        $perPage = $this->perPage($request);
        $q = $request->get('q');

        $items = FlightStatus::query()
            ->when($q, fn($qry) => $this->applySearch($qry, $q, ['status_name']))
            ->orderBy($sort, $order)
            ->paginate($perPage)
            ->appends($request->query());

        return $this->success([
            'items' => FlightStatusResource::collection(collect($items->items())),
            'pagination' => $this->paginationMeta($items),
        ]);
    }

    public function store(StoreFlightStatusRequest $request)
    {
        $status = FlightStatus::create($request->validated());
        return $this->success(new FlightStatusResource($status), 'Created', Response::HTTP_CREATED);
    }

    public function show(FlightStatus $flight_status)
    {
        return $this->success(new FlightStatusResource($flight_status));
    }

    public function update(UpdateFlightStatusRequest $request, FlightStatus $flight_status)
    {
        $flight_status->update($request->validated());
        return $this->success(new FlightStatusResource($flight_status->refresh()), 'Updated');
    }

    public function destroy(FlightStatus $flight_status)
    {
        try {
            $flight_status->delete();
        } catch (QueryException $e) {
            return $this->error('Unable to delete flight status', 409);
        }
        return $this->success(null, 'Deleted');
    }
}
