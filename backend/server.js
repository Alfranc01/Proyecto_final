require('dotenv').config();
const dns = require('dns');
dns.setServers(['8.8.8.8']);
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const { seedDemoUser } = require('./controllers/authController');
const { register, login } = require('./controllers/authController');
const {
  crearAlumno, listarAlumnos, editarAlumno, borrarAlumno,
  crearMaestro, listarMaestros, editarMaestro, borrarMaestro,
  crearCalificacion, listarCalificaciones, editarCalificacion, borrarCalificacion,
  historialAlumno,
  crearAsistencia, listarAsistencias, editarAsistencia, borrarAsistencia
} = require('./controllers/crudController');
const { Alumno, Calificacion, Maestro, Materia, Asistencia } = require('./models/Schemas');
const { auth } = require('./middleware/auth');
const escolarRoutes = require('./routes/escolar');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.post('/api/register', register);
app.post('/api/login', login);

app.use('/api', escolarRoutes);

app.get('/api/stats', auth, async (req, res) => {
  try {
    const [totalAlumnos, totalCalificaciones, totalMaestros, totalMaterias] = await Promise.all([
      Alumno.countDocuments(),
      Calificacion.countDocuments(),
      Maestro.countDocuments(),
      Materia.countDocuments()
    ]);
    const promedioRaw = await Calificacion.aggregate([
      { $group: { _id: null, avg: { $avg: '$puntaje' } } }
    ]);
    const semestres = await Calificacion.distinct('semestre');
    const ultimosAlumnos = await Alumno.find().sort({ createdAt: -1 }).limit(5);
    res.json({
      totalAlumnos, totalCalificaciones, totalMaestros, totalMaterias,
      promedioGeneral: promedioRaw.length > 0 ? promedioRaw[0].avg.toFixed(1) : '—',
      totalSemestres: semestres.length,
      ultimosAlumnos
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/materias', auth, async (req, res) => {
  try {
    const materias = await Materia.find().sort({ semestre: 1, nombre: 1 });
    res.json(materias);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/alumnos', auth, listarAlumnos);
app.post('/api/alumnos', auth, crearAlumno);
app.put('/api/alumnos/:id', auth, editarAlumno);
app.delete('/api/alumnos/:id', auth, borrarAlumno);

app.get('/api/maestros', auth, listarMaestros);
app.post('/api/maestros', auth, crearMaestro);
app.put('/api/maestros/:id', auth, editarMaestro);
app.delete('/api/maestros/:id', auth, borrarMaestro);

app.get('/api/calificaciones', auth, listarCalificaciones);
app.post('/api/calificaciones', auth, crearCalificacion);
app.put('/api/calificaciones/:id', auth, editarCalificacion);
app.delete('/api/calificaciones/:id', auth, borrarCalificacion);

app.get('/api/asistencias', auth, listarAsistencias);
app.post('/api/asistencias', auth, crearAsistencia);
app.put('/api/asistencias/:id', auth, editarAsistencia);
app.delete('/api/asistencias/:id', auth, borrarAsistencia);

app.get('/api/historial/:id', auth, historialAlumno);

const MONGO_URI = process.env.MONGODB_URI || "mongodb+srv://Alfranc01:Alframor7@cluster0.6nlj2kg.mongodb.net/Proyecto_final?retryWrites=true&w=majority";

mongoose.connect(MONGO_URI)
  .then(async () => {
    console.log('Conectado a MongoDB');
    await seedDemoUser();
    app.listen(PORT, () => console.log(`Servidor en puerto ${PORT}`));
  })
  .catch(err => {
    console.error('Error conectando a MongoDB:', err.message);
    process.exit(1);
  });