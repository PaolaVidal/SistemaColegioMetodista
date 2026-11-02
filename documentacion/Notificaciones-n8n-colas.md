# Webhooks, avisos automáticos y colas de trabajo

## Qué se implementó

El backend registra eventos de pagos, bajo rendimiento y cuentas vencidas. Cada evento crea registros en `notificaciones` para los destinatarios correspondientes y programa un trabajo en la cola `correos` después de confirmar la operación de base de datos. El proceso `worker` envía el webhook a n8n; n8n entrega el correo a Mailpit en el entorno local. Así, la respuesta de la API no espera la comunicación con n8n.

| Evento | Disparador | Destinatarios | Flujo n8n |
| --- | --- | --- | --- |
| Pago registrado | Alta por `POST /api/pagos` | Responsables activos del estudiante | `n8n/pago-registrado.json`, webhook `/webhook/pago-registrado` |
| Bajo rendimiento | Promedio ponderado menor que 5 por materia y período | Estudiante y responsables activos | `n8n/bajo-rendimiento.json`, webhook `/webhook/bajo-rendimiento` |
| Mora | Cuenta con fecha de vencimiento anterior al día actual y saldo positivo | Responsables activos del estudiante | `n8n/mora.json`, webhook `/webhook/aviso-mora` |

El pago registrado y la alerta de rendimiento se producen al operar mediante la API. El scheduler revisa cambios directos en PostgreSQL: promedios cada minuto y mora diariamente a las 08:00, hora de El Salvador. Una cuenta creada o modificada por la API que ya esté vencida también se revisa inmediatamente.

Para mora, cada cuenta recibe un primer aviso al detectarse el vencimiento y un recordatorio cada siete días mientras su saldo siga siendo mayor que cero. La tabla `alertas_mora` guarda la fecha del último aviso y evita repetirlo en las revisiones diarias. Cuando el saldo se paga por completo, las siguientes revisiones no generan avisos. El texto del mensaje incluye concepto, fecha de vencimiento y saldo pendiente; no agrega un recargo nuevo al saldo.

## Cola asíncrona

`QUEUE_CONNECTION=database` almacena los trabajos en la tabla `jobs` de PostgreSQL. El contenedor `worker` ejecuta `php artisan queue:work database --queue=correos`; se mantiene activo con Docker Compose. La clase `EnviarNotificacionCorreo` selecciona el webhook según el tipo de notificación y llama a `NotificacionCorreoService`.

El worker intenta entregar cada mensaje hasta tres veces. Si n8n falla, espera 10 segundos antes del segundo intento y 60 segundos antes del tercero. Mientras tanto, la notificación permanece `pendiente`; al confirmar n8n queda `enviado`, y al agotar los intentos queda `fallido`. El trabajo fallido se conserva en `failed_jobs` para diagnóstico o reintento administrativo. Los errores se registran en el log de Laravel. El procesamiento comienza después de confirmar la transacción que creó el aviso.

Comandos de operación desde la raíz del proyecto:

```powershell
docker compose ps
docker compose exec backend php artisan mora:revisar
docker compose exec backend php artisan rendimiento:revisar
docker compose logs --tail=50 worker
docker compose exec backend php artisan queue:failed
```

El flujo de mora se importa y publica una vez por instalación:

```powershell
docker compose exec n8n n8n import:workflow --input=/workflows/mora.json
docker compose exec n8n n8n publish:workflow --id=colegiometodista-mora
docker compose restart n8n
```

Mailpit muestra los mensajes locales en `http://localhost:8025`. Esta bandeja permite comprobar contenido y destinatarios sin enviar correos a Internet. La interfaz de n8n está en `http://localhost:5678` y muestra los tres flujos. Para ejecutar Laravel fuera de Docker se configuran en `backend/.env` `QUEUE_CONNECTION=database`, las tres URL `N8N_PAYMENT_WEBHOOK_URL`, `N8N_ACADEMIC_WEBHOOK_URL` y `N8N_OVERDUE_WEBHOOK_URL`, y se inicia un worker con `php artisan queue:work database --queue=correos`.

El 26 de octubre de 2026 se procesaron las 30 cuentas vencidas que ya existían en la base local. Las 30 notificaciones de mora quedaron con estado `enviado`, Mailpit mostró 30 mensajes de pago vencido y se comprobaron 0 trabajos pendientes y 0 fallidos. Esta ejecución evidencia el recorrido real backend → cola → worker → n8n → Mailpit. Los avisos fueron a la bandeja local de prueba.

## Evidencias en la base y en el código

Consultas útiles en pgAdmin:

```sql
SELECT tipo, estado_envio, COUNT(*)
FROM notificaciones
WHERE tipo IN ('pago_registrado', 'bajo_rendimiento', 'mora')
GROUP BY tipo, estado_envio
ORDER BY tipo, estado_envio;

SELECT COUNT(*) AS trabajos_pendientes FROM jobs;
SELECT COUNT(*) AS trabajos_fallidos FROM failed_jobs;

SELECT a.id_cuenta_cobrar, a.ultimo_aviso, c.fecha_vencimiento,
       c.saldo_pendiente, c.estado
FROM alertas_mora a
JOIN cuentas_por_cobrar c ON c.id = a.id_cuenta_cobrar
ORDER BY a.id DESC;
```

| Archivo | Evidencia |
| --- | --- |
| `backend/app/Services/PagoNotificacionService.php` | Evento de pago y creación del aviso |
| `backend/app/Services/RendimientoNotificacionService.php` | Evento académico y destinatarios |
| `backend/app/Services/MoraNotificacionService.php` | Detección de vencimiento, recordatorios y destinatarios |
| `backend/app/Jobs/EnviarNotificacionCorreo.php` | Trabajo asíncrono, selección del webhook, reintentos y fallo final |
| `backend/app/Services/NotificacionCorreoService.php` | Llamada HTTP a n8n y resultado de envío |
| `backend/app/Console/Commands/RevisarMora.php` | Revisión manual y programada de cuentas |
| `backend/app/Console/Kernel.php` | Horarios del scheduler |
| `backend/database/migrations/2026_10_26_000014_create_notification_queue_and_overdue_state.php` | Tablas `jobs` y `alertas_mora` |
| `docker-compose.yml` | Backend, scheduler, worker, n8n, PostgreSQL y Mailpit |

## Texto para el reporte

**Configuración de emisores de webhooks en el backend para captura de eventos críticos.** Se programó la detección de pagos registrados, promedios académicos inferiores a cinco y cuentas vencidas con saldo pendiente. Cada evento genera una notificación para sus destinatarios y entrega los datos a n8n mediante un webhook procesado desde una cola.

**Diseño de flujos orquestados en n8n para el envío de notificaciones automáticas de mora y rendimiento.** Se configuraron flujos que reciben los avisos del backend y producen correos de prueba en Mailpit. El flujo de mora informa el vencimiento y saldo de la cuenta; el académico informa el promedio bajo a estudiantes y responsables.

**Programación de colas de trabajo para procesamiento asíncrono en el servidor.** Se configuró una cola en PostgreSQL y un worker independiente en Docker para ejecutar los envíos después de confirmar las operaciones. Se incorporaron reintentos, registro de trabajos fallidos y seguimiento del estado de cada notificación.
