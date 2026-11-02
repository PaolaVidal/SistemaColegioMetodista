<?php

namespace App\Policies\Api;

use App\Models\Usuario;
use Illuminate\Database\Query\Builder;
use Illuminate\Support\Facades\DB;

class ResourcePolicy
{
    private const DOCENTE = [
        'asignaturas' => 'R', 'estudiantes' => 'R', 'asistencias' => 'CRUD',
        'calificaciones' => 'CRUD', 'tareas' => 'CRUD', 'evaluaciones' => 'CRUD',
        'demeritos' => 'CRUD', 'horarios' => 'R', 'anuncios' => 'R',
        'notificaciones' => 'R', 'docente' => 'R', 'documentos_docentes' => 'CRUD',
        'grados' => 'R', 'secciones' => 'R', 'ciclos' => 'R',
        'asignaciones_cursos' => 'R', 'matriculas' => 'R', 'ficha_estudiante' => 'R',
    ];

    private const SECRETARIA = [
        'cuentas_por_cobrar' => 'CRUD', 'pagos' => 'CRUD',
        'descuentos_alumnos' => 'CRUD', 'aranceles_base' => 'R',
        'estudiantes' => 'CRU', 'responsables' => 'CRU',
        'estudiante_responsable' => 'CRU', 'matriculas' => 'CRU',
        'ficha_estudiante' => 'CRU', 'documentos_estudiantes' => 'CRUD',
        'anuncios' => 'R', 'notificaciones' => 'CR',
        'grados' => 'R', 'secciones' => 'R', 'asignaturas' => 'R',
        'ciclos' => 'R', 'asignaciones_cursos' => 'R', 'horarios' => 'R',
        'calificaciones' => 'R', 'asistencias' => 'R', 'tareas' => 'R',
        'evaluaciones' => 'R', 'demeritos' => 'R',
    ];

    private const FAMILIA = [
        'calificaciones', 'asistencias', 'tareas', 'horarios', 'evaluaciones',
        'matriculas', 'demeritos', 'notificaciones', 'anuncios',
        'cuentas_por_cobrar', 'pagos', 'estudiantes', 'ficha_estudiante',
        'documentos_estudiantes', 'responsables',
    ];

    public function rol(Usuario $usuario): string
    {
        $nombre = DB::table('roles')->where('id', $usuario->id_rol)->value('nombre');

        return match (mb_strtolower(trim((string) $nombre))) {
            'administrador', 'admin' => 'administrador',
            'docente' => 'docente',
            'secretaría', 'secretaria' => 'secretaria',
            'estudiante' => 'estudiante',
            'encargado', 'responsable' => 'responsable',
            default => '',
        };
    }

    public function autorizar(Usuario $usuario, string $tabla, string $accion): void
    {
        abort_unless($usuario->activo, 403, 'La cuenta está inactiva.');
        $rol = $this->rol($usuario);
        if ($tabla === 'auditoria') {
            abort_unless($rol === 'administrador' && $accion === 'R', 403, 'La auditoría es de solo lectura para el administrador.');

            return;
        }
        $permitido = match ($rol) {
            'administrador' => true,
            'docente' => str_contains(self::DOCENTE[$tabla] ?? '', $accion),
            'secretaria' => str_contains(self::SECRETARIA[$tabla] ?? '', $accion),
            'estudiante', 'responsable' => $accion === 'R' && in_array($tabla, self::FAMILIA, true),
            default => false,
        };
        abort_unless($permitido, 403, 'No tiene permiso para esta operación.');
    }

    public function consulta(Usuario $usuario, string $tabla): Builder
    {
        $this->autorizar($usuario, $tabla, 'R');

        return $this->aplicarAlcance(DB::table($tabla), $usuario, $tabla);
    }

    public function visible(Usuario $usuario, string $tabla, int $id): bool
    {
        return $this->consulta($usuario, $tabla)->where($tabla.'.id', $id)->exists();
    }

