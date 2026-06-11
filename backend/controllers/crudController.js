const { Alumno, Calificacion, Maestro, Materia, Asistencia } = require('../models/Schemas');

// ---- ALUMNOS ----

async function crearAlumno(req, res) {
  try {
    const alumno = await Alumno.create(req.body);
    res.status(201).json(alumno);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

async function listarAlumnos(req, res) {
  try {
    const alumnos = await Alumno.find().sort({ createdAt: -1 });
    res.json(alumnos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function editarAlumno(req, res) {
  try {
    const alumno = await Alumno.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!alumno) return res.status(404).json({ error: 'Alumno no encontrado' });
    res.json(alumno);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

async function borrarAlumno(req, res) {
  try {
    const alumno = await Alumno.findByIdAndDelete(req.params.id);
    if (!alumno) return res.status(404).json({ error: 'Alumno no encontrado' });
    await Promise.all([
      Calificacion.deleteMany({ alumno_id: req.params.id }),
      Asistencia.updateMany(
        {},
        { $pull: { registros: { alumno_id: req.params.id } } }
      )
    ]);
    res.json({ message: 'Alumno eliminado' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// ---- MAESTROS ----

async function crearMaestro(req, res) {
  try {
    const maestro = await Maestro.create(req.body);
    const populated = await Maestro.findById(maestro._id).populate('materias');
    res.status(201).json(populated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

async function listarMaestros(req, res) {
  try {
    const maestros = await Maestro.find().populate('materias').sort({ createdAt: -1 });
    res.json(maestros);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function editarMaestro(req, res) {
  try {
    const maestro = await Maestro.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }).populate('materias');
    if (!maestro) return res.status(404).json({ error: 'Maestro no encontrado' });
    res.json(maestro);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

async function borrarMaestro(req, res) {
  try {
    const maestro = await Maestro.findByIdAndDelete(req.params.id);
    if (!maestro) return res.status(404).json({ error: 'Maestro no encontrado' });
    res.json({ message: 'Maestro eliminado' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// ---- CALIFICACIONES ----

async function crearCalificacion(req, res) {
  try {
    const calif = await Calificacion.create(req.body);
    const populated = await Calificacion.findById(calif._id)
      .populate('alumno_id', 'nombre matricula')
      .populate('materia_id', 'nombre codigo');
    res.status(201).json(populated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

async function listarCalificaciones(req, res) {
  try {
    const filter = {};
    if (req.query.alumno_id) filter.alumno_id = req.query.alumno_id;
    if (req.query.semestre) filter.semestre = req.query.semestre;
    if (req.query.materia_id) filter.materia_id = req.query.materia_id;
    const califs = await Calificacion.find(filter)
      .populate('alumno_id', 'nombre matricula')
      .populate('materia_id', 'nombre codigo semestre')
      .sort({ createdAt: -1 });
    res.json(califs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function editarCalificacion(req, res) {
  try {
    const calif = await Calificacion.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
      .populate('alumno_id', 'nombre matricula')
      .populate('materia_id', 'nombre codigo');
    if (!calif) return res.status(404).json({ error: 'Calificación no encontrada' });
    res.json(calif);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

async function borrarCalificacion(req, res) {
  try {
    const calif = await Calificacion.findByIdAndDelete(req.params.id);
    if (!calif) return res.status(404).json({ error: 'Calificación no encontrada' });
    res.json({ message: 'Calificación eliminada' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// ---- HISTORIAL ACADEMICO ----

async function historialAlumno(req, res) {
  try {
    const calificaciones = await Calificacion.find({ alumno_id: req.params.id })
      .populate('materia_id', 'nombre codigo semestre')
      .sort({ semestre: 1 });

    const asistencias = await Asistencia.find({ 'registros.alumno_id': req.params.id })
      .populate('materia_id', 'nombre codigo')
      .populate('tomada_por', 'nombre');

    const asistenciasMap = {};
    asistencias.forEach(a => {
      const key = a.materia_id._id.toString();
      if (!asistenciasMap[key]) asistenciasMap[key] = { materia: a.materia_id, total: 0, presentes: 0 };
      a.registros.forEach(r => {
        if (r.alumno_id.toString() === req.params.id) {
          asistenciasMap[key].total++;
          if (r.presente) asistenciasMap[key].presentes++;
        }
      });
    });

    const semestres = {};
    calificaciones.forEach(c => {
      if (!semestres[c.semestre]) semestres[c.semestre] = { calificaciones: [], asistencias: [] };
      semestres[c.semestre].calificaciones.push(c);
    });

    Object.entries(asistenciasMap).forEach(([matId, data]) => {
      const sem = calificaciones.find(c => c.materia_id?._id?.toString() === matId);
      const semestreKey = sem ? sem.semestre : 'general';
      if (!semestres[semestreKey]) semestres[semestreKey] = { calificaciones: [], asistencias: [] };
      semestres[semestreKey].asistencias.push(data);
    });

    res.json({ alumno_id: req.params.id, semestres });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// ---- ASISTENCIAS ----

async function crearAsistencia(req, res) {
  try {
    const asistencia = await Asistencia.create(req.body);
    const populated = await Asistencia.findById(asistencia._id)
      .populate('materia_id', 'nombre codigo')
      .populate('registros.alumno_id', 'nombre matricula')
      .populate('tomada_por', 'nombre');
    res.status(201).json(populated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

async function listarAsistencias(req, res) {
  try {
    const filter = {};
    if (req.query.materia_id) filter.materia_id = req.query.materia_id;
    if (req.query.fecha) filter.fecha = new Date(req.query.fecha);
    const asistencias = await Asistencia.find(filter)
      .populate('materia_id', 'nombre codigo')
      .populate('registros.alumno_id', 'nombre matricula')
      .populate('tomada_por', 'nombre')
      .sort({ fecha: -1 });
    res.json(asistencias);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function editarAsistencia(req, res) {
  try {
    const asistencia = await Asistencia.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
      .populate('materia_id', 'nombre codigo')
      .populate('registros.alumno_id', 'nombre matricula')
      .populate('tomada_por', 'nombre');
    if (!asistencia) return res.status(404).json({ error: 'Asistencia no encontrada' });
    res.json(asistencia);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

async function borrarAsistencia(req, res) {
  try {
    const asistencia = await Asistencia.findByIdAndDelete(req.params.id);
    if (!asistencia) return res.status(404).json({ error: 'Asistencia no encontrada' });
    res.json({ message: 'Asistencia eliminada' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = {
  crearAlumno, listarAlumnos, editarAlumno, borrarAlumno,
  crearMaestro, listarMaestros, editarMaestro, borrarMaestro,
  crearCalificacion, listarCalificaciones, editarCalificacion, borrarCalificacion,
  historialAlumno,
  crearAsistencia, listarAsistencias, editarAsistencia, borrarAsistencia
};
