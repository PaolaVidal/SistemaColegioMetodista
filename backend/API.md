# API REST

Base local: `http://localhost:8000/api`. Los recursos requieren un token Sanctum en `Authorization: Bearer <token>` o una sesión del frontend autorizado con cookies y CSRF.

Para probar las 151 rutas, consultar respuestas esperadas y usar cuentas de desarrollo por rol, véase [Guía de rutas y pruebas de la API](GUIA_DE_PRUEBAS_API.md). La implementación de seguridad se documenta en [Seguridad, autenticación y auditoría](../documentacion/Seguridad-autenticacion-auditoria.md).

## Autenticación

| Método | Ruta | Acción |
| --- | --- | --- |
| `POST` | `/api/auth/login` | Recibe `correo` y `contrasena`; devuelve usuario y token |
| `POST` | `/api/auth/sesion` | Inicia sesión con cookies desde el frontend autorizado; requiere CSRF |
| `GET` | `/api/auth/me` | Devuelve el usuario autenticado |
| `POST` | `/api/auth/logout` | Revoca el token actual o invalida la sesión con cookies |

Los tokens duran 480 minutos por defecto (`SANCTUM_EXPIRATION`). El login devuelve también `token_type` y `expires_at`. Cambiar contraseña, rol o estado activo revoca los tokens y las sesiones anteriores. Se limitan los intentos de login a 5 por minuto por correo/IP y 30 por IP.

## Patrón CRUD

Cada recurso de la lista siguiente tiene las cinco rutas REST, excepto `auditoria`, que solo admite los dos GET para el administrador:

| Método | Ruta | Acción |
| --- | --- | --- |
| `GET` | `/api/{recurso}` | Listar |
| `POST` | `/api/{recurso}` | Crear |
| `GET` | `/api/{recurso}/{id}` | Consultar un registro |
| `PUT` o `PATCH` | `/api/{recurso}/{id}` | Actualizar |
| `DELETE` | `/api/{recurso}/{id}` | Eliminar |

Las listas aceptan `por_pagina` (1 a 100), `orden`, `direccion=asc|desc` y filtros exactos `filtros[campo]=valor`. Los controladores validan los campos de acuerdo con el esquema PostgreSQL y comprueban las claves foráneas.

## Recursos y controladores

| Área | Recurso | Tabla | Controlador |
| --- | --- | --- | --- |
| Catálogos | `roles` | `roles` | `Administracion/RoleController` |
| Catálogos | `grados` | `grados` | `Academico/GradoController` |
| Catálogos | `ciclos` | `ciclos` | `CicloController` |
| Catálogos | `asignaturas` | `asignaturas` | `AsignaturaController` |
| Personas | `usuarios` | `usuarios` | `Administracion/UsuarioController` |
| Personas | `docentes` | `docente` | `Administracion/DocenteController` |
| Personas | `estudiantes` | `estudiantes` | `Administracion/EstudianteController` |
| Personas | `responsables` | `responsables` | `Administracion/ResponsableController` |
| Personas | `relaciones-estudiante-responsable` | `estudiante_responsable` | `Administracion/EstudianteResponsableController` |
| Personas | `fichas-estudiantes` | `ficha_estudiante` | `Administracion/FichaEstudianteController` |
| Personas | `demeritos` | `demeritos` | `Administracion/DemeritoController` |
| Documentos | `documentos-estudiantes` | `documentos_estudiantes` | `Administracion/DocumentoEstudianteController` |
| Documentos | `documentos-docentes` | `documentos_docentes` | `Administracion/DocumentoDocenteController` |
| Administración | `auditoria` | `auditoria` | `Administracion/AuditoriaController` |
| Académico | `secciones` | `secciones` | `Academico/SeccionController` |
| Académico | `matriculas` | `matriculas` | `Academico/MatriculaController` |
| Académico | `asignaciones-cursos` | `asignaciones_cursos` | `Academico/AsignacionCursoController` |
| Académico | `horarios` | `horarios` | `Academico/HorarioController` |
| Académico | `evaluaciones` | `evaluaciones` | `Academico/EvaluacionController` |
| Académico | `calificaciones` | `calificaciones` | `Academico/CalificacionRegistroController` |
| Académico | `asistencias` | `asistencias` | `Academico/AsistenciaRegistroController` |
| Académico | `tareas` | `tareas` | `Academico/TareaController` |
| Finanzas | `aranceles-base` | `aranceles_base` | `Finanzas/ArancelBaseController` |
| Finanzas | `cuentas-por-cobrar` | `cuentas_por_cobrar` | `Finanzas/CuentaPorCobrarController` |
| Finanzas | `pagos` | `pagos` | `Finanzas/PagoController` |
| Finanzas | `descuentos-alumnos` | `descuentos_alumnos` | `Finanzas/DescuentoAlumnoController` |
| Comunicación | `anuncios` | `anuncios` | `Comunicacion/AnuncioController` |
| Comunicación | `notificaciones` | `notificaciones` | `Comunicacion/NotificacionController` |

