# Sistema de Gestión de Ventas

Aplicación full-stack para gestionar una base de datos con análisis de ventas, usuarios y gastos.

## Tecnologías
- **Backend:** Node.js + Express + SQLite
- **Frontend:** React + Vite + Recharts

## Instalación

```bash
# Instalar dependencias del backend
npm install

# Instalar dependencias del frontend
cd client && npm install
```

## Ejecución

```bash
# Ejecutar ambas aplicaciones (backend + frontend)
npm run dev
```

- Backend: http://localhost:3001
- Frontend: http://localhost:5173

## Funcionalidades

1. **Dashboard** - Vista general con estadísticas y gráficos de ventas/gastos por mes
2. **Ventas** - CRUD completo de ventas con totales automáticos
3. **Usuarios** - Gestión de usuarios registrados
4. **Gastos** - Control de gastos por categoría
