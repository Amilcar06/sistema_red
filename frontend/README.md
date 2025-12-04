# Frontend Web - Sistema de Promoción de Servicios

Panel de administración web moderno y responsivo para la gestión integral del sistema. Construido con React, Vite y Tailwind CSS.

## 📋 Características

- **Dashboard Interactivo**: Visualización de métricas clave en tiempo real.
- **Gestión de Clientes**: Tablas avanzadas con filtrado y edición.
- **Constructor de Promociones**: Interfaz intuitiva para crear campañas complejas.
- **Centro de Mensajes**: Vista unificada de notificaciones enviadas.
- **Diseño Responsivo**: Adaptable a diferentes tamaños de pantalla.
- **Modo Oscuro**: Soporte nativo para temas claro/oscuro.

## 🛠 Tecnologías

- **Core**: React 18, TypeScript, Vite.
- **Estilos**: Tailwind CSS.
- **Componentes UI**: Radix UI (Headless), Lucide React (Iconos).
- **Enrutamiento**: React Router DOM.
- **Estado**: React Context API.
- **HTTP Client**: Axios.
- **Gráficos**: Recharts.
- **Formularios**: React Hook Form.
- **Testing**: Vitest, React Testing Library.

## 🚀 Configuración

### Requisitos
- Node.js 18+

### Instalación

```bash
cd frontend
npm install
```

### Scripts

| Script | Descripción |
| :--- | :--- |
| `npm run dev` | Inicia servidor de desarrollo (Puerto 3000 por defecto). |
| `npm run build` | Construye la aplicación para producción. |
| `npm test` | Ejecuta los tests unitarios. |
| `npm run test:ui` | Abre la interfaz gráfica de Vitest. |

## 📂 Estructura del Proyecto

```
src/
├── components/         # Componentes de UI y Vistas (Pages)
│   ├── ui/             # Componentes base reutilizables (Botones, Inputs, etc.)
│   ├── Dashboard.tsx   # Vista principal
│   ├── Login.tsx       # Vista de autenticación
│   └── ...
├── config/             # Configuración global (Axios, constantes)
├── contexts/           # Contextos de React (Auth, Theme)
├── services/           # Capa de servicio para llamadas API
├── styles/             # Estilos globales
├── App.tsx             # Configuración de rutas principal
└── main.tsx            # Punto de entrada
```

## 🎨 Sistema de Diseño

El proyecto utiliza una arquitectura de componentes basada en **Shadcn UI** (o similar), donde los componentes base se encuentran en `src/components/ui`.

- **Colores**: Definidos en `tailwind.config.js` y variables CSS.
- **Tipografía**: Inter (o fuente configurada).

## 🔐 Autenticación

La aplicación maneja la sesión mediante **JWT** almacenado en `localStorage` (o cookies seguras). El `AuthContext` provee el estado de autenticación a toda la app y protege las rutas privadas mediante el componente `ProtectedRoute`.
