# Quickstart para Desarrolladores

Guía rápida para levantar el entorno de desarrollo local.

## Prerrequisitos
*   Node.js v18+
*   Docker y Docker Compose
*   Git

## Instalación

1.  **Clonar el repositorio**:
    ```bash
    git clone <repo-url>
    cd sistema-promocion-servicios
    ```

2.  **Configurar variables de entorno**:
    Copiar el ejemplo `.env` en cada microservicio.
    ```bash
    cp .env.example .env
    # Editar .env con tus credenciales locales
    ```

3.  **Levantar infraestructura base (DB, Redis)**:
    ```bash
    docker-compose up -d postgres redis
    ```

4.  **Instalar dependencias y poblar BD**:
    ```bash
    # En clients-service/
    npm install
    npx prisma migrate dev
    npx prisma db seed  # Carga datos de prueba
    ```

5.  **Iniciar servicios (Modo Dev)**:
    ```bash
    # Opción A: Usando script raíz (si existe)
    npm run start:dev:all

    # Opción B: Terminales separadas
    cd clients-service && npm run dev
    cd promotions-service && npm run dev
    # ...
    ```

## Comandos Útiles

*   `npm run test`: Ejecutar pruebas unitarias.
*   `npm run lint`: Verificar estilo de código.
*   `docker-compose logs -f`: Ver logs de infraestructura.
