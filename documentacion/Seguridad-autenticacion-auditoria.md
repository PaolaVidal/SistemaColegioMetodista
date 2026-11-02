# Implementación de seguridad, autenticación y bitácora de auditoría

Proyecto: Sistema Colegio Metodista. Fecha de implementación: 26 de octubre de 2026.

## 1. Autenticación y protección de sesión

Se utiliza Laravel Sanctum con el modelo `Usuario` y la tabla `usuarios`. El sistema valida correo, contraseña almacenada como hash y estado activo. La contraseña no se incluye en las respuestas.

### Acceso por token: Postman y clientes de API

Enviar `POST http://localhost:8000/api/auth/login`, con `Accept: application/json` y este cuerpo JSON:

```json
{
  "correo": "admin1@colegiometodista.test",
  "contrasena": "password123"
}
```

La respuesta contiene `usuario`, `token`, `token_type: "Bearer"` y `expires_at`. En las siguientes peticiones se utiliza `Authorization: Bearer <token>`. Los tokens se guardan como hash en `personal_access_tokens` y duran 480 minutos (8 horas) por defecto. `SANCTUM_EXPIRATION` permite cambiar esa duración, en minutos. Los tokens anteriores también quedan sujetos a la duración máxima desde su creación.

- `GET /api/auth/me`: consulta el usuario autenticado.
- `POST /api/auth/logout`: elimina el token usado en la solicitud; responde 204.
- Un token ausente, inválido, expirado o revocado recibe 401 en las rutas protegidas.
- El login admite 5 intentos por minuto para la misma combinación correo/IP y hasta 30 por IP. Al excederlos responde 429 con el tiempo de espera.
- Cambiar contraseña, rol o estado activo invalida todos los tokens del usuario y aumenta su versión de sesión. Este control también se ejecuta cuando el cambio se realiza directamente en PostgreSQL.
- El scheduler elimina diariamente tokens expirados desde hace al menos 24 horas. La caducidad se valida aunque el scheduler esté detenido.

### Sesiones del frontend con cookies

Los orígenes locales autorizados son `http://localhost:5173` y `http://127.0.0.1:5173`. Se configura CORS con credenciales y una lista explícita de orígenes. Para otro entorno se ajustan `FRONTEND_URLS` y `SANCTUM_STATEFUL_DOMAINS`.

1. El frontend solicita `GET /sanctum/csrf-cookie` con cookies habilitadas (`credentials: include` o `withCredentials: true`).
2. Envía `POST /api/auth/sesion` con correo y contraseña, las cookies, y el valor decodificado de `XSRF-TOKEN` en la cabecera `X-XSRF-TOKEN`.
3. El servidor regenera el identificador de sesión al iniciar sesión. Las peticiones posteriores envían las cookies; las operaciones de escritura incluyen CSRF.
4. `POST /api/auth/logout` invalida la sesión y regenera el token CSRF.

La cookie de sesión es HttpOnly y SameSite=Lax. La sesión caduca tras 120 minutos de inactividad por defecto (`SESSION_LIFETIME`). En producción la cookie es Secure por defecto y requiere HTTPS. No se entrega un token Bearer desde `/auth/sesion`.

Las sesiones anteriores a un cambio de contraseña, rol o estado se rechazan al siguiente acceso. Reactivar una cuenta no recupera su antigua sesión. Una solicitud de escritura del frontend sin CSRF válido responde 419.

El frontend todavía debe consumir este flujo; esta actividad implementa y comprueba la capacidad del backend.

### Archivos para evidencia

| Archivo, relativo a la raíz del proyecto | Evidencia |
| --- | --- |
| `backend/app/Http/Controllers/Api/AuthController.php` | Login por token y sesión, caducidad y cierre de sesión |
| `backend/config/sanctum.php` | Duración de tokens y dominios del frontend |
| `backend/config/session.php` y `backend/config/cors.php` | Cookies y orígenes autorizados |
| `backend/app/Http/Middleware/EnsureActiveUser.php` | Cuenta activa y versión vigente de sesión |
| `backend/app/Providers/RouteServiceProvider.php` | Límite de intentos de autenticación |
| `backend/database/migrations/2026_10_26_000012_protect_user_sessions.php` | Revocación automática de accesos por cambios de seguridad |

