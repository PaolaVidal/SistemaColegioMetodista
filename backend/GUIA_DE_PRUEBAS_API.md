# Guía de rutas y pruebas de la API

Inventario actualizado el 26 de octubre de 2026: **151 rutas** (137 de recursos, 4 de autenticación y 10 operaciones compuestas). La auditoría solo permite consulta. La ruta registrada no garantiza permiso para todos los roles. Las respuestas indicadas corresponden a solicitudes válidas con acceso autorizado; los resultados reales dependen de los datos.

## Preparación y acceso

Base local: `http://localhost:8000/api`. Inicia el backend desde `backend` con `php artisan serve --host=127.0.0.1 --port=8000` o usa Docker Compose. En Postman configura `Accept: application/json` y `Content-Type: application/json`; después del login agrega `Authorization: Bearer <token>`.

El login verifica correo, contraseña y cuenta activa. **No exige un rol específico**: el permiso se evalúa al llamar cada endpoint. Los usuarios de prueba de la base local fueron comprobados con la contraseña `password123`:

| Rol | Correo de ejemplo | Alcance |
| --- | --- | --- |
| Administrador | `admin1@colegiometodista.test` | Todas las tablas |
| Docente | `docente1@colegiometodista.test` | Sus asignaciones y estudiantes |
| Estudiante | `estudiante1@colegiometodista.test` | Sus registros |
| Encargado (Responsable) | `encargado1@colegiometodista.test` | Estudiantes vinculados |
| Secretaría | Sin cuenta en el seeder | Debe crearla un administrador |

Solicitud de login:

```http
POST /api/auth/login
Content-Type: application/json
Accept: application/json

{"correo":"admin1@colegiometodista.test","contrasena":"password123"}
```

Respuesta `200`: `{"usuario":{"id":1,"id_rol":1,"nombre_usuario":"admin1","correo":"admin1@colegiometodista.test","activo":true},"token":"<TOKEN>"}`. Los identificadores son ilustrativos. La contraseña y el token de recuperación no se devuelven. Credenciales inválidas o cuenta inactiva en login: `401`. Campos ausentes o mal formados: `422`.

Para crear una cuenta de Secretaría: inicia sesión como administrador, consulta `GET /api/roles`, toma el `id` cuyo `nombre` sea `Secretaría` y envía `POST /api/usuarios` con `id_rol`, `nombre_usuario`, `correo`, `contrasena` y `activo`. En esta base local el rol Secretaría tiene ID 13, pero consulta su ID en otros entornos. No ejecutes el seeder de nuevo sobre datos existentes para intentar crear esa cuenta.

Ejemplo de creación en la base local, usando el token de administrador:

```http
POST /api/usuarios
Authorization: Bearer <token_admin>
Content-Type: application/json

{"id_rol":13,"nombre_usuario":"secretaria1","correo":"secretaria1@colegiometodista.test","contrasena":"clave-de-prueba","activo":true}
```

Después inicia sesión con `secretaria1@colegiometodista.test` y la contraseña elegida. Si el correo ya existe, el alta responde `409` por unicidad.

## Respuestas comunes

| Situación | Código | Forma de respuesta |
| --- | --- | --- |
| Listar un recurso | 200 | Objeto paginado con `data`, `current_page`, `total`, `links` |
| Consultar o actualizar un registro | 200 | Objeto JSON del registro |
| Crear un registro | 201 | Objeto JSON creado |
| Eliminar un registro | 204 | Sin cuerpo |
| Sin token, token revocado o expirado | 401 | JSON de autenticación no autorizada |
| Escritura manual de auditoría | 405 | Método no permitido |
| Sesión del frontend sin CSRF válido al escribir | 419 | Token CSRF inválido |
| Exceso de intentos de login | 429 | Límite de solicitudes excedido |
| Rol sin permiso o usuario inactivo | 403 | JSON con `message` |
| Registro inexistente o fuera del alcance del usuario | 404 | JSON con `message` |
| Datos inválidos | 422 | JSON con `message` y `errors` |
| Conflicto de integridad conocido | 409 | JSON con `message` |

