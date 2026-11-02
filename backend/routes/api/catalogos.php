<?php

use App\Http\Controllers\Api\Academico\GradoController;
use App\Http\Controllers\Api\AsignaturaController;
use App\Http\Controllers\Api\CicloController;
use Illuminate\Support\Facades\Route;

Route::apiResource('ciclos', CicloController::class)->middleware('permiso:ciclos');
Route::apiResource('grados', GradoController::class)->parameters(['grados' => 'registro'])->middleware('permiso:grados');
Route::apiResource('asignaturas', AsignaturaController::class)->middleware('permiso:asignaturas');
