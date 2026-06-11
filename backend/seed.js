require('dotenv').config();
const dns = require('dns');
dns.setServers(['8.8.8.8']);
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { User, Alumno, Materia, Maestro, AsignacionMaestro, Calificacion, Asistencia } = require('./models/Schemas');

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Conectado a MongoDB');

    await Promise.all([
      User.deleteMany({}),
      Alumno.deleteMany({}),
      Materia.deleteMany({}),
      Maestro.deleteMany({}),
      AsignacionMaestro.deleteMany({}),
      Calificacion.deleteMany({}),
      Asistencia.deleteMany({})
    ]);
    console.log('Colecciones limpiadas');

    const hashed = await bcrypt.hash('Demo1234', 10);
    const users = await User.insertMany([
      { email: 'demo@demo.com', password: hashed, rol: 'admin' },
      { email: 'roberto@escuela.edu', password: hashed, rol: 'maestro' },
      { email: 'laura@escuela.edu', password: hashed, rol: 'maestro' },
      { email: 'maria.alumno@escuela.edu', password: hashed, rol: 'alumno' },
      { email: 'carlos.alumno@escuela.edu', password: hashed, rol: 'alumno' },
      { email: 'ana.alumno@escuela.edu', password: hashed, rol: 'alumno' },
      { email: 'luis.alumno@escuela.edu', password: hashed, rol: 'alumno' },
      { email: 'sofia.alumno@escuela.edu', password: hashed, rol: 'alumno' }
    ]);
    const userAdmin = users[0], userRoberto = users[1], userLaura = users[2];
    const userMaria = users[3], userCarlos = users[4], userAna = users[5];
    const userLuis = users[6], userSofia = users[7];
    console.log('8 usuarios creados (1 admin, 2 maestros, 5 alumnos)');

    const materias = await Materia.insertMany([
      { nombre: 'Matemáticas Discretas', codigo: 'MAT-101', semestre: 1 },
      { nombre: 'Cálculo Diferencial', codigo: 'MAT-102', semestre: 1 },
      { nombre: 'Física General', codigo: 'FIS-101', semestre: 1 },
      { nombre: 'Inglés Técnico', codigo: 'ING-101', semestre: 1 },
      { nombre: 'Programación Orientada a Objetos', codigo: 'PROG-201', semestre: 2 },
      { nombre: 'Bases de Datos', codigo: 'BD-201', semestre: 2 },
      { nombre: 'Estructura de Datos', codigo: 'ED-201', semestre: 2 }
    ]);
    console.log('7 materias fijas insertadas');

    const alumnos = await Alumno.insertMany([
      { nombre: 'María García López', matricula: 'A001', carrera: 'Ing. Sistemas Computacionales', usuario_id: userMaria._id },
      { nombre: 'Carlos Hernández Pérez', matricula: 'A002', carrera: 'Ing. Informática', usuario_id: userCarlos._id },
      { nombre: 'Ana Rodríguez Morales', matricula: 'A003', carrera: 'Ing. Sistemas Computacionales', usuario_id: userAna._id },
      { nombre: 'Luis Fernando Torres', matricula: 'A004', carrera: 'Ing. Informática', usuario_id: userLuis._id },
      { nombre: 'Sofía Ramírez Cruz', matricula: 'A005', carrera: 'Ing. Sistemas Computacionales', usuario_id: userSofia._id }
    ]);
    console.log('5 alumnos insertados');

    const matematicas = materias[0], calculo = materias[1], fisica = materias[2],
          ingles = materias[3], poo = materias[4], bd = materias[5], ed = materias[6];

    const maestro1 = await Maestro.create({
      nombre: 'Roberto Martínez López',
      email: 'roberto@escuela.edu',
      materias: [matematicas._id, calculo._id, fisica._id],
      usuario_id: userRoberto._id
    });

    const maestro2 = await Maestro.create({
      nombre: 'Laura Castillo García',
      email: 'laura@escuela.edu',
      materias: [ingles._id, poo._id, bd._id, ed._id],
      usuario_id: userLaura._id
    });
    console.log('2 maestros insertados');

    const asignaciones = await AsignacionMaestro.insertMany([
      { maestro_id: maestro1._id, materia_id: matematicas._id, grupo: 'A' },
      { maestro_id: maestro1._id, materia_id: calculo._id, grupo: 'A' },
      { maestro_id: maestro1._id, materia_id: fisica._id, grupo: 'A' },
      { maestro_id: maestro2._id, materia_id: ingles._id, grupo: 'A' },
      { maestro_id: maestro2._id, materia_id: poo._id, grupo: 'A' },
      { maestro_id: maestro2._id, materia_id: bd._id, grupo: 'A' },
      { maestro_id: maestro2._id, materia_id: ed._id, grupo: 'A' }
    ]);
    console.log(`${asignaciones.length} asignaciones maestro-materia-grupo insertadas`);

    const a1 = alumnos[0], a2 = alumnos[1], a3 = alumnos[2], a4 = alumnos[3], a5 = alumnos[4];

    await Calificacion.insertMany([
      { alumno_id: a1._id, materia_id: matematicas._id, puntaje: 88, semestre: '2025-1' },
      { alumno_id: a1._id, materia_id: calculo._id, puntaje: 92, semestre: '2025-1' },
      { alumno_id: a1._id, materia_id: fisica._id, puntaje: 85, semestre: '2025-1' },
      { alumno_id: a1._id, materia_id: ingles._id, puntaje: 90, semestre: '2025-1' },
      { alumno_id: a1._id, materia_id: poo._id, puntaje: 95, semestre: '2025-2' },
      { alumno_id: a1._id, materia_id: bd._id, puntaje: 90, semestre: '2025-2' },
      { alumno_id: a1._id, materia_id: ed._id, puntaje: 88, semestre: '2025-2' },

      { alumno_id: a2._id, materia_id: matematicas._id, puntaje: 78, semestre: '2025-1' },
      { alumno_id: a2._id, materia_id: calculo._id, puntaje: 70, semestre: '2025-1' },
      { alumno_id: a2._id, materia_id: fisica._id, puntaje: 75, semestre: '2025-1' },
      { alumno_id: a2._id, materia_id: ingles._id, puntaje: 80, semestre: '2025-1' },
      { alumno_id: a2._id, materia_id: poo._id, puntaje: 82, semestre: '2025-2' },
      { alumno_id: a2._id, materia_id: bd._id, puntaje: 92, semestre: '2025-2' },
      { alumno_id: a2._id, materia_id: ed._id, puntaje: 76, semestre: '2025-2' },

      { alumno_id: a3._id, materia_id: matematicas._id, puntaje: 95, semestre: '2025-1' },
      { alumno_id: a3._id, materia_id: calculo._id, puntaje: 88, semestre: '2025-1' },
      { alumno_id: a3._id, materia_id: fisica._id, puntaje: 90, semestre: '2025-1' },
      { alumno_id: a3._id, materia_id: ingles._id, puntaje: 85, semestre: '2025-1' },
      { alumno_id: a3._id, materia_id: poo._id, puntaje: 91, semestre: '2025-2' },
      { alumno_id: a3._id, materia_id: bd._id, puntaje: 87, semestre: '2025-2' },
      { alumno_id: a3._id, materia_id: ed._id, puntaje: 93, semestre: '2025-2' },

      { alumno_id: a4._id, materia_id: matematicas._id, puntaje: 65, semestre: '2025-1' },
      { alumno_id: a4._id, materia_id: calculo._id, puntaje: 58, semestre: '2025-1' },
      { alumno_id: a4._id, materia_id: fisica._id, puntaje: 72, semestre: '2025-1' },
      { alumno_id: a4._id, materia_id: ingles._id, puntaje: 68, semestre: '2025-1' },
      { alumno_id: a4._id, materia_id: poo._id, puntaje: 75, semestre: '2025-2' },
      { alumno_id: a4._id, materia_id: bd._id, puntaje: 80, semestre: '2025-2' },
      { alumno_id: a4._id, materia_id: ed._id, puntaje: 62, semestre: '2025-2' },

      { alumno_id: a5._id, materia_id: matematicas._id, puntaje: 82, semestre: '2025-1' },
      { alumno_id: a5._id, materia_id: calculo._id, puntaje: 79, semestre: '2025-1' },
      { alumno_id: a5._id, materia_id: fisica._id, puntaje: 91, semestre: '2025-1' },
      { alumno_id: a5._id, materia_id: ingles._id, puntaje: 88, semestre: '2025-1' },
      { alumno_id: a5._id, materia_id: poo._id, puntaje: 84, semestre: '2025-2' },
      { alumno_id: a5._id, materia_id: bd._id, puntaje: 86, semestre: '2025-2' },
      { alumno_id: a5._id, materia_id: ed._id, puntaje: 90, semestre: '2025-2' }
    ]);
    console.log('35 calificaciones insertadas');

    const hoy = new Date();
    await Asistencia.insertMany([
      {
        materia_id: matematicas._id, fecha: new Date(hoy.getTime() - 86400000 * 2),
        registros: [
          { alumno_id: a1._id, presente: true }, { alumno_id: a2._id, presente: true },
          { alumno_id: a3._id, presente: false }, { alumno_id: a4._id, presente: true },
          { alumno_id: a5._id, presente: true }
        ], tomada_por: maestro1._id
      },
      {
        materia_id: poo._id, fecha: new Date(hoy.getTime() - 86400000),
        registros: [
          { alumno_id: a1._id, presente: true }, { alumno_id: a2._id, presente: false },
          { alumno_id: a3._id, presente: true }, { alumno_id: a4._id, presente: true },
          { alumno_id: a5._id, presente: false }
        ], tomada_por: maestro2._id
      },
      {
        materia_id: bd._id, fecha: hoy,
        registros: [
          { alumno_id: a1._id, presente: true }, { alumno_id: a2._id, presente: true },
          { alumno_id: a3._id, presente: true }, { alumno_id: a4._id, presente: false },
          { alumno_id: a5._id, presente: true }
        ], tomada_por: maestro2._id
      }
    ]);
    console.log('3 asistencias insertadas');

    console.log('Seed completado exitosamente');
    process.exit(0);
  } catch (err) {
    console.error('Error en seed:', err.message);
    process.exit(1);
  }
}

seed();