Los listados CRUD admiten `?por_pagina=25&orden=id&direccion=asc` y filtros exactos, por ejemplo `?filtros[activo]=1`. `por_pagina` se limita a 1–100. `GET /api/asignaturas?buscar=Mat` permite buscar por nombre o código. El alta valida columnas del esquema y claves foráneas; cada tabla puede imponer reglas adicionales.

## Autenticación

| Método | Ruta | Respuesta esperada |
| --- | --- | --- |
| POST | `/api/auth/login` | 200 usuario y token |
| POST | `/api/auth/sesion` | 200 usuario; cookies y CSRF desde frontend autorizado |
| GET | `/api/auth/me` | 200 usuario autenticado |
| POST | `/api/auth/logout` | 204; revoca el token actual o invalida la sesión |

El login por token también devuelve `token_type` y `expires_at`; la duración es de 8 horas por defecto. Consulte [Seguridad, autenticación y auditoría](../documentacion/Seguridad-autenticacion-auditoria.md) para el flujo con cookies, límites de login y evidencias.

## Inventario completo de rutas CRUD

Cada recurso tiene cinco registros de ruta: listar, crear, consultar, actualizar (`PUT` o `PATCH`) y eliminar, excepto auditoría, que solo tiene listar y consultar. `GET|HEAD` en `route:list` se presenta aquí como `GET`. Las rutas están en el orden funcional de los archivos de rutas.

### Catálogos

| N.º | Método | Ruta | Respuesta esperada |
| ---: | --- | --- | --- |
| 1 | GET | `/api/ciclos` | 200 lista paginada |
| 2 | POST | `/api/ciclos` | 201 registro creado |
| 3 | GET | `/api/ciclos/{ciclo}` | 200 registro o 404 |
| 4 | PUT o PATCH | `/api/ciclos/{ciclo}` | 200 registro actualizado |
| 5 | DELETE | `/api/ciclos/{ciclo}` | 204 sin cuerpo |
| 6 | GET | `/api/grados` | 200 lista paginada |
| 7 | POST | `/api/grados` | 201 registro creado |
| 8 | GET | `/api/grados/{registro}` | 200 registro o 404 |
| 9 | PUT o PATCH | `/api/grados/{registro}` | 200 registro actualizado |
| 10 | DELETE | `/api/grados/{registro}` | 204 sin cuerpo |
| 11 | GET | `/api/asignaturas` | 200 lista paginada |
| 12 | POST | `/api/asignaturas` | 201 registro creado |
| 13 | GET | `/api/asignaturas/{asignatura}` | 200 registro o 404 |
| 14 | PUT o PATCH | `/api/asignaturas/{asignatura}` | 200 registro actualizado |
| 15 | DELETE | `/api/asignaturas/{asignatura}` | 204 sin cuerpo |

### Personas y expedientes

