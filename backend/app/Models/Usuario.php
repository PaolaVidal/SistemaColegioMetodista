<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class Usuario extends Authenticatable
{
    use HasApiTokens, Notifiable;

    protected $table = 'usuarios';

    protected $fillable = [
        'id_rol',
        'nombre_usuario',
        'correo',
        'contrasena',
        'token_recuperacion',
        'ultimo_login',
        'activo',
    ];

    protected $hidden = [
        'version_sesion',
        'contrasena',
        'token_recuperacion',
    ];

    protected $casts = [
        'version_sesion' => 'integer',
        'ultimo_login' => 'datetime',
        'activo' => 'boolean',
    ];

    public function getAuthPassword(): string
    {
        return $this->contrasena;
    }

    public function getEmailForPasswordReset(): string
    {
        return $this->correo;
    }
}
