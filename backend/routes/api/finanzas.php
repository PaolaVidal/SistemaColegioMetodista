<?php

use App\Http\Controllers\Api\Finanzas\ArancelBaseController;
use App\Http\Controllers\Api\Finanzas\CuentaPorCobrarController;
use App\Http\Controllers\Api\Finanzas\DescuentoAlumnoController;
use App\Http\Controllers\Api\Finanzas\PagoController;
use Illuminate\Support\Facades\Route;

Route::apiResource('aranceles-base', ArancelBaseController::class)
    ->parameters(['aranceles-base' => 'registro'])->middleware('permiso:aranceles_base');
Route::apiResource('cuentas-por-cobrar', CuentaPorCobrarController::class)
    ->parameters(['cuentas-por-cobrar' => 'registro'])->middleware('permiso:cuentas_por_cobrar');
Route::apiResource('pagos', PagoController::class)->parameters(['pagos' => 'registro'])->middleware('permiso:pagos');
Route::apiResource('descuentos-alumnos', DescuentoAlumnoController::class)
    ->parameters(['descuentos-alumnos' => 'registro'])->middleware('permiso:descuentos_alumnos');