| N.º | Método | Ruta | Respuesta esperada |
| ---: | --- | --- | --- |
| 16 | GET | `/api/roles` | 200 lista paginada |
| 17 | POST | `/api/roles` | 201 registro creado |
| 18 | GET | `/api/roles/{registro}` | 200 registro o 404 |
| 19 | PUT o PATCH | `/api/roles/{registro}` | 200 registro actualizado |
| 20 | DELETE | `/api/roles/{registro}` | 204 sin cuerpo |
| 21 | GET | `/api/usuarios` | 200 lista paginada |
| 22 | POST | `/api/usuarios` | 201 registro creado |
| 23 | GET | `/api/usuarios/{registro}` | 200 registro o 404 |
| 24 | PUT o PATCH | `/api/usuarios/{registro}` | 200 registro actualizado |
| 25 | DELETE | `/api/usuarios/{registro}` | 204 sin cuerpo |
| 26 | GET | `/api/docentes` | 200 lista paginada |
| 27 | POST | `/api/docentes` | 201 registro creado |
| 28 | GET | `/api/docentes/{registro}` | 200 registro o 404 |
| 29 | PUT o PATCH | `/api/docentes/{registro}` | 200 registro actualizado |
| 30 | DELETE | `/api/docentes/{registro}` | 204 sin cuerpo |
| 31 | GET | `/api/estudiantes` | 200 lista paginada |
| 32 | POST | `/api/estudiantes` | 201 registro creado |
| 33 | GET | `/api/estudiantes/{registro}` | 200 registro o 404 |
| 34 | PUT o PATCH | `/api/estudiantes/{registro}` | 200 registro actualizado |
| 35 | DELETE | `/api/estudiantes/{registro}` | 204 sin cuerpo |
| 36 | GET | `/api/responsables` | 200 lista paginada |
| 37 | POST | `/api/responsables` | 201 registro creado |
| 38 | GET | `/api/responsables/{registro}` | 200 registro o 404 |
| 39 | PUT o PATCH | `/api/responsables/{registro}` | 200 registro actualizado |
| 40 | DELETE | `/api/responsables/{registro}` | 204 sin cuerpo |
| 41 | GET | `/api/relaciones-estudiante-responsable` | 200 lista paginada |
| 42 | POST | `/api/relaciones-estudiante-responsable` | 201 registro creado |
| 43 | GET | `/api/relaciones-estudiante-responsable/{registro}` | 200 registro o 404 |
| 44 | PUT o PATCH | `/api/relaciones-estudiante-responsable/{registro}` | 200 registro actualizado |
| 45 | DELETE | `/api/relaciones-estudiante-responsable/{registro}` | 204 sin cuerpo |
| 46 | GET | `/api/fichas-estudiantes` | 200 lista paginada |
| 47 | POST | `/api/fichas-estudiantes` | 201 registro creado |
| 48 | GET | `/api/fichas-estudiantes/{registro}` | 200 registro o 404 |
| 49 | PUT o PATCH | `/api/fichas-estudiantes/{registro}` | 200 registro actualizado |
| 50 | DELETE | `/api/fichas-estudiantes/{registro}` | 204 sin cuerpo |
| 51 | GET | `/api/demeritos` | 200 lista paginada |
| 52 | POST | `/api/demeritos` | 201 registro creado |
| 53 | GET | `/api/demeritos/{registro}` | 200 registro o 404 |
| 54 | PUT o PATCH | `/api/demeritos/{registro}` | 200 registro actualizado |
| 55 | DELETE | `/api/demeritos/{registro}` | 204 sin cuerpo |
| 56 | GET | `/api/documentos-estudiantes` | 200 lista paginada |
| 57 | POST | `/api/documentos-estudiantes` | 201 registro creado |
| 58 | GET | `/api/documentos-estudiantes/{registro}` | 200 registro o 404 |
| 59 | PUT o PATCH | `/api/documentos-estudiantes/{registro}` | 200 registro actualizado |
| 60 | DELETE | `/api/documentos-estudiantes/{registro}` | 204 sin cuerpo |
| 61 | GET | `/api/documentos-docentes` | 200 lista paginada |
| 62 | POST | `/api/documentos-docentes` | 201 registro creado |
| 63 | GET | `/api/documentos-docentes/{registro}` | 200 registro o 404 |
| 64 | PUT o PATCH | `/api/documentos-docentes/{registro}` | 200 registro actualizado |
| 65 | DELETE | `/api/documentos-docentes/{registro}` | 204 sin cuerpo |
| 66 | GET | `/api/auditoria` | 200 lista paginada |
| 67 | GET | `/api/auditoria/{registro}` | 200 registro o 404 |

### Académico

