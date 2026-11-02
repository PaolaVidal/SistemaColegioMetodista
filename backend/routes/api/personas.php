<?php

use App\Http\Controllers\Api\Administracion\AuditoriaController;
use App\Http\Controllers\Api\Administracion\DemeritoController;
use App\Http\Controllers\Api\Administracion\DocenteController;
use App\Http\Controllers\Api\Administracion\DocumentoDocenteController;
use App\Http\Controllers\Api\Administracion\DocumentoEstudianteController;
use App\Http\Controllers\Api\Administracion\EstudianteController;
use App\Http\Controllers\Api\Administracion\EstudianteResponsableController;
use App\Http\Controllers\Api\Administracion\FichaEstudianteController;
use App\Http\Controllers\Api\Administracion\ResponsableController;
use App\Http\Controllers\Api\Administracion\RoleController;
use App\Http\Controllers\Api\Administracion\UsuarioController;
use App\Http\Controllers\Api\ExpedienteEstudianteController;
use Illuminate\Support\Facades\Route;

Route::apiResource('roles', RoleController::class)->parameters(['roles' => 'registro'])->middleware('permiso:roles');
Route::apiResource('usuarios', UsuarioController::class)->parameters(['usuarios' => 'registro'])->middleware('permiso:usuarios');
Route::apiResource('docentes', DocenteController::class)->parameters(['docentes' => 'registro'])->middleware('permiso:docente');
Route::apiResource('estudiantes', EstudianteController::class)->parameters(['estudiantes' => 'registro'])->middleware('permiso:estudiantes');
Route::apiResource('responsables', ResponsableController::class)->parameters(['responsables' => 'registro'])->middleware('permiso:responsables');
Route::apiResource('relaciones-estudiante-responsable', EstudianteResponsableController::class)
    ->parameters(['relaciones-estudiante-responsable' => 'registro'])->middleware('permiso:estudiante_responsable');
Route::apiResource('fichas-estudiantes', FichaEstudianteController::class)
    ->parameters(['fichas-estudiantes' => 'registro'])->middleware('permiso:ficha_estudiante');
Route::apiResource('demeritos', DemeritoController::class)->parameters(['demeritos' => 'registro'])->middleware('permiso:demeritos');
Route::apiResource('documentos-estudiantes', DocumentoEstudianteController::class)
    ->parameters(['documentos-estudiantes' => 'registro'])->middleware('permiso:documentos_estudiantes');
Route::apiResource('documentos-docentes', DocumentoDocenteController::class)
    ->parameters(['documentos-docentes' => 'registro'])->middleware('permiso:documentos_docentes');
Route::apiResource('auditoria', AuditoriaController::class)->parameters(['auditoria' => 'registro'])->only(['index', 'show'])->middleware('permiso:auditoria');

Route::get('expedientes', [ExpedienteEstudianteController::class, 'index'])->middleware('permiso:estudiantes');
Route::post('expedientes', [ExpedienteEstudianteController::class, 'store'])->middleware('permiso:estudiantes');
Route::get('expedientes/{estudiante}', [ExpedienteEstudianteController::class, 'show'])->middleware('permiso:estudiantes');
Route::put('expedientes/{estudiante}', [ExpedienteEstudianteController::class, 'update'])->middleware('permiso:estudiantes');
