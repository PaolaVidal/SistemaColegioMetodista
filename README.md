Sistema Integral de Gestión Académica y Administrativa Escolar

Estructura base del proyecto (monorepo simples con frontend y backend):

- frontend/: Aplicación web React (Vite, JavaScript, Tailwind CSS, React Router, Axios, Zustand, ESLint)
- backend/: API RESTful con Laravel (preparado para Laravel Sanctum, configurado para PostgreSQL)

Estado actual:
- Frontend inicializado con Vite y dependencias para Tailwind, React Router, Axios, Zustand
- ESLint configurado en frontend y comprobado
- Backend Laravel con PostgreSQL, autenticación mediante Sanctum y API para las 28 tablas de negocio; la auditoría es de solo lectura y se genera automáticamente al cambiar calificaciones.
- Rutas agrupadas por área y un controlador por recurso. Consultar [la documentación de la API](backend/API.md).
- Git inicializado en la raíz

Instrucciones rápidas:
- Frontend:
  - cd frontend
  - npm install
  - npm run dev (desarrollo)
  - npm run build (compilar en producción)
  - npm run lint (ejecutar ESLint)

- Backend:
  - cd backend
  - composer install
  - copiar .env.example a .env y configurar DB_CONNECTION=pgsql y credenciales
  - php artisan key:generate
  - php artisan migrate (después de configurar la base de datos)
  - Para poblar la base de datos con datos de prueba realistas: `php artisan db:seed`
  - Para recrear la base desde cero y poblarla en un entorno de pruebas: `php artisan migrate:fresh --seed`
  - Los usuarios de prueba se crean con la contraseña `password123`; no usar estas credenciales fuera de desarrollo.

Docker Compose:
- Desde la raíz del proyecto:
  - docker compose config
  - docker compose build
  - docker compose up -d
- Servicios incluidos:
  - PostgreSQL 16 en localhost:5432
  - Backend Laravel en localhost:8000
  - Programador de Laravel para revisar notas editadas directamente en PostgreSQL
  - Frontend Vite en localhost:5173
  - n8n en localhost:5678
  - Mailpit (bandeja de correos de prueba) en localhost:8025
  - Worker de Laravel para la cola de correos en PostgreSQL

  Reinicio completo del entorno Docker:
  - Desde la raíz del proyecto, detener y eliminar contenedores, imágenes del Compose, volúmenes y recursos huérfanos:
    - `docker compose down --volumes --rmi all --remove-orphans`
  - Reconstruir las imágenes sin utilizar caché y levantar todos los servicios:
    - `docker compose build --no-cache`
    - `docker compose up -d`
  - Confirmar que los servicios estén saludables:
    - `docker compose ps`
  - Ejecutar las migraciones dentro del contenedor de Laravel:
    - `docker compose exec backend php artisan migrate`
  - Poblar la base de datos con los datos de prueba:
    - `docker compose exec backend php artisan db:seed`

  Para realizar el reinicio y poblar la base de datos en una sola operación, después de `docker compose up -d` se puede ejecutar:
    - `docker compose exec backend php artisan migrate:fresh --seed`

  `docker compose down --volumes` elimina los datos persistidos de PostgreSQL, pgAdmin, n8n y Mailpit del proyecto. No ejecutar `docker system prune -a --volumes` salvo que se quieran eliminar también recursos Docker de otros proyectos.

  Notas:
- La API dispone de rutas CRUD, expedientes compuestos y registro por lote de notas y asistencias. El frontend todavía es una interfaz inicial.
- Requisitos locales: Node.js (>=20.19 recomendado), npm, PHP 8.2, Composer y Docker Desktop o Docker Engine activos.

Notificaciones locales de pagos:
- Al registrar un pago con `POST /api/pagos`, Laravel crea una notificación para cada responsable activo vinculado al estudiante y programa su envío en la cola después de confirmar la transacción.
- El flujo `Colegio Metodista - correo por pago registrado` envía el mensaje a Mailpit. Se puede revisar en `http://localhost:8025`; Mailpit no entrega el mensaje a Internet.
- El flujo se guarda en `n8n/pago-registrado.json`. Para importarlo en una instalación nueva: `docker compose exec n8n n8n import:workflow --input=/workflows/pago-registrado.json`, después `docker compose exec n8n n8n publish:workflow --id=colegiometodista-pago-registrado` y `docker compose restart n8n`.
- Dentro de Docker, el worker llama a `http://n8n:5678/webhook/pago-registrado`. Para ejecutar Laravel fuera de Docker, configurar `N8N_PAYMENT_WEBHOOK_URL=http://127.0.0.1:5678/webhook/pago-registrado` en `backend/.env`.
- La columna `estado_envio` queda como `enviado` cuando n8n confirma el flujo o `fallido` tras agotar tres intentos; el pago permanece registrado.
- Para enviar correos reales, cambiar el nodo de Mailpit por un nodo de correo SMTP en n8n y configurar las credenciales del proveedor.

