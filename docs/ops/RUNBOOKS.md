# Runbooks Operativos

Procedimientos estándar para la operación, mantenimiento y recuperación del sistema.

## 🧱 Despliegue (Deployment)

### Requisitos Previos
*   Acceso a cluster Kubernetes o servidor Docker Swarm.
*   Credenciales del Container Registry.
*   Variables de entorno configuradas en Secret Manager/Vault.

### Procedimiento (Manual Trigger)
1.  Verificar que el pipeline de CI (GitHub Actions) haya pasado en `main`.
2.  Aprobar el despliegue a producción (Gate de aprobación manual).
3.  El pipeline ejecuta `helm upgrade` o `docker stack deploy`.
4.  Verificar salud de pods: `kubectl get pods -n promotions-ns`.
5.  Ejecutar Smoke Test: `curl https://api.prod.com/health`.

## 💾 Backup y Restauración de Base de Datos

### Backup (Automático)
*   **Frecuencia**: Diario (Full) + Incremental (WAL logs cada 15 min).
*   **Retención**: 30 días en S3/GCS.

### Restore (Emergencia)
1.  Identificar el punto de restauración (Timestamp deseado).
2.  Detener servicios que escriben en la DB (Escalar replicas a 0).
3.  Ejecutar script de restauración:
    ```bash
    ./scripts/db-restore.sh --date "2023-10-27T10:00:00Z" --source s3://backups-bucket
    ```
4.  Validar integridad de datos (conteo de tablas críticas).
5.  Reiniciar servicios.

## ↩️ Rollback (Vuelta atrás)

Si se detecta un fallo crítico tras un despliegue:

1.  **Identificar la versión estable anterior** (Tag de Docker, ej. `v1.2.4`).
2.  **Ejecutar Rollback**:
    ```bash
    helm rollback promotions-release 0  # Revert to previous revision
    # O si es docker-compose
    docker service update --image myrpo/app:v1.2.4 stack_app
    ```
3.  **Verificar**: Confirmar que la versión anterior está activa y sirviendo tráfico.
4.  **Análisis**: Investigar logs de la versión fallida en entorno aislado.

## 🚨 Reinicio de Servicios Atascados

Si un microservicio no responde (Liveness probe fallando):
1.  Consultar estado: `kubectl describe pod <pod-name>`.
2.  Ver logs: `kubectl logs <pod-name> --previous`.
3.  Forzar reinicio: `kubectl delete pod <pod-name>` (K8s recreará el pod).
