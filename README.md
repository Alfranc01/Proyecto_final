# Proyecto Final - Base de Datos Avanzado

**Alumno:** Alan Franco  
**Tema:** Sistema Escolar Full-Stack  
**Descripción:** Aplicación web con Node.js, Express y Mongoose sobre MongoDB 7 para la gestión de alumnos, materias, maestros y calificaciones académicas con autenticación JWT y control de acceso por roles (admin, maestro, alumno).

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

## Cómo correr el Seed

```bash
node backend/seed.js
```

Esto limpia todas las colecciones y crea: 8 usuarios (1 admin, 2 maestros, 5 alumnos), 7 materias fijas, 5 alumnos, 2 maestros con asignaciones y 35 calificaciones de prueba.

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
| GET    | /api/materias        | Listar todas las materias      |
| POST   | /api/materias        | Crear una materia              |
| PUT    | /api/materias/:id    | Editar una materia             |
| DELETE | /api/materias/:id    | Eliminar una materia           |
| GET    | /api/calificaciones  | Listar calificaciones (filtro por ?alumno_id) |
| POST   | /api/calificaciones  | Crear una calificación         |
| PUT    | /api/calificaciones/:id | Editar una calificación     |
| DELETE | /api/calificaciones/:id | Eliminar una calificación   |
| GET    | /api/historial/:id   | Historial académico por alumno |
