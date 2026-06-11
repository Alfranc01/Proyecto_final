# Proyecto Final - Sistema Escolar con MongoDB 7

**Alumno:** Alan Franco

## Descripción

Aplicación web con arquitectura en capas orientada a la gestión de alumnos y sus calificaciones académicas. El backend está construido con Node.js, Express y Mongoose sobre MongoDB 7, y el frontend con React + Vite.

## Modelado de Datos

### Relación Alumno ↔ Calificación

Se optó por una **relación por Referencia (ObjectId)** entre la colección `Alumnos` y `Calificaciones` en lugar de documentos embebidos.

**Justificación:**

- Evita la saturación del límite de tamaño de documento en MongoDB (16 MB) ante el crecimiento histórico de calificaciones por alumno a lo largo de múltiples semestres.
- Optimiza búsquedas globales como promedios generales, reportes por materia y consultas agregadas sin necesidad de recorrer documentos anidados.
- Permite actualizar o eliminar calificaciones de forma independiente sin modificar el documento del alumno.
- Escala de forma natural: un alumno puede tener cientos de calificaciones sin afectar el rendimiento de lecturas/escrituras del documento principal.

## Confirmación de Entorno

La base de datos corre en un clúster de **MongoDB Atlas versión 7.0.x**.

## Instrucciones de Uso

```bash
# 1. Instalar dependencias
npm install
cd client && npm install && cd ..

# 2. Configurar variables de entorno
#    Copiar .env.example a .env y completar MONGODB_URI

# 3. Poblar la base de datos con datos iniciales
node backend/seed.js

# 4. Iniciar la aplicación (backend + frontend)
npm run dev
```

## Endpoints de la API

| Método | Ruta                 | Descripción                    |
|--------|----------------------|--------------------------------|
| POST   | /api/register        | Registrar nuevo usuario        |
| POST   | /api/login           | Iniciar sesión (devuelve JWT)  |
| GET    | /api/alumnos         | Listar todos los alumnos       |
| POST   | /api/alumnos         | Crear un alumno                |
| PUT    | /api/alumnos/:id     | Editar un alumno               |
| DELETE | /api/alumnos/:id     | Eliminar un alumno             |
| GET    | /api/calificaciones  | Listar calificaciones (filtro por ?alumno_id) |
| POST   | /api/calificaciones  | Crear una calificación         |
| PUT    | /api/calificaciones/:id | Editar una calificación     |
| DELETE | /api/calificaciones/:id | Eliminar una calificación   |
