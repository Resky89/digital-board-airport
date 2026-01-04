<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Concerns\ApiResponse;
use App\Http\Controllers\Concerns\HandlesQuery;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreUserRequest;
use App\Http\Requests\UpdateUserRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Database\QueryException;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class UserController extends Controller
{
    use ApiResponse, HandlesQuery;

    public function index(Request $request)
    {
        [$sort, $order] = $this->sortParams($request, 'created_at', ['created_at', 'name', 'email', 'updated_at']);
        $perPage = $this->perPage($request);
        $q = $request->get('q');

        $items = User::query()
            ->when($q, fn($qry) => $this->applySearch($qry, $q, ['name', 'email']))
            ->orderBy($sort, $order)
            ->paginate($perPage)
            ->appends($request->query());

        return $this->success([
            'items' => UserResource::collection(collect($items->items())),
            'pagination' => $this->paginationMeta($items),
        ]);
    }

    public function store(StoreUserRequest $request)
    {
        $user = User::create($request->validated());
        return $this->success(new UserResource($user), 'Created', Response::HTTP_CREATED);
    }

    public function show(User $user)
    {
        return $this->success(new UserResource($user));
    }

    public function update(UpdateUserRequest $request, User $user)
    {
        $user->update($request->validated());
        return $this->success(new UserResource($user->refresh()), 'Updated');
    }

    public function destroy(User $user)
    {
        try {
            $user->delete();
        } catch (QueryException $e) {
            return $this->error('Unable to delete user', 409);
        }
        return $this->success(null, 'Deleted');
    }
}
