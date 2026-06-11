import { useState, useEffect } from 'react';
import {
  GraduationCap, Users, BookOpen, BarChart3, LogOut, Plus, Trash2, Edit,
  UserCheck, ClipboardList, Calendar, History, ArrowUp, ArrowDown
} from 'lucide-react';

// --- CONFIGURACIÓN DE URL PARA PRODUCCIÓN ---
const BASE_URL = window.location.hostname.includes('vercel.app') 
  ? 'https://proyecto-final-2-1kya.onrender.com' 
  : '';

const navItems = [
  { key: 'dashboard', label: 'Dashboard', icon: BarChart3 },
  { key: 'alumnos', label: 'Alumnos', icon: Users },
  { key: 'maestros', label: 'Maestros', icon: UserCheck },
  { key: 'materias', label: 'Materias', icon: BookOpen },
  { key: 'calificaciones', label: 'Calificaciones', icon: ClipboardList },
  { key: 'historial', label: 'Historial', icon: History },
];

function sortData(data, config) {
  if (!config || !config.key) return data;
  return [...data].sort((a, b) => {
    const aVal = a[config.key];
    const bVal = b[config.key];
    if (typeof aVal === 'string') {
      return config.dir === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
    }
    return config.dir === 'asc' ? (aVal || 0) - (bVal || 0) : (bVal || 0) - (aVal || 0);
  });
}

function SortHeader({ label, sortKey, config, onSort }) {
  const active = config?.key === sortKey;
  return (
    <th className="sortable" onClick={() => onSort(sortKey)}>
      {label} {active ? (config.dir === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} />) : ''}
    </th>
  );
}

