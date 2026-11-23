<?php

namespace App\Support;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

// Creación de cuentas de acceso para estudiantes y responsables.
class CuentasUsuario
{
    // Partículas que forman parte del primer apellido ("De la Cruz" → "delacruz").
    private const PARTICULAS = ['de', 'del', 'la', 'las', 'los', 'y', 'da', 'das', 'do', 'dos', 'san', 'santa', 'van', 'von'];

    // Año + inicial del primer nombre + primer apellido; si ya existe se agrega un correlativo.
    // Ej.: Wilber Anibal Rivas Carranza → 2026wrivas, 2026wrivas1, 2026wrivas2...
    public static function sugerirNombre(string $nombres, string $apellidos, ?int $anio = null): string
    {
        $limpiar = fn (string $texto) => preg_replace('/[^a-z]/', '', Str::lower(Str::ascii($texto)));
        $palabrasNombre = preg_split('/\s+/', trim($nombres), -1, PREG_SPLIT_NO_EMPTY);
        $inicial = substr($limpiar($palabrasNombre[0] ?? ''), 0, 1);

        $apellido = '';
        foreach (preg_split('/\s+/', trim($apellidos), -1, PREG_SPLIT_NO_EMPTY) as $palabra) {
            $apellido .= $limpiar($palabra);
            if (! in_array(Str::lower(Str::ascii($palabra)), self::PARTICULAS, true)) {
                break;
            }
        }

        $base = ($anio ?? (int) now()->year).(($inicial.$apellido) ?: 'usuario');
        $base = substr($base, 0, 45);

        $usados = DB::table('usuarios')
            ->whereRaw('lower(nombre_usuario) ~ ?', ['^'.$base.'[0-9]*$'])
            ->pluck('nombre_usuario')
            ->map(fn ($nombre) => Str::lower($nombre));
        if (! $usados->contains($base)) {
            return $base;
        }

        $mayor = $usados->map(fn ($nombre) => (int) substr($nombre, strlen($base)))->max();

        return $base.($mayor + 1);
    }

    // Crea la cuenta con el primer rol existente de la lista y devuelve su id.
    public static function crear(array $roles, array $datos, string $nombres, string $apellidos, string $campo = 'usuario'): int
    {
        $idRol = DB::table('roles')
            ->whereIn(DB::raw('lower(trim(nombre))'), $roles)
            ->value('id');
        if ($idRol === null) {
            throw ValidationException::withMessages([$campo => 'No existe el rol '.ucfirst($roles[0]).' en el sistema.']);
        }

        $nombreUsuario = trim((string) ($datos['nombre_usuario'] ?? ''));
        if ($nombreUsuario === '') {
            $nombreUsuario = self::sugerirNombre($nombres, $apellidos);
        } elseif (DB::table('usuarios')->whereRaw('lower(nombre_usuario) = ?', [Str::lower($nombreUsuario)])->exists()) {
            throw ValidationException::withMessages([$campo.'.nombre_usuario' => "El nombre de usuario {$nombreUsuario} ya está en uso."]);
        }

        return DB::table('usuarios')->insertGetId([
            'id_rol' => $idRol,
            'nombre_usuario' => $nombreUsuario,
            'correo' => $datos['correo'],
            'contrasena' => Hash::make($datos['contrasena']),
            'activo' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    // Sin $conCorreo la cuenta toma el correo de la persona (caso del estudiante).
    public static function reglas(string $campo = 'usuario', bool $conCorreo = true): array
    {
        $reglas = [
            $campo => ['sometimes', 'array'],
            $campo.'.nombre_usuario' => ['nullable', 'string', 'max:50'],
            $campo.'.contrasena' => ['required_with:'.$campo, 'string', 'min:8', 'max:255'],
        ];
        if ($conCorreo) {
            $reglas[$campo.'.correo'] = ['required_with:'.$campo, 'email', 'max:50', 'unique:usuarios,correo'];
        }

        return $reglas;
    }

    public static function resumen(?int $idUsuario): ?object
    {
        return $idUsuario
            ? DB::table('usuarios')->where('id', $idUsuario)->select('id', 'nombre_usuario', 'correo', 'activo', 'ultimo_login')->first()
            : null;
    }
}
