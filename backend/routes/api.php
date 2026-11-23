<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Middleware\EnsureActiveUser;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

Route::post('auth/login', [AuthController::class, 'login'])->middleware('throttle:login');
Route::post('auth/sesion', [AuthController::class, 'sesion'])->middleware('throttle:login');

Route::middleware(['auth:sanctum', EnsureActiveUser::class])->group(function () {
    Route::get('auth/me', [AuthController::class, 'me']);
    Route::post('auth/logout', [AuthController::class, 'logout']);

    require __DIR__.'/api/catalogos.php';
    require __DIR__.'/api/personas.php';
    require __DIR__.'/api/academico.php';
    require __DIR__.'/api/finanzas.php';
    require __DIR__.'/api/comunicacion.php';
});