| N.º | Método | Ruta | Respuesta esperada |
| ---: | --- | --- | --- |
| 68 | GET | `/api/secciones` | 200 lista paginada |
| 69 | POST | `/api/secciones` | 201 registro creado |
| 70 | GET | `/api/secciones/{registro}` | 200 registro o 404 |
| 71 | PUT o PATCH | `/api/secciones/{registro}` | 200 registro actualizado |
| 72 | DELETE | `/api/secciones/{registro}` | 204 sin cuerpo |
| 73 | GET | `/api/matriculas` | 200 lista paginada |
| 74 | POST | `/api/matriculas` | 201 registro creado |
| 75 | GET | `/api/matriculas/{registro}` | 200 registro o 404 |
| 76 | PUT o PATCH | `/api/matriculas/{registro}` | 200 registro actualizado |
| 77 | DELETE | `/api/matriculas/{registro}` | 204 sin cuerpo |
| 78 | GET | `/api/asignaciones-cursos` | 200 lista paginada |
| 79 | POST | `/api/asignaciones-cursos` | 201 registro creado |
| 80 | GET | `/api/asignaciones-cursos/{registro}` | 200 registro o 404 |
| 81 | PUT o PATCH | `/api/asignaciones-cursos/{registro}` | 200 registro actualizado |
| 82 | DELETE | `/api/asignaciones-cursos/{registro}` | 204 sin cuerpo |
| 83 | GET | `/api/horarios` | 200 lista paginada |
| 84 | POST | `/api/horarios` | 201 registro creado |
| 85 | GET | `/api/horarios/{registro}` | 200 registro o 404 |
| 86 | PUT o PATCH | `/api/horarios/{registro}` | 200 registro actualizado |
| 87 | DELETE | `/api/horarios/{registro}` | 204 sin cuerpo |
| 88 | GET | `/api/evaluaciones` | 200 lista paginada |
| 89 | POST | `/api/evaluaciones` | 201 registro creado |
| 90 | GET | `/api/evaluaciones/{registro}` | 200 registro o 404 |
| 91 | PUT o PATCH | `/api/evaluaciones/{registro}` | 200 registro actualizado |
| 92 | DELETE | `/api/evaluaciones/{registro}` | 204 sin cuerpo |
| 93 | GET | `/api/calificaciones` | 200 lista paginada |
| 94 | POST | `/api/calificaciones` | 201 registro creado |
| 95 | GET | `/api/calificaciones/{registro}` | 200 registro o 404 |
| 96 | PUT o PATCH | `/api/calificaciones/{registro}` | 200 registro actualizado |
| 97 | DELETE | `/api/calificaciones/{registro}` | 204 sin cuerpo |
| 98 | GET | `/api/asistencias` | 200 lista paginada |
| 99 | POST | `/api/asistencias` | 201 registro creado |
| 100 | GET | `/api/asistencias/{registro}` | 200 registro o 404 |
| 101 | PUT o PATCH | `/api/asistencias/{registro}` | 200 registro actualizado |
| 102 | DELETE | `/api/asistencias/{registro}` | 204 sin cuerpo |
| 103 | GET | `/api/tareas` | 200 lista paginada |
| 104 | POST | `/api/tareas` | 201 registro creado |
| 105 | GET | `/api/tareas/{registro}` | 200 registro o 404 |
| 106 | PUT o PATCH | `/api/tareas/{registro}` | 200 registro actualizado |
| 107 | DELETE | `/api/tareas/{registro}` | 204 sin cuerpo |

### Finanzas

| N.º | Método | Ruta | Respuesta esperada |
| ---: | --- | --- | --- |
| 108 | GET | `/api/aranceles-base` | 200 lista paginada |
| 109 | POST | `/api/aranceles-base` | 201 registro creado |
| 110 | GET | `/api/aranceles-base/{registro}` | 200 registro o 404 |
| 111 | PUT o PATCH | `/api/aranceles-base/{registro}` | 200 registro actualizado |
| 112 | DELETE | `/api/aranceles-base/{registro}` | 204 sin cuerpo |
| 113 | GET | `/api/cuentas-por-cobrar` | 200 lista paginada |
| 114 | POST | `/api/cuentas-por-cobrar` | 201 registro creado |
| 115 | GET | `/api/cuentas-por-cobrar/{registro}` | 200 registro o 404 |
| 116 | PUT o PATCH | `/api/cuentas-por-cobrar/{registro}` | 200 registro actualizado |
| 117 | DELETE | `/api/cuentas-por-cobrar/{registro}` | 204 sin cuerpo |
| 118 | GET | `/api/pagos` | 200 lista paginada |
| 119 | POST | `/api/pagos` | 201 registro creado |
| 120 | GET | `/api/pagos/{registro}` | 200 registro o 404 |
| 121 | PUT o PATCH | `/api/pagos/{registro}` | 200 registro actualizado |
| 122 | DELETE | `/api/pagos/{registro}` | 204 sin cuerpo |
| 123 | GET | `/api/descuentos-alumnos` | 200 lista paginada |
| 124 | POST | `/api/descuentos-alumnos` | 201 registro creado |
| 125 | GET | `/api/descuentos-alumnos/{registro}` | 200 registro o 404 |
| 126 | PUT o PATCH | `/api/descuentos-alumnos/{registro}` | 200 registro actualizado |
| 127 | DELETE | `/api/descuentos-alumnos/{registro}` | 204 sin cuerpo |

