const express = require('express');
const router = express.Router();
const { auth, checkRole } = require('../middleware/auth');
const { Alumno, Calificacion, Asistencia, Maestro, AsignacionMaestro, Materia, User } = require('../models/Schemas');

// ─── RUTAS DE ALUMNO (rol: alumno) ─────────────────────────────────────────

router.get('/alumno/dashboard', auth, checkRole(['alumno']), async (req, res) => {
  try {
    const alumno = await Alumno.findOne({ usuario_id: req.user.id });
    if (!alumno) return res.status(404).json({ error: 'Perfil de alumno no encontrado' });

    const calificaciones = await Calificacion.find({ alumno_id: alumno._id })
      .populate('materia_id', 'nombre codigo semestre');

    const promedio = calificaciones.length > 0
      ? (calificaciones.reduce((s, c) => s + c.puntaje, 0) / calificaciones.length).toFixed(1)
      : '—';

    const asistencias = await Asistencia.find({ 'registros.alumno_id': alumno._id });
    let totalAsistencias = 0, presentes = 0;
    asistencias.forEach(a => {
      a.registros.forEach(r => {
        if (r.alumno_id.toString() === alumno._id.toString()) {
          totalAsistencias++;
          if (r.presente) presentes++;
        }
      });
    });

    res.json({
      perfil: alumno,
      promedio,
      faltas: totalAsistencias - presentes,
      totalAsistencias,
      presentes,
      calificaciones
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── RUTAS DE MAESTRO (rol: maestro) ───────────────────────────────────────

router.get('/maestro/mis-grupos', auth, checkRole(['maestro']), async (req, res) => {
  try {
    const maestro = await Maestro.findOne({ usuario_id: req.user.id });
    if (!maestro) return res.status(404).json({ error: 'Maestro no encontrado' });

    const asignaciones = await AsignacionMaestro.find({ maestro_id: maestro._id })
      .populate('materia_id', 'nombre codigo semestre');

    res.json({ maestro, grupos: asignaciones });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/maestro/asistencia', auth, checkRole(['maestro']), async (req, res) => {
  try {
    const { materia_id, grupo, fecha, registros } = req.body;
    const maestro = await Maestro.findOne({ usuario_id: req.user.id });
    if (!maestro) return res.status(404).json({ error: 'Maestro no encontrado' });

    const asignacion = await AsignacionMaestro.findOne({
      maestro_id: maestro._id,
      materia_id,
      grupo
    });
    if (!asignacion) {
      return res.status(403).json({ msg: 'Acceso denegado: No tienes los permisos necesarios' });
    }

    const asistencia = await Asistencia.create({
      materia_id,
      fecha,
      registros,
      tomada_por: maestro._id
    });

    const populated = await Asistencia.findById(asistencia._id)
      .populate('materia_id', 'nombre codigo')
      .populate('registros.alumno_id', 'nombre matricula')
      .populate('tomada_por', 'nombre');

    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/maestro/calificacion', auth, checkRole(['maestro']), async (req, res) => {
  try {
    const { materia_id, grupo, alumno_id, puntaje, semestre } = req.body;
    const maestro = await Maestro.findOne({ usuario_id: req.user.id });
    if (!maestro) return res.status(404).json({ error: 'Maestro no encontrado' });

    const asignacion = await AsignacionMaestro.findOne({
      maestro_id: maestro._id,
      materia_id,
      grupo
    });
    if (!asignacion) {
      return res.status(403).json({ msg: 'Acceso denegado: No tienes los permisos necesarios' });
    }

    let calif = await Calificacion.findOne({ materia_id, alumno_id, semestre });
    if (calif) {
      calif.puntaje = puntaje;
      await calif.save();
    } else {
      calif = await Calificacion.create({ materia_id, alumno_id, puntaje, semestre });
    }

    const populated = await Calificacion.findById(calif._id)
      .populate('alumno_id', 'nombre matricula')
      .populate('materia_id', 'nombre codigo');

    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── RUTAS DE ADMIN (rol: admin) ───────────────────────────────────────────

router.get('/admin/metricas-globales', auth, checkRole(['admin']), async (req, res) => {
  try {
    const [totalAlumnos, totalCalificaciones, totalMaestros, totalMaterias, totalUsuarios] = await Promise.all([
      Alumno.countDocuments(),
      Calificacion.countDocuments(),
      Maestro.countDocuments(),
      Materia.countDocuments(),
      User.countDocuments()
    ]);

    const promedioRaw = await Calificacion.aggregate([
      { $group: { _id: null, avg: { $avg: '$puntaje' } } }
    ]);

    const distribucionRoles = await User.aggregate([
      { $group: { _id: '$rol', count: { $sum: 1 } } }
    ]);

    const semestres = await Calificacion.distinct('semestre');

    res.json({
      totalAlumnos,
      totalCalificaciones,
      totalMaestros,
      totalMaterias,
      totalUsuarios,
      promedioGeneral: promedioRaw.length > 0 ? promedioRaw[0].avg.toFixed(1) : '—',
      totalSemestres: semestres.length,
      distribucionRoles
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/admin/usuarios', auth, checkRole(['admin']), async (req, res) => {
  try {
    const { email, password, rol } = req.body;
    if (!['admin', 'maestro', 'alumno'].includes(rol)) {
      return res.status(400).json({ error: 'Rol inválido. Debe ser admin, maestro o alumno' });
    }
    const bcrypt = require('bcryptjs');
    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ email, password: hashed, rol });
    res.status(201).json({ message: 'Usuario creado', id: user._id, email: user.email, rol: user.rol });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.post('/admin/asignaturas', auth, checkRole(['admin']), async (req, res) => {
  try {
    const { tipo, datos } = req.body;
    let resultado;

    switch (tipo) {
      case 'materia': {
        resultado = await Materia.create(datos);
        break;
      }
      case 'asignacion': {
        const existe = await AsignacionMaestro.findOne({
          maestro_id: datos.maestro_id,
          materia_id: datos.materia_id,
          grupo: datos.grupo
        });
        if (existe) return res.status(400).json({ error: 'Esa asignación ya existe' });
        resultado = await AsignacionMaestro.create(datos);
        const populated = await AsignacionMaestro.findById(resultado._id)
          .populate('maestro_id', 'nombre email')
          .populate('materia_id', 'nombre codigo');
        resultado = populated;
        break;
      }
      default:
        return res.status(400).json({ error: 'Tipo no válido. Usar: materia o asignacion' });
    }

    res.status(201).json(resultado);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
