const { Alumno, Calificacion, Maestro, Materia } = require('../models/Schemas');

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
    await Calificacion.deleteMany({ alumno_id: req.params.id });
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

// ---- MATERIAS ----

async function crearMateria(req, res) {
  try {
    const materia = await Materia.create(req.body);
    res.status(201).json(materia);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

async function listarMaterias(req, res) {
  try {
    const materias = await Materia.find().sort({ semestre: 1, nombre: 1 });
    res.json(materias);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function editarMateria(req, res) {
  try {
    const materia = await Materia.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!materia) return res.status(404).json({ error: 'Materia no encontrada' });
    res.json(materia);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

async function borrarMateria(req, res) {
  try {
    const materia = await Materia.findByIdAndDelete(req.params.id);
    if (!materia) return res.status(404).json({ error: 'Materia no encontrada' });
    res.json({ message: 'Materia eliminada' });
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

    const semestres = {};
    calificaciones.forEach(c => {
      if (!semestres[c.semestre]) semestres[c.semestre] = { calificaciones: [] };
      semestres[c.semestre].calificaciones.push(c);
    });

    res.json({ alumno_id: req.params.id, semestres });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = {
  crearAlumno, listarAlumnos, editarAlumno, borrarAlumno,
  crearMaestro, listarMaestros, editarMaestro, borrarMaestro,
  crearCalificacion, listarCalificaciones, editarCalificacion, borrarCalificacion,
  crearMateria, listarMaterias, editarMateria, borrarMateria,
  historialAlumno
};