### Comunicación

| N.º | Método | Ruta | Respuesta esperada |
| ---: | --- | --- | --- |
| 128 | GET | `/api/anuncios` | 200 lista paginada |
| 129 | POST | `/api/anuncios` | 201 registro creado |
| 130 | GET | `/api/anuncios/{registro}` | 200 registro o 404 |
| 131 | PUT o PATCH | `/api/anuncios/{registro}` | 200 registro actualizado |
| 132 | DELETE | `/api/anuncios/{registro}` | 204 sin cuerpo |
| 133 | GET | `/api/notificaciones` | 200 lista paginada |
| 134 | POST | `/api/notificaciones` | 201 registro creado |
| 135 | GET | `/api/notificaciones/{registro}` | 200 registro o 404 |
| 136 | PUT o PATCH | `/api/notificaciones/{registro}` | 200 registro actualizado |
| 137 | DELETE | `/api/notificaciones/{registro}` | 204 sin cuerpo |

## Operaciones compuestas

Estas diez rutas tienen respuestas distintas del patrón CRUD. Están agrupadas después de los recursos principales para facilitar las pruebas.

| N.º | Método | Ruta | Respuesta esperada |
| ---: | --- | --- | --- |
| 138 | GET | `/api/expedientes` | 200 lista paginada de estudiantes |
| 139 | POST | `/api/expedientes` | 201 expediente creado |
| 140 | GET | `/api/expedientes/{estudiante}` | 200 expediente o 404 |
| 141 | PUT | `/api/expedientes/{estudiante}` | 200 expediente actualizado |
| 142 | GET | `/api/asignaciones/{asignacion}/evaluaciones` | 200 arreglo de evaluaciones o 404 |
| 143 | GET | `/api/evaluaciones/{evaluacion}/calificaciones` | 200 evaluación y calificaciones o 404 |
| 144 | PUT | `/api/evaluaciones/{evaluacion}/calificaciones` | 200 evaluación y calificaciones actualizadas |
| 145 | GET | `/api/asignaciones/{asignacion}/asistencias` | 200 asignación, fecha y estudiantes o 422 si falta fecha |
| 146 | PUT | `/api/asignaciones/{asignacion}/asistencias/{fecha}` | 200 lista de asistencia actualizada |
| 147 | GET | `/api/estudiantes/{estudiante}/asistencias` | 200 historial paginado o 404 |

### Cuerpos para las operaciones transaccionales

Registro de calificaciones por evaluación (`PUT /api/evaluaciones/{evaluacion}/calificaciones`):

```json
{"calificaciones":[{"id_matricula":1,"nota":8.5},{"id_matricula":2,"nota":9.0}]}
```

La nota debe estar entre 0 y 10 y las matrículas deben pertenecer a la sección y ciclo de la evaluación. El docente solo puede registrar notas de sus asignaciones.

Pase de lista (`PUT /api/asignaciones/{asignacion}/asistencias/2026-10-16`):

```json
{"asistencias":[{"id_matricula":1,"estado":"Presente"},{"id_matricula":2,"estado":"Tardanza"}]}
```

Estados admitidos: `Presente`, `Ausente`, `Tardanza`, `Justificado`. Para consultar el pase de lista, usa `GET /api/asignaciones/{asignacion}/asistencias?fecha=2026-10-16`. El historial acepta `fecha_inicio` y `fecha_fin`.

`GET /api/expedientes/{estudiante}` devuelve `estudiante`, `ficha`, `responsables` y `matriculas`. Al docente se le oculta la lista de responsables. Los alumnos y encargados solo reciben la información dentro de su alcance.

## Permisos por rol

Leyenda: `C` crear, `R` leer, `U` actualizar, `D` eliminar; `—` sin acceso. Las restricciones de alcance se aplican en las consultas de base de datos.