## Operaciones compuestas

| Método | Ruta | Acción |
| --- | --- | --- |
| `GET` | `/api/expedientes` | Buscar estudiantes |
| `POST` | `/api/expedientes` | Crear estudiante con ficha y responsables |
| `GET` | `/api/expedientes/{estudiante}` | Consultar expediente completo |
| `PUT` | `/api/expedientes/{estudiante}` | Actualizar expediente completo |
| `GET` | `/api/asignaciones/{asignacion}/evaluaciones` | Listar evaluaciones del curso |
| `GET` | `/api/evaluaciones/{evaluacion}/calificaciones` | Consultar notas del grupo |
| `PUT` | `/api/evaluaciones/{evaluacion}/calificaciones` | Registrar notas en una transacción |
| `GET` | `/api/asignaciones/{asignacion}/asistencias?fecha=YYYY-MM-DD` | Consultar lista del grupo |
| `PUT` | `/api/asignaciones/{asignacion}/asistencias/{fecha}` | Registrar pase de lista en una transacción |
| `GET` | `/api/estudiantes/{estudiante}/asistencias` | Historial de asistencia |

Las rutas se separan en `routes/api/catalogos.php`, `personas.php`, `academico.php`, `finanzas.php` y `comunicacion.php`. `routes/api.php` solo registra autenticación y carga esos archivos. `Support/CrudController.php` contiene las operaciones repetidas; cada tabla tiene su controlador y sus reglas particulares.

Las tablas internas `migrations`, `failed_jobs` y `personal_access_tokens` pertenecen a Laravel/Sanctum y no se publican como recursos CRUD.

## Permisos y alcance

Las rutas de recursos requieren autenticación y cuenta activa. El middleware `ValidarPermisoRol` consulta `ResourcePolicy` antes del controlador para aplicar la matriz de Administrador, Docente, Secretaría, Estudiante y Responsable (`Encargado` en los datos existentes). Los controladores conservan los filtros de alcance. Una operación sin permiso responde `403`; un registro fuera del alcance responde `404`.

- Administrador: CRUD sobre las tablas de negocio; la auditoría es de solo lectura y se genera automáticamente.
- Docente: consulta únicamente cursos y estudiantes de sus asignaciones; administra asistencias, calificaciones, tareas y evaluaciones de esos cursos, sus documentos y deméritos. Los anuncios son institucionales y las notificaciones son propias.
- Secretaría: administra cuentas, pagos, descuentos, inscripciones, fichas, responsables y documentos de estudiantes. Consulta la estructura académica y los registros de clase.
- Estudiante y Responsable: solo lectura. El estudiante ve sus datos; el responsable ve los de cada estudiante vinculado. Las notificaciones se limitan al usuario destinatario.

Los listados, registros individuales y operaciones compuestas aplican el alcance en la consulta de base de datos. Los cambios de un docente también validan que las relaciones de destino pertenezcan a sus asignaciones. La matriz completa de tablas se encuentra en `app/Policies/Api/ResourcePolicy.php`.
