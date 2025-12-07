# Guía de Integración y Multi-Operador

Esta guía describe cómo integrar el sistema con infraestructuras externas (Gateway SMS, Facturación, CRM) y cómo adaptar la plataforma para nuevos operadores.

## 1. Arquitectura de Adaptadores

El sistema utiliza el patrón **Adapter** para aislar la lógica de negocio de las implementaciones específicas de terceros.

### Interfaces Principales

#### ISmsProvider
Cualquier proveedor de SMS (Twilio, Infobip, SMPP Directo) debe implementar esta interfaz.

```typescript
interface ISmsProvider {
  send(to: string, message: string): Promise<string>; // Retorna MessageID
  getStatus(messageId: string): Promise<Status>;
}
```

#### IBillingProvider
Para realizar cobros o verificar saldo.

```typescript
interface IBillingProvider {
  checkBalance(userId: string): Promise<number>;
  charge(userId: string, amount: number, concept: string): Promise<TransactionResult>;
}
```

## 2. Guía de Integración por Módulo

### Gateway SMS
1. Configurar credenciales en variables de entorno (`SMS_PROVIDER_API_KEY`, `SMS_PROVIDER_URL`).
2. Implementar la clase concreta en `src/infrastructure/sms/`.
3. Inyectar la dependencia en el servicio de notificaciones.

### CRM (Salesforce / Legacy)
- **Sincronización**: Usar webhooks o jobs nocturnos (ETL) para mantener la base de clientes sincronizada.
- **Consulta en tiempo real**: Para validaciones críticas (ej. estatus de línea), consultar API del CRM con timeout corto (ej. 2s) y fallback local.

## 3. Checklist de Onboarding para Nuevo Operador

Pasos para desplegar el sistema en un operador diferente (ej. migrar de ENTEL a Tigo/Viva/Claro).

- [ ] **Configuración de Red**:
    - [ ] VPN Site-to-Site establecida.
    - [ ] Whitelist de IPs para APIs de SMS y Billing.
- **Adaptación de Datos**:
    - [ ] Mapeo de campos de Cliente (ej. ¿Usan CI o RUT?).
    - [ ] Configuración de planes y segmentos en la BD.
- **Integración**:
    - [ ] Desarrollar/Configurar adaptador de SMS (SMPP/HTTP).
    - [ ] Desarrollar/Configurar adaptador de Cobro (Diameter/HTTP).
- **Personalización**:
    - [ ] Ajustar textos de notificaciones (Templates).
    - [ ] Configurar reglas de negocio específicas (ej. vigencia de bonos).
- **Pruebas**:
    - [ ] Prueba de conectividad (Ping/Telnet).
    - [ ] Prueba de flujo completo (Compra -> Cobro -> SMS -> Activación).