## 2. Middleware y matriz de permisos

Las rutas de recursos aplican `auth:sanctum`, `EnsureActiveUser` y `permiso:<tabla>`. El middleware `ValidarPermisoRol` convierte el método HTTP en la operación requerida: GET/HEAD para leer, POST para crear, PUT/PATCH para actualizar y DELETE para eliminar. Después consulta la matriz de `ResourcePolicy`. Si el rol no tiene autorización, devuelve 403 antes de ejecutar el controlador.

Los controladores aplican además restricciones en las consultas SQL: el docente opera sobre sus asignaciones; el estudiante ve sus propios registros; el responsable ve los de sus estudiantes vinculados. Secretaría tiene acceso a los módulos establecidos en la matriz. Los registros fuera del alcance reciben 404, o 403 cuando se intenta crear una relación no autorizada.

El administrador puede gestionar las tablas de negocio. La auditoría constituye una excepción: solo puede consultarla. Este cambio sustituye el permiso CRUD anterior sobre la bitácora para cumplir su inmutabilidad.

| Archivo | Evidencia |
| --- | --- |
| `backend/app/Http/Middleware/ValidarPermisoRol.php` | Validación previa por recurso y operación |
| `backend/app/Policies/Api/ResourcePolicy.php` | Matriz de permisos y filtros de alcance |
| `backend/app/Http/Kernel.php` | Registro del alias `permiso` y middleware de Sanctum |
| `backend/routes/api/*.php` | Aplicación del middleware a recursos y operaciones compuestas |
| `backend/app/Http/Controllers/Api/Support/CrudController.php` | Aplicación de políticas al consultar y modificar registros |

## 3. Bitácora inmutable de calificaciones

Cada inserción, cambio efectivo o eliminación en `calificaciones` genera automáticamente una entrada en `auditoria`, mediante un trigger de PostgreSQL. El registro forma parte de la misma transacción que la nota. Si la transacción falla o se revierte, tampoco se conserva una entrada de un cambio que no ocurrió. Actualizar una nota con los mismos valores no duplica el historial.

La bitácora incluye:

| Campo | Contenido |
| --- | --- |
| `id_usuario` | Usuario autenticado que realizó el cambio por la API |
| `id_registro` | Identificador de la calificación, conservado incluso si se elimina |
| `accion` | Crear, Actualizar o Eliminar |
| `nombre_tabla` | calificaciones |
| `valor_anterior` y `valor_nuevo` | Datos completos antes y después, en JSON |
| `fecha_creacion` | Fecha y hora de la operación |
| `origen` | api, sql, seeder o legado |
| `usuario_bd` | Usuario de la conexión PostgreSQL |

Las operaciones por pgAdmin también se registran. Como esa conexión no identifica a un usuario de la aplicación, `id_usuario` queda nulo y se conserva `usuario_bd`; no se atribuye el cambio a un administrador arbitrario. La identidad de la API se transmite a PostgreSQL dentro de la transacción mediante `ContextoAuditoriaService`, sin aceptar ese valor del cuerpo enviado por el cliente.

La API solo ofrece `GET /api/auditoria` y `GET /api/auditoria/{id}`, para administradores. POST, PUT, PATCH y DELETE no están disponibles y responden 405. PostgreSQL bloquea UPDATE, DELETE y TRUNCATE sobre la bitácora y rechaza inserciones manuales. También impide TRUNCATE de calificaciones, porque omitiría la auditoría individual; las eliminaciones deben usar DELETE.

La protección funciona frente a operaciones normales SQL y de la API. Una cuenta con privilegios para alterar el esquema o deshabilitar triggers puede modificar estas protecciones. En producción se debe separar la cuenta de migraciones/administración de la cuenta de ejecución de Laravel; el superusuario de desarrollo no proporciona esa separación.

Las notas previas a esta migración no reciben un historial inventado. Los registros antiguos de auditoría se conservan con origen `legado`; los nuevos cambios quedan registrados desde la instalación. El seeder genera ahora auditoría real de sus inserciones de notas, con origen `seeder`.

### Consulta para documentar un cambio

En Postman, con un token de administrador:

