<?php

use App\Http\Controllers\Api\Academico\AsignacionCursoController;
use App\Http\Controllers\Api\Academico\AsistenciaRegistroController;
use App\Http\Controllers\Api\Academico\CalificacionRegistroController;
use App\Http\Controllers\Api\Academico\EvaluacionController;
use App\Http\Controllers\Api\Academico\HorarioController;
use App\Http\Controllers\Api\Academico\MatriculaController;
use App\Http\Controllers\Api\Academico\SeccionController;
use App\Http\Controllers\Api\Academico\TareaController;
use App\Http\Controllers\Api\AsistenciaController;
use App\Http\Controllers\Api\CalificacionController;
use Illuminate\Support\Facades\Route;

Route::apiResource('secciones', SeccionController::class)->parameters(['secciones' => 'registro'])->middleware('permiso:secciones');
Route::apiResource('matriculas', MatriculaController::class)->parameters(['matriculas' => 'registro'])->middleware('permiso:matriculas');
Route::apiResource('asignaciones-cursos', AsignacionCursoController::class)
    ->parameters(['asignaciones-cursos' => 'registro'])->middleware('permiso:asignaciones_cursos');
Route::apiResource('horarios', HorarioController::class)->parameters(['horarios' => 'registro'])->middleware('permiso:horarios');
Route::apiResource('evaluaciones', EvaluacionController::class)->parameters(['evaluaciones' => 'registro'])->middleware('permiso:evaluaciones');
Route::apiResource('calificaciones', CalificacionRegistroController::class)
    ->parameters(['calificaciones' => 'registro'])->middleware('permiso:calificaciones');
Route::apiResource('asistencias', AsistenciaRegistroController::class)
    ->parameters(['asistencias' => 'registro'])->middleware('permiso:asistencias');
Route::apiResource('tareas', TareaController::class)->parameters(['tareas' => 'registro'])->middleware('permiso:tareas');

Route::get('asignaciones/{asignacion}/evaluaciones', [CalificacionController::class, 'index'])->middleware('permiso:evaluaciones');
Route::get('evaluaciones/{evaluacion}/calificaciones', [CalificacionController::class, 'show'])->middleware('permiso:calificaciones');
Route::put('evaluaciones/{evaluacion}/calificaciones', [CalificacionController::class, 'registrar'])->middleware('permiso:calificaciones');
Route::get('asignaciones/{asignacion}/asistencias', [AsistenciaController::class, 'index'])->middleware('permiso:asistencias');
Route::put('asignaciones/{asignacion}/asistencias/{fecha}', [AsistenciaController::class, 'registrar'])->middleware('permiso:asistencias');
Route::get('estudiantes/{estudiante}/asistencias', [AsistenciaController::class, 'historialEstudiante'])->middleware('permiso:asistencias');