Seguridad y documentación:
- [Implementación de seguridad, autenticación y auditoría](documentacion/Seguridad-autenticacion-auditoria.md): tokens con vencimiento, sesiones con CSRF, middleware por rol, historial inmutable de calificaciones y evidencias de pruebas.
- Las migraciones de seguridad se aplican con `docker compose exec backend php artisan migrate`. La API de auditoría admite únicamente lectura para el administrador.

Alertas de rendimiento académico:
- Al crear, actualizar o eliminar una calificación, tanto por el CRUD como por el registro por lote, Laravel recalcula el promedio ponderado de las notas registradas para ese alumno, materia y período. También recalcula cuando cambia la ponderación, el período o el curso de una evaluación.
- El servicio `scheduler` compara los promedios cada minuto y detecta cambios hechos directamente en PostgreSQL o pgAdmin. Para forzar la revisión inmediatamente: `docker compose exec backend php artisan rendimiento:revisar`.
- Si el promedio redondeado a dos decimales cruza de 5.00 o más a menos de 5.00, se crea una notificación para el estudiante y cada responsable activo vinculado. Si continúa bajo, no se repite; si se recupera y luego vuelve a bajar, se envía un nuevo aviso.
- La tabla interna `alertas_rendimiento` guarda el último estado. Su migración toma los promedios existentes como punto de partida sin enviar correos retroactivos.
- El flujo `n8n/bajo-rendimiento.json` se importa con `docker compose exec n8n n8n import:workflow --input=/workflows/bajo-rendimiento.json`, se publica con `docker compose exec n8n n8n publish:workflow --id=colegiometodista-bajo-rendimiento` y se aplica con `docker compose restart n8n`. Los mensajes de prueba aparecen en Mailpit.
- Si Laravel se ejecuta fuera de Docker, configurar `N8N_ACADEMIC_WEBHOOK_URL=http://127.0.0.1:5678/webhook/bajo-rendimiento` en `backend/.env`.

Avisos de mora y cola de notificaciones:
- Las cuentas vencidas con saldo pendiente generan un aviso a cada responsable activo. La revisión diaria se ejecuta a las 08:00, hora de El Salvador. Mientras exista saldo vencido, se repite el aviso cada siete días; un pago total detiene los recordatorios.
- Una cuenta creada o modificada desde la API con vencimiento anterior al día actual se revisa al guardarla. Las modificaciones directas en PostgreSQL se detectan en la revisión diaria. Para revisar de inmediato: `docker compose exec backend php artisan mora:revisar`.
- El flujo está en `n8n/mora.json`; para una instalación nueva, importarlo con `docker compose exec n8n n8n import:workflow --input=/workflows/mora.json`, publicarlo con `docker compose exec n8n n8n publish:workflow --id=colegiometodista-mora` y reiniciar n8n.
- `QUEUE_CONNECTION=database` almacena los trabajos en PostgreSQL. El servicio Docker `worker` procesa la cola `correos` con hasta tres intentos; `jobs` y `failed_jobs` permiten consultar el estado. Ver [documentación de notificaciones y colas](documentacion/Notificaciones-n8n-colas.md).

CI/CD y pruebas:
- Cada pull request hacia `main` ejecuta lint y build del frontend, PHPUnit, Pint, auditoría de Composer y validación de Docker Compose.
- El workflow de integración usa PostgreSQL 16 y ejecuta las migraciones antes de los tests del backend.
- Los tags con formato `vX.Y.Z` construyen y publican las imágenes backend/frontend en GHCR y las escanean con Trivy.
- El despliegue productivo permanece desactivado hasta definir el proveedor, el environment protegido y la estrategia de rollback.
- Validación local del pipeline: `docker compose config`, `docker compose -f docker-compose.ci.yml config`, `cd frontend; npm ci; npm run lint; npm run build` y `cd backend; php artisan test; vendor/bin/pint --test`.
