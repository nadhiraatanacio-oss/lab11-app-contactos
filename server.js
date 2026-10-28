const express = require('express');
const fs = require('fs');
const os = require('os');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA = path.join(__dirname, 'contactos.json');

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

function leer() {
  if (!fs.existsSync(DATA)) return [];
  return JSON.parse(fs.readFileSync(DATA, 'utf8'));
}

function guardar(lista) {
  fs.writeFileSync(DATA, JSON.stringify(lista, null, 2));
}

// Datos del servidor (para saber si estamos en Windows o Debian)
app.get('/api/servidor', (req, res) => {
  res.json({
    hostname: os.hostname(),
    sistema: os.type() + ' ' + os.release(),
    plataforma: os.platform()
  });
});

// Listar contactos
app.get('/api/contactos', (req, res) => {
  res.json(leer());
});

// Crear contacto
app.post('/api/contactos', (req, res) => {
  const { nombre, telefono, correo } = req.body;
  if (!nombre || !telefono) {
    return res.status(400).json({ error: 'Nombre y telefono son obligatorios' });
  }
  const lista = leer();
  const nuevo = { id: Date.now(), nombre, telefono, correo: correo || '' };
  lista.push(nuevo);
  guardar(lista);
  res.status(201).json(nuevo);
});

// Editar contacto
app.put('/api/contactos/:id', (req, res) => {
  const lista = leer();
  const i = lista.findIndex(c => c.id == req.params.id);
  if (i === -1) return res.status(404).json({ error: 'No encontrado' });
  lista[i] = { ...lista[i], ...req.body, id: lista[i].id };
  guardar(lista);
  res.json(lista[i]);
});

// Eliminar contacto
app.delete('/api/contactos/:id', (req, res) => {
  const lista = leer().filter(c => c.id != req.params.id);
  guardar(lista);
  res.json({ ok: true });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log('App de contactos corriendo en el puerto ' + PORT);
});
