<?php

namespace App\Support;

// Formatos salvadoreños de DUI y teléfono que se validan en todas las entradas.
class Formatos
{
    public const DUI = 'regex:/^\d{8}-\d$/';

    public const TELEFONO = 'regex:/^\d{4}-\d{4}$/';

    // Mensajes de validación para los campos indicados ([campo => 'dui'|'telefono']).
    public static function mensajes(array $campos): array
    {
        $textos = [
            'dui' => 'El DUI debe tener el formato 00000000-0.',
            'telefono' => 'El teléfono debe tener el formato 0000-0000.',
        ];

        return collect($campos)->mapWithKeys(fn ($tipo, $campo) => ["{$campo}.regex" => $textos[$tipo]])->all();
    }
}
