<?php

use App\Http\Controllers\Api\Comunicacion\AnuncioController;
use App\Http\Controllers\Api\Comunicacion\NotificacionController;
use Illuminate\Support\Facades\Route;

Route::apiResource('anuncios', AnuncioController::class)->parameters(['anuncios' => 'registro'])->middleware('permiso:anuncios');
Route::apiResource('notificaciones', NotificacionController::class)
    ->parameters(['notificaciones' => 'registro'])->middleware('permiso:notificaciones');