function App() {
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [page, setPage] = useState('dashboard');
  const [stats, setStats] = useState({});
  const [alumnos, setAlumnos] = useState([]);
  const [maestros, setMaestros] = useState([]);
  const [materias, setMaterias] = useState([]);
  const [calificaciones, setCalificaciones] = useState([]);
  const [historial, setHistorial] = useState(null);
  const [showModal, setShowModal] = useState(null);
  const [form, setForm] = useState({});
  const [editId, setEditId] = useState(null);
  const [historialAlumnoId, setHistorialAlumnoId] = useState('');
  const [sort, setSort] = useState({});

  const api = async (url, opts = {}) => {
    try {
      const res = await fetch(`${BASE_URL}${url}`, {
        ...opts,
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}), ...opts.headers },
      });
      if (res.status === 401) { setToken(''); localStorage.removeItem('token'); return null; }
      return await res.json();
    } catch { return null; }
  };

  useEffect(() => {
    if (!token) return;
    fetchData();
  }, [token, page]);

  const fetchData = async () => {
    if (page === 'dashboard') {
      const d = await api('/api/stats');
      if (d) setStats(d);
    }
    if (page === 'alumnos') {
      const d = await api('/api/alumnos');
      if (d) setAlumnos(d);
    }
    if (page === 'maestros') {
      const [m, mats] = await Promise.all([api('/api/maestros'), api('/api/materias')]);
      if (m) setMaestros(m);
      if (mats) setMaterias(mats);
    }
    if (page === 'materias') {
      const d = await api('/api/materias');
      if (d) setMaterias(d);
    }
    if (page === 'calificaciones') {
      const [c, a, m] = await Promise.all([api('/api/calificaciones'), api('/api/alumnos'), api('/api/materias')]);
      if (c) setCalificaciones(c);
      if (a) setAlumnos(a);
      if (m) setMaterias(m);
    }
    if (page === 'historial') {
      const [a, m] = await Promise.all([api('/api/alumnos'), api('/api/materias')]);
      if (a) setAlumnos(a);
      if (m) setMaterias(m);
    }
  };

  const handleSort = (key) => {
    setSort(prev => prev?.key === key ? { key, dir: prev.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'asc' });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    const res = await fetch(`${BASE_URL}/api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    if (!res.ok) return alert('Credenciales inválidas o error de conexión');
    const data = await res.json();
    localStorage.setItem('token', data.token);
    setToken(data.token);
  };

  const handleLogout = () => {
    setToken(''); localStorage.removeItem('token');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const isEdit = editId !== null;
    let body = { ...form };
    if (showModal === 'asistencias') {
      body.registros = alumnos.map(a => ({
        alumno_id: a._id,
        presente: body[a._id] || false
      }));
    }
    const url = isEdit ? `/api/${showModal}/${editId}` : `/api/${showModal}`;
    const res = await api(url, { method: isEdit ? 'PUT' : 'POST', body: JSON.stringify(body) });
    if (res && res.error) return alert(res.error);
    setShowModal(null); setForm({}); setEditId(null);
    fetchData();
  };

  const handleEdit = (endpoint, item) => {
    let f = { ...item };
    if (endpoint === 'calificaciones') {
      if (item.alumno_id?._id) f.alumno_id = item.alumno_id._id;
      if (item.materia_id?._id) f.materia_id = item.materia_id._id;
    }
    if (endpoint === 'maestros') {
      f.materias = (item.materias || []).map(m => m._id || m);
    }
    setShowModal(endpoint);
    setForm(f);
    setEditId(f._id);
  };

  const handleDelete = async (endpoint, id) => {
    if (!confirm('¿Eliminar este registro?')) return;
    const res = await api(`/api/${endpoint}/${id}`, { method: 'DELETE' });
    if (res && res.error) return alert(res.error);
    fetchData();
  };

  const openCreate = (endpoint) => {
    setShowModal(endpoint);
    if (endpoint === 'calificaciones') setForm({ alumno_id: '', materia_id: '', puntaje: '', semestre: '' });
    else if (endpoint === 'alumnos') setForm({ nombre: '', matricula: '', carrera: '', estado: 'Activo' });
    else if (endpoint === 'maestros') setForm({ nombre: '', email: '', materias: [] });
    else if (endpoint === 'materias') setForm({ nombre: '', codigo: '', semestre: '' });
    else setForm({});
    setEditId(null);
  };

  const loadHistorial = async () => {
    if (!historialAlumnoId) return;
    const d = await api(`/api/historial/${historialAlumnoId}`);
    if (d) setHistorial(d);
  };

  const toggleMateria = (id) => {
    const current = form.materias || [];
    const idx = current.indexOf(id);
    if (idx >= 0) current.splice(idx, 1);
    else current.push(id);
    setForm({ ...form, materias: [...current] });
  };

  if (!token) {
    return (
      <div className="login-page">
        <div className="login-card">
          <div className="login-icon"><GraduationCap size={48} /></div>
          <h1>Sistema Escolar</h1>
          <p className="login-sub">Inicia sesión para continuar</p>
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label>Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="demo@demo.com" required />
            </div>
            <div className="form-group">
              <label>Contraseña</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Demo1234" required />
            </div>
            <button type="submit" className="btn btn-primary btn-block">Ingresar</button>
          </form>
          <p className="login-hint">Demo: demo@demo.com / Demo1234</p>
        </div>
      </div>
    );
  }

  const sortedAlumnos = sortData(alumnos, sort);
  const sortedCalificaciones = sortData(calificaciones, sort);
  const sortedMaestros = sortData(maestros, sort);

  return (
    <div className="app">
      <aside className="sidebar">
        <h1><GraduationCap size={24} /> Sistema Escolar</h1>
        <nav>
          {navItems.map(n => (
            <a key={n.key} className={page === n.key ? 'active' : ''} onClick={() => setPage(n.key)}>
              <n.icon size={18} /> {n.label}
            </a>
          ))}
        </nav>
        <div className="sidebar-footer">
          <button className="btn-logout" onClick={handleLogout}><LogOut size={16} /> Cerrar sesión</button>
        </div>
      </aside>

      <main className="main">
        {page === 'dashboard' && (
          <>
            <div className="header"><h2>Dashboard</h2></div>
            <div className="stats-grid">
              <div className="stat-card primary"><h3><Users size={16} /> Alumnos</h3><div className="value">{stats.totalAlumnos || 0}</div></div>
              <div className="stat-card success"><h3><UserCheck size={16} /> Maestros</h3><div className="value">{stats.totalMaestros || 0}</div></div>
              <div className="stat-card info"><h3><BookOpen size={16} /> Materias</h3><div className="value">{stats.totalMaterias || 0}</div></div>
              <div className="stat-card warning"><h3><ClipboardList size={16} /> Calificaciones</h3><div className="value">{stats.totalCalificaciones || 0}</div></div>
              <div className="stat-card primary"><h3>Promedio General</h3><div className="value">{stats.promedioGeneral || '—'}</div></div>
              <div className="stat-card success"><h3><Calendar size={16} /> Semestres</h3><div className="value">{stats.totalSemestres || 0}</div></div>
            </div>
            <div className="section">
              <div className="section-header"><h3>Últimos Alumnos Registrados</h3></div>
              <table>
                <thead><tr><th>Nombre</th><th>Matrícula</th><th>Carrera</th><th>Estado</th></tr></thead>
                <tbody>
                  {(stats.ultimosAlumnos || []).map(a => (
                    <tr key={a._id}>
                      <td>{a.nombre}</td><td>{a.matricula}</td><td>{a.carrera}</td>
                      <td><span className={`badge ${a.estado === 'Activo' ? 'badge-active' : 'badge-inactive'}`}>{a.estado}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {page === 'alumnos' && (
          <>
            <div className="header"><h2>Gestión de Alumnos</h2></div>
            <div className="section">
              <div className="section-header">
                <h3><Users size={20} /> Lista de Alumnos</h3>
                <button className="btn btn-primary" onClick={() => openCreate('alumnos')}><Plus size={16} /> Nuevo</button>
              </div>
              {sortedAlumnos.length === 0 ? <div className="empty">Sin registros</div> : (
                <table>
                  <thead><tr>
                    <SortHeader label="Nombre" sortKey="nombre" config={sort} onSort={handleSort} />
                    <SortHeader label="Matrícula" sortKey="matricula" config={sort} onSort={handleSort} />
                    <SortHeader label="Carrera" sortKey="carrera" config={sort} onSort={handleSort} />
                    <SortHeader label="Estado" sortKey="estado" config={sort} onSort={handleSort} />
                    <th>Acciones</th>
                  </tr></thead>
                  <tbody>
                    {sortedAlumnos.map(a => (
                      <tr key={a._id}>
                        <td>{a.nombre}</td><td>{a.matricula}</td><td>{a.carrera}</td>
                        <td><span className={`badge ${a.estado === 'Activo' ? 'badge-active' : 'badge-inactive'}`}>{a.estado}</span></td>
                        <td className="actions-cell">
                          <button className="btn-icon" onClick={() => handleEdit('alumnos', a)}><Edit size={14} /></button>
                          <button className="btn-icon danger" onClick={() => handleDelete('alumnos', a._id)}><Trash2 size={14} /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </>
        )}

        {page === 'maestros' && (
          <>
            <div className="header"><h2>Gestión de Maestros</h2></div>
            <div className="section">
              <div className="section-header">
                <h3><UserCheck size={20} /> Lista de Maestros</h3>
                <button className="btn btn-primary" onClick={() => openCreate('maestros')}><Plus size={16} /> Nuevo</button>
              </div>
              {sortedMaestros.length === 0 ? <div className="empty">Sin registros</div> : (
                <table>
                  <thead><tr>
                    <SortHeader label="Nombre" sortKey="nombre" config={sort} onSort={handleSort} />
                    <SortHeader label="Email" sortKey="email" config={sort} onSort={handleSort} />
                    <th>Materias</th>
                    <th>Acciones</th>
                  </tr></thead>
                  <tbody>
                    {sortedMaestros.map(m => (
                      <tr key={m._id}>
                        <td>{m.nombre}</td><td>{m.email}</td>
                        <td><div className="tags">{m.materias?.map(mat => <span key={mat._id} className="tag">{mat.nombre}</span>)}</div></td>
                        <td className="actions-cell">
                          <button className="btn-icon" onClick={() => handleEdit('maestros', m)}><Edit size={14} /></button>
                          <button className="btn-icon danger" onClick={() => handleDelete('maestros', m._id)}><Trash2 size={14} /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </>
        )}

        {page === 'materias' && (
          <>
            <div className="header"><h2>Materias del Plan de Estudios</h2></div>
            <div className="section">
              <div className="section-header">
                <h3><BookOpen size={20} /> Materias Registradas</h3>
                <button className="btn btn-primary" onClick={() => openCreate('materias')}><Plus size={16} /> Nueva</button>
              </div>
              {materias.length === 0 ? <div className="empty">Sin registros</div> : (
                <table>
                  <thead><tr>
                    <SortHeader label="Código" sortKey="codigo" config={sort} onSort={handleSort} />
                    <SortHeader label="Nombre" sortKey="nombre" config={sort} onSort={handleSort} />
                    <SortHeader label="Semestre" sortKey="semestre" config={sort} onSort={handleSort} />
                    <th>Acciones</th>
                  </tr></thead>
                  <tbody>
                    {sortData(materias, sort).map(m => (
                      <tr key={m._id}>
                        <td><span className="badge badge-primary">{m.codigo}</span></td>
                        <td>{m.nombre}</td>
                        <td>{m.semestre}° Semestre</td>
                        <td className="actions-cell">
                          <button className="btn-icon" onClick={() => handleEdit('materias', m)}><Edit size={14} /></button>
                          <button className="btn-icon danger" onClick={() => handleDelete('materias', m._id)}><Trash2 size={14} /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </>
        )}

        {page === 'calificaciones' && (
          <>
            <div className="header"><h2>Gestión de Calificaciones</h2></div>
            <div className="section">
              <div className="section-header">
                <h3><ClipboardList size={20} /> Lista de Calificaciones</h3>
                <button className="btn btn-primary" onClick={() => openCreate('calificaciones')}><Plus size={16} /> Nueva</button>
              </div>
              {sortedCalificaciones.length === 0 ? <div className="empty">Sin registros</div> : (
                <table>
                  <thead><tr>
                    <th>Alumno</th>
                    <th>Matrícula</th>
                    <th>Materia</th>
                    <SortHeader label="Puntaje" sortKey="puntaje" config={sort} onSort={handleSort} />
                    <SortHeader label="Semestre" sortKey="semestre" config={sort} onSort={handleSort} />
                    <th>Acciones</th>
                  </tr></thead>
                  <tbody>
                    {sortedCalificaciones.map(c => (
                      <tr key={c._id}>
                        <td>{c.alumno_id?.nombre || '—'}</td>
                        <td>{c.alumno_id?.matricula || '—'}</td>
                        <td>{c.materia_id?.nombre || '—'}</td>
                        <td><span className={`badge ${c.puntaje >= 60 ? 'badge-active' : 'badge-inactive'}`}>{c.puntaje}</span></td>
                        <td>{c.semestre}</td>
                        <td className="actions-cell">
                          <button className="btn-icon" onClick={() => handleEdit('calificaciones', c)}><Edit size={14} /></button>
                          <button className="btn-icon danger" onClick={() => handleDelete('calificaciones', c._id)}><Trash2 size={14} /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </>
        )}

        {page === 'historial' && (
          <>
            <div className="header"><h2>Historial Académico</h2></div>
            <div className="section">
              <div className="section-header">
                <h3><History size={20} /> Seleccionar Alumno</h3>
              </div>
              <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end' }}>
                <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                  <label>Alumno</label>
                  <select value={historialAlumnoId} onChange={e => setHistorialAlumnoId(e.target.value)}>
                    <option value="">Seleccionar...</option>
                    {alumnos.map(a => <option key={a._id} value={a._id}>{a.nombre} ({a.matricula})</option>)}
                  </select>
                </div>
                <button className="btn btn-primary" onClick={loadHistorial}><History size={16} /> Consultar</button>
              </div>
            </div>
            {historial && (
              <div className="section">
                <div className="section-header">
                  <h3><BookOpen size={20} /> {alumnos.find(a => a._id === historialAlumnoId)?.nombre || ''}</h3>
                </div>
                {Object.entries(historial.semestres || {}).length === 0 ? (
                  <div className="empty">Sin registros académicos</div>
                ) : (
                  Object.entries(historial.semestres || {}).map(([semestre, data]) => {
                    const avg = data.calificaciones.length > 0
                      ? (data.calificaciones.reduce((s, c) => s + c.puntaje, 0) / data.calificaciones.length).toFixed(1)
                      : '—';
                    return (
                      <div key={semestre} className="semestre-block">
                        <h4 className="semestre-title">
                          Semestre {semestre}
                          <span className="badge badge-primary" style={{ marginLeft: 12 }}>Promedio: {avg}</span>
                        </h4>
                        {data.calificaciones.length > 0 && (
                          <table>
                            <thead><tr><th>Materia</th><th>Código</th><th>Puntaje</th></tr></thead>
                            <tbody>
                              {data.calificaciones.map(c => (
                                <tr key={c._id}>
                                  <td>{c.materia_id?.nombre || '—'}</td>
                                  <td><span className="badge badge-primary">{c.materia_id?.codigo || '—'}</span></td>
                                  <td><span className={`badge ${c.puntaje >= 60 ? 'badge-active' : 'badge-inactive'}`}>{c.puntaje}</span></td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </>
        )}
      </main>

      {showModal && (
        <div className="modal-overlay" onClick={() => { setShowModal(null); setEditId(null); }}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>{editId ? 'Editar' : 'Nuevo'} {showModal === 'alumnos' ? 'Alumno' : showModal === 'maestros' ? 'Maestro' : showModal === 'materias' ? 'Materia' : 'Calificación'}</h3>
            <form onSubmit={handleSubmit}>
              {showModal === 'alumnos' && (
                <>
                  <div className="form-group"><label>Nombre</label><input type="text" value={form.nombre || ''} onChange={e => setForm({ ...form, nombre: e.target.value })} required /></div>
                  <div className="form-group"><label>Matrícula</label><input type="text" value={form.matricula || ''} onChange={e => setForm({ ...form, matricula: e.target.value })} required /></div>
                  <div className="form-group"><label>Carrera</label><input type="text" value={form.carrera || ''} onChange={e => setForm({ ...form, carrera: e.target.value })} required /></div>
                  <div className="form-group"><label>Estado</label><select value={form.estado || 'Activo'} onChange={e => setForm({ ...form, estado: e.target.value })}><option value="Activo">Activo</option><option value="Inactivo">Inactivo</option></select></div>
                </>
              )}
              {showModal === 'maestros' && (
                <>
                  <div className="form-group"><label>Nombre</label><input type="text" value={form.nombre || ''} onChange={e => setForm({ ...form, nombre: e.target.value })} required /></div>
                  <div className="form-group"><label>Email</label><input type="email" value={form.email || ''} onChange={e => setForm({ ...form, email: e.target.value })} required /></div>
                  <div className="form-group"><label>Materias a impartir</label>
                    <div className="materias-grid">
                      {materias.map(m => (
                        <label key={m._id} className="checkbox-label">
                          <input type="checkbox" checked={(form.materias || []).includes(m._id)} onChange={() => toggleMateria(m._id)} />
                          {m.nombre}
                        </label>
                      ))}
                    </div>
                  </div>
                </>
              )}
              {showModal === 'materias' && (
                <>
                  <div className="form-group"><label>Nombre</label><input type="text" value={form.nombre || ''} onChange={e => setForm({ ...form, nombre: e.target.value })} required /></div>
                  <div className="form-group"><label>Código</label><input type="text" value={form.codigo || ''} onChange={e => setForm({ ...form, codigo: e.target.value })} required /></div>
                  <div className="form-group"><label>Semestre</label>
                    <select value={form.semestre || ''} onChange={e => setForm({ ...form, semestre: Number(e.target.value) })} required>
                      <option value="">Seleccionar...</option>
                      {[1,2,3,4,5,6,7,8,9,10].map(s => <option key={s} value={s}>{s}° Semestre</option>)}
                    </select>
                  </div>
                </>
              )}
              {showModal === 'calificaciones' && (
                <>
                  <div className="form-group"><label>Alumno</label>
                    <select value={form.alumno_id || ''} onChange={e => setForm({ ...form, alumno_id: e.target.value })} required>
                      <option value="">Seleccionar...</option>
                      {alumnos.map(a => <option key={a._id} value={a._id}>{a.nombre} ({a.matricula})</option>)}
                    </select>
                  </div>
                  <div className="form-group"><label>Materia</label>
                    <select value={form.materia_id || ''} onChange={e => setForm({ ...form, materia_id: e.target.value })} required>
                      <option value="">Seleccionar...</option>
                      {materias.map(m => <option key={m._id} value={m._id}>{m.nombre}</option>)}
                    </select>
                  </div>
                  <div className="form-group"><label>Puntaje (0-100)</label><input type="number" min="0" max="100" value={form.puntaje || ''} onChange={e => setForm({ ...form, puntaje: Number(e.target.value) })} required /></div>
                  <div className="form-group"><label>Semestre</label>
                    <select value={form.semestre || ''} onChange={e => setForm({ ...form, semestre: e.target.value })} required>
                      <option value="">Seleccionar...</option>
                      <option value="2025-1">2025-1</option>
                      <option value="2025-2">2025-2</option>
                      <option value="2026-1">2026-1</option>
                      <option value="2026-2">2026-2</option>
                    </select>
                  </div>
                </>
              )}
              <div className="modal-actions">
                <button type="button" className="btn" onClick={() => { setShowModal(null); setEditId(null); }}>Cancelar</button>
                <button type="submit" className="btn btn-primary">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;