    public function asignacionVisible(Usuario $usuario, int $id): bool
    {
        $rol = $this->rol($usuario);
        if ($rol === 'administrador' || $rol === 'secretaria') {
            return DB::table('asignaciones_cursos')->where('id', $id)->exists();
        }
        if ($rol === 'docente') {
            return $this->consulta($usuario, 'asignaciones_cursos')->where('asignaciones_cursos.id', $id)->exists();
        }
        $estudiantes = $rol === 'estudiante'
            ? DB::table('estudiantes')->select('id')->where('id_usuario', $usuario->id)
            : DB::table('estudiante_responsable')->join('responsables', 'responsables.id', '=', 'estudiante_responsable.id_responsable')
                ->select('estudiante_responsable.id_estudiante')->where('responsables.id_usuario', $usuario->id);

        return DB::table('asignaciones_cursos')->where('id', $id)->whereExists(function ($q) use ($estudiantes) {
            $q->selectRaw('1')->from('matriculas')
                ->whereColumn('matriculas.id_ciclo', 'asignaciones_cursos.id_ciclo')
                ->whereColumn('matriculas.id_seccion', 'asignaciones_cursos.id_seccion')
                ->whereIn('matriculas.id_estudiante', $estudiantes);
        })->exists();
    }

    public function aplicarAlcance(Builder $consulta, Usuario $usuario, string $tabla): Builder
    {
        $rol = $this->rol($usuario);
        if ($rol === 'administrador' || $rol === 'secretaria') {
            return $consulta;
        }

        if ($rol === 'docente') {
            $docentes = fn () => DB::table('docente')->select('id')->where('id_usuario', $usuario->id);
            $asignaciones = fn () => DB::table('asignaciones_cursos')->select('id')->whereIn('id_docente', $docentes());
            $matriculas = fn () => DB::table('matriculas')->select('matriculas.id')->whereExists(function ($q) use ($docentes) {
                $q->selectRaw('1')->from('asignaciones_cursos')
                    ->whereColumn('asignaciones_cursos.id_ciclo', 'matriculas.id_ciclo')
                    ->whereColumn('asignaciones_cursos.id_seccion', 'matriculas.id_seccion')
                    ->whereIn('asignaciones_cursos.id_docente', $docentes());
            });
            $estudiantes = fn () => DB::table('matriculas')->select('id_estudiante')->whereIn('id', $matriculas());
            $evaluaciones = fn () => DB::table('evaluaciones')->select('id')->whereIn('id_asignacion_curso', $asignaciones());

            return match ($tabla) {
                'docente' => $consulta->where('docente.id_usuario', $usuario->id),
                'documentos_docentes' => $consulta->whereIn('documentos_docentes.id_docente', $docentes()),
                'asignaciones_cursos' => $consulta->whereIn('asignaciones_cursos.id', $asignaciones()),
                'ciclos' => $consulta->whereIn('ciclos.id', DB::table('asignaciones_cursos')->select('id_ciclo')->whereIn('id', $asignaciones())),
                'secciones' => $consulta->whereIn('secciones.id', DB::table('asignaciones_cursos')->select('id_seccion')->whereIn('id', $asignaciones())),
                'grados' => $consulta->whereIn('grados.id', DB::table('secciones')->select('id_grado')->whereIn('id', DB::table('asignaciones_cursos')->select('id_seccion')->whereIn('id', $asignaciones()))),
                'asignaturas' => $consulta->whereIn('asignaturas.id', DB::table('asignaciones_cursos')->select('id_asignatura')->whereIn('id', $asignaciones())),
                'estudiantes' => $consulta->whereIn('estudiantes.id', $estudiantes()),
                'matriculas' => $consulta->whereIn('matriculas.id', $matriculas()),
                'ficha_estudiante' => $consulta->whereIn('ficha_estudiante.id_estudiante', $estudiantes()),
                'calificaciones' => $consulta->whereIn('calificaciones.id_evaluacion', $evaluaciones())->whereIn('calificaciones.id_matricula', $matriculas()),
                'evaluaciones' => $consulta->whereIn('evaluaciones.id_asignacion_curso', $asignaciones()),
                'asistencias', 'tareas', 'horarios' => $consulta->whereIn($tabla.'.id_asignacion_curso', $asignaciones()),
                'notificaciones' => $consulta->where('notificaciones.id_usuario_destino', $usuario->id),
                'demeritos', 'anuncios' => $consulta,
                default => $consulta->whereRaw('1 = 0'),
            };
        }

        $estudiantes = $rol === 'estudiante'
            ? fn () => DB::table('estudiantes')->select('id')->where('id_usuario', $usuario->id)
            : fn () => DB::table('estudiante_responsable')->join('responsables', 'responsables.id', '=', 'estudiante_responsable.id_responsable')
                ->select('estudiante_responsable.id_estudiante')->where('responsables.id_usuario', $usuario->id);
        $matriculas = fn () => DB::table('matriculas')->select('id')->whereIn('id_estudiante', $estudiantes());
        $asignaciones = fn () => DB::table('asignaciones_cursos')->select('asignaciones_cursos.id')->whereExists(function ($q) use ($estudiantes) {
            $q->selectRaw('1')->from('matriculas')
                ->whereColumn('matriculas.id_ciclo', 'asignaciones_cursos.id_ciclo')
                ->whereColumn('matriculas.id_seccion', 'asignaciones_cursos.id_seccion')
                ->whereIn('matriculas.id_estudiante', $estudiantes());
        });
        $cuentas = fn () => DB::table('cuentas_por_cobrar')->select('id')->whereIn('id_estudiante', $estudiantes());

        return match ($tabla) {
            'estudiantes' => $consulta->whereIn('estudiantes.id', $estudiantes()),
            'matriculas' => $consulta->whereIn('matriculas.id', $matriculas()),
            'calificaciones', 'asistencias' => $consulta->whereIn($tabla.'.id_matricula', $matriculas()),
            'ficha_estudiante', 'documentos_estudiantes', 'demeritos', 'cuentas_por_cobrar' => $consulta->whereIn($tabla.'.id_estudiante', $estudiantes()),
            'pagos' => $consulta->whereIn('pagos.id_cuenta_cobrar', $cuentas()),
            'tareas', 'horarios', 'evaluaciones' => $consulta->whereIn($tabla.'.id_asignacion_curso', $asignaciones()),
            'responsables' => $rol === 'responsable'
                ? $consulta->where('responsables.id_usuario', $usuario->id)
                : $consulta->whereIn('responsables.id', DB::table('estudiante_responsable')->select('id_responsable')->whereIn('id_estudiante', $estudiantes())),
            'notificaciones' => $consulta->where('notificaciones.id_usuario_destino', $usuario->id),
            'anuncios' => $consulta,
            default => $consulta->whereRaw('1 = 0'),
        };
    }

    public function autorizarDestino(Usuario $usuario, string $tabla, array $datos): void
    {
        if ($this->rol($usuario) !== 'docente') {
            return;
        }
        $relacion = match ($tabla) {
            'evaluaciones', 'asistencias', 'tareas' => 'id_asignacion_curso',
            'calificaciones' => 'id_evaluacion',
            'documentos_docentes' => 'id_docente',
            default => null,
        };
        if ($relacion === null) {
            return;
        }
        $destino = $datos[$relacion] ?? null;
        abort_if($destino === null, 403, 'El registro requiere una relación autorizada.');
        $tablaDestino = match ($relacion) {
            'id_evaluacion' => 'evaluaciones',
            'id_docente' => 'docente',
            default => 'asignaciones_cursos',
        };
        abort_unless($this->visible($usuario, $tablaDestino, (int) $destino), 403, 'El registro relacionado está fuera de su alcance.');
        if (in_array($tabla, ['calificaciones', 'asistencias'], true)) {
            abort_unless($this->visible($usuario, 'matriculas', (int) ($datos['id_matricula'] ?? 0)), 403, 'La matrícula está fuera de su alcance.');
        }
    }
}
