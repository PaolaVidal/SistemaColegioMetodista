<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\Support\CrudController;
use App\Policies\Api\ResourcePolicy;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AsignaturaController extends CrudController
{
    protected string $tabla = 'asignaturas';

    public function index(Request $request)
    {
        if (!$request->filled('buscar')) {
            return parent::index($request);
        }

        $consulta = app(ResourcePolicy::class)->consulta($request->user(), 'asignaturas')->orderBy('nombre');
        $termino = '%' . $request->string('buscar')->trim() . '%';
        $consulta->where(function ($query) use ($termino) {
            $query->where('nombre', 'ilike', $termino)->orWhere('codigo', 'ilike', $termino);
        });

        return response()->json($consulta->paginate(25));
    }
}