```text
GET http://localhost:8000/api/auditoria?filtros[nombre_tabla]=calificaciones&orden=id&direccion=desc
```

Para una nota concreta, agregar `&filtros[id_registro]=ID_DE_LA_NOTA`.

En pgAdmin:

```sql
SELECT id, id_usuario, id_registro, accion, valor_anterior, valor_nuevo,
       fecha_creacion, origen, usuario_bd
FROM auditoria
WHERE nombre_tabla = 'calificaciones'
ORDER BY id DESC;
```

| Archivo | Evidencia |
| --- | --- |
| `backend/database/migrations/2026_10_26_000013_create_immutable_grade_audit.php` | Registro automático y restricciones de inmutabilidad |
| `backend/app/Services/ContextoAuditoriaService.php` | Identidad del usuario dentro de la transacción |
| `backend/app/Http/Controllers/Api/CalificacionController.php` | Contexto de auditoría del registro de notas por lote |
| `backend/app/Http/Controllers/Api/Support/CrudController.php` | Contexto para crear, actualizar y eliminar notas individuales |
| `backend/app/Http/Controllers/Api/Administracion/AuditoriaController.php` | Consulta del historial con valores JSON |

## 4. Texto para el reporte

**Configuración del sistema de tokens y protección de sesión.** Se configuró Laravel Sanctum para gestionar el acceso mediante tokens con tiempo de vencimiento y sesiones protegidas con cookies. Se incorporaron la revocación de accesos, la limitación de intentos de inicio de sesión y la protección de las solicitudes del frontend mediante CSRF.

**Implementación de middleware para validar la matriz de permisos por rol.** Se incorporó un middleware que verifica los permisos del usuario antes de ejecutar cada operación de la API. La validación se complementó con restricciones de consulta para que docentes, estudiantes y responsables accedan únicamente a los registros que les corresponden.

**Desarrollo del módulo de escritura inmutable para la bitácora de auditoría de calificaciones.** Se implementó el registro automático de las altas, modificaciones y eliminaciones de calificaciones, conservando los valores anteriores y nuevos, la identidad disponible del responsable y la fecha del cambio. Se restringió la bitácora a consulta y se incorporaron controles en PostgreSQL para impedir su modificación o eliminación mediante operaciones ordinarias.

## 5. Verificación

Las pruebas de seguridad usan la base independiente `ColegioMetodistaSeguridadTest`, con transacciones revertidas al terminar cada prueba y sin enviar correos. El código de pruebas impide ejecutarlas sobre una base cuyo nombre no termina en `SeguridadTest`.

```powershell
docker compose exec -T -e DB_DATABASE=ColegioMetodistaSeguridadTest -e APP_ENV=testing -e CACHE_DRIVER=array -e SESSION_DRIVER=array backend php artisan test
```

Casos implementados en `backend/tests/Feature/AutenticacionSeguridadTest.php` y `backend/tests/Feature/AuditoriaCalificacionesTest.php`: caducidad y revocación de tokens, límite de login, sesión con CSRF y rotación, invalidación de sesiones, CRUD y lote de notas auditados, rollback, cambios SQL, rechazo de alteraciones de la bitácora y restricciones por rol/alcance.

Resultado de la ejecución del 26 de octubre de 2026: **14 pruebas correctas, 132 aserciones, 0 fallos**. Incluye 9 pruebas nuevas de seguridad/auditoría, las 3 pruebas existentes de recursos API y las 2 pruebas de ejemplo del proyecto. No representa una prueba individual de todas las operaciones de los 28 recursos.

## 6. Instalación y evidencia para el reporte

Las migraciones se aplican con `docker compose exec backend php artisan migrate`; no se necesita `migrate:fresh` ni volver a ejecutar el seeder sobre la base existente. La base de pruebas requiere las mismas migraciones antes de ejecutar la suite.

Para capturas del reporte se pueden utilizar: la respuesta de login con `expires_at` ocultando el token; una respuesta 403 de un rol sin permiso; la consulta de auditoría mostrando los valores antes/después de un cambio de nota; y el resultado de las pruebas automatizadas. Los cambios anteriores a la instalación de la bitácora no aparecerán como eventos históricos nuevos.