| Recurso | Administrador | Docente | Secretaría | Estudiante / Encargado |
| --- | --- | --- | --- | --- |
| `/api/ciclos` | CRUD | R | R | — |
| `/api/grados` | CRUD | R | R | — |
| `/api/asignaturas` | CRUD | R | R | — |
| `/api/roles` | CRUD | — | — | — |
| `/api/usuarios` | CRUD | — | — | — |
| `/api/docentes` | CRUD | R | — | — |
| `/api/estudiantes` | CRUD | R | CRU | R |
| `/api/responsables` | CRUD | — | CRU | R |
| `/api/relaciones-estudiante-responsable` | CRUD | — | CRU | — |
| `/api/fichas-estudiantes` | CRUD | R | CRU | R |
| `/api/demeritos` | CRUD | CRUD | R | R |
| `/api/documentos-estudiantes` | CRUD | — | CRUD | R |
| `/api/documentos-docentes` | CRUD | CRUD | — | — |
| `/api/auditoria` | R | — | — | — |
| `/api/secciones` | CRUD | R | R | — |
| `/api/matriculas` | CRUD | R | CRU | R |
| `/api/asignaciones-cursos` | CRUD | R | R | — |
| `/api/horarios` | CRUD | R | R | R |
| `/api/evaluaciones` | CRUD | CRUD | R | R |
| `/api/calificaciones` | CRUD | CRUD | R | R |
| `/api/asistencias` | CRUD | CRUD | R | R |
| `/api/tareas` | CRUD | CRUD | R | R |
| `/api/aranceles-base` | CRUD | — | R | — |
| `/api/cuentas-por-cobrar` | CRUD | — | CRUD | R |
| `/api/pagos` | CRUD | — | CRUD | R |
| `/api/descuentos-alumnos` | CRUD | — | CRUD | — |
| `/api/anuncios` | CRUD | R | R | R |
| `/api/notificaciones` | CRUD | R | CR | R |

Las rutas de expediente siguen los permisos de estudiantes, ficha y responsables. Las rutas transaccionales de notas y asistencia permiten escritura a Administrador y Docente; Secretaría solo consulta. Estudiante y Encargado solo consultan datos propios o de los alumnos vinculados. La base usa el nombre de rol `Encargado`; la política también acepta `Responsable`.

## Secuencia mínima de comprobación

1. Inicia el backend y llama `POST /api/auth/login` con `admin1@colegiometodista.test` y `password123`.
2. Copia el `token` en `Authorization: Bearer <token>` y comprueba `GET /api/auth/me`.
3. Ejecuta `GET /api/roles`, `GET /api/estudiantes?por_pagina=2` y un CRUD sencillo de prueba en `grados` con un nombre nuevo. Usa el `id` que devuelva el alta para consultar, actualizar y eliminar ese registro.
4. Inicia sesión con `docente1@colegiometodista.test`: `GET /api/asignaciones-cursos` debe mostrar solo sus cursos; `GET /api/pagos` debe responder 403.
5. Inicia sesión con `estudiante1@colegiometodista.test`: `GET /api/estudiantes` debe mostrar solo su registro; `POST /api/estudiantes` debe responder 403.
6. Inicia sesión con `encargado1@colegiometodista.test`: `GET /api/estudiantes` debe mostrar sus estudiantes vinculados; el acceso a otro estudiante por ID debe responder 404.
7. Consulta `POST /api/auth/logout`; después, el mismo token debe recibir 401 en `GET /api/auth/me`.

Ejemplo de creación sencilla con administrador:

```http
POST /api/grados
Authorization: Bearer <token>
Content-Type: application/json

{"nombre":"Grado de prueba API"}
```

Ejemplo de respuesta `201`: `{"id":123,"nombre":"Grado de prueba API"}`. Sustituye `123` por el ID realmente devuelto y prueba `GET`, `PATCH` y `DELETE` sobre `/api/grados/{id}`.

## Verificación anterior (16 de octubre de 2026)

Se comprobó el registro de las 153 rutas y la existencia local de usuarios de prueba por rol. Se ejecutó `ApiResourcesTest`: 3 pruebas, 42 aserciones correctas. Esto verifica listados de recursos, login y CRUD de grados y usuarios. También se probó por HTTP: login de administrador, `GET /api/roles` (`200`), `GET /api/auth/me` (`200`), logout (`204`) y reutilización del token revocado (`401`). Docente, Estudiante y Encargado recibieron `200` en `GET /api/estudiantes` y `403` en `GET /api/usuarios`; el total visible fue 25, 1 y 1 registros respectivamente. La política de lectura ejecutó consultas sin errores para los cinco roles. Estas comprobaciones no constituyen una prueba funcional individual de las 153 rutas.


