const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  rol: { type: String, enum: ['admin', 'maestro', 'alumno'], default: 'alumno' }
}, { timestamps: true });

const alumnoSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  matricula: { type: String, required: true, unique: true },
  carrera: { type: String, required: true },
  estado: { type: String, default: 'Activo' },
  usuario_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

const materiaSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  codigo: { type: String, required: true, unique: true },
  semestre: { type: Number, required: true }
}, { timestamps: true });

const maestroSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  materias: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Materia' }],
  usuario_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

const asignacionMaestroSchema = new mongoose.Schema({
  maestro_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Maestro', required: true },
  materia_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Materia', required: true },
  grupo: { type: String, required: true }
}, { timestamps: true });

const calificacionSchema = new mongoose.Schema({
  materia_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Materia', required: true },
  alumno_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Alumno', required: true },
  puntaje: { type: Number, required: true, min: 0, max: 100 },
  semestre: { type: String, required: true }
}, { timestamps: true });

module.exports = {
  User: mongoose.model('User', userSchema),
  Alumno: mongoose.model('Alumno', alumnoSchema),
  Materia: mongoose.model('Materia', materiaSchema),
  Maestro: mongoose.model('Maestro', maestroSchema),
  AsignacionMaestro: mongoose.model('AsignacionMaestro', asignacionMaestroSchema),
  Calificacion: mongoose.model('Calificacion', calificacionSchema)
};
