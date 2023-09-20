const Note = require('../models/Note.js');
const { db } = require('../data/db.js');

const getNotes = (req, res) => {
  let sql =
    'SELECT note_id, title, text, tags, user_id, timestamp FROM notepad ORDER BY note_id DESC';

  db.all(sql, [], (err, rows) => {
    if (err) {
      console.error(err.message);
    }

    res.render('notes', { title: 'Notes', notes: rows });
  });
};

const getNotesAsynchronously = (req, res) => {
  const sql =
    'SELECT note_id, title, text, tags, user_id, timestamp FROM notepad ORDER BY note_id DESC';

  db.all(sql, [], (err, rows) => {
    if (err) {
      return console.error(err.message);
    }

    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ note: rows }));
  });
};

const getNote = (req, res) => {
  const stmt =
    'SELECT note_id, title, text, tags, user_id, timestamp FROM notepad WHERE note_id = ?';
  var params = [req.body.id];

  db.get(stmt, params, (err, row) => {
    if (err) {
      return console.error(err.message);
    }
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ note: row }));
  });
};

const searchNote = (req, res) => {
  let sql =
    'SELECT note_id, title, text, tags, user_id, timestamp FROM notepad WHERE title LIKE ? OR text LIKE ?';
  let searchConcat = '%' + req.body.search + '%';
  var params = [searchConcat, searchConcat];

  db.all(sql, params, (err, rows) => {
    if (err) {
      return console.error(err.message);
    }

    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ notes: rows }));
  });
};

const createNote = (req, res) => {
  const stmt = db.prepare(
    'INSERT INTO notepad title, text, tags VALUES (?, ?, ?)'
  );
  stmt.run(
    'Mon titre',
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
    'MonTag'
  );
  stmt.finalize();

  res.send("Alimentation réussie de la table 'notepad'");
};

const updateNote = (req, res) => {
  let stmt = null;
  let params = null;
  res.setHeader('Content-Type', 'application/json');

  // Si id ET titre et/ou texte = note existante = mettre à jour
  // Si titre et/ou texte existant MAIS pas de id = note inexistante = nouvelle note
  // Si titre et texte manquant = note vide = supprimer
  if ((req.body.title || req.body.text) && req.body.id) {
    stmt = 'UPDATE notepad SET title = ?, text = ? WHERE note_id = ?';
    params = [req.body.title, req.body.text, req.body.id];
  } else if ((req.body.title || req.body.text) && !req.body.id) {
    stmt = 'INSERT INTO notepad (title, text) VALUES (?, ?)';
    params = [req.body.title, req.body.text];
  } else {
    stmt = 'DELETE FROM notepad WHERE note_id = ?';
    params = [req.body.id];
  }

  db.run(stmt, params, function (err, row) {
    if (err) {
      console.error(err.message);
      return res.end(
        JSON.stringify({
          status: 'error',
          row: row,
          data: req.body,
          stmt: stmt,
          id: this.lastID,
        })
      );
    }

    res.end(
      JSON.stringify({
        status: 'success',
        row: row,
        data: req.body,
        stmt: stmt,
        id: this.lastID,
      })
    );
  });
};

const deleteNote = (req, res) => {
  let stmt = 'DELETE FROM notepad WHERE note_id = ?';
  let params = [req.body.id];

  db.run(stmt, params, function (err, row) {
    if (err) {
      console.error(err.message);
    }

    res.setHeader('Content-Type', 'application/json');
    res.end(
      JSON.stringify({
        status: 'success',
        row: row,
        data: req.body,
        id: this.lastID,
      })
    );
  });
};

module.exports = {
  getNotes,
  getNotesAsynchronously,
  getNote,
  createNote,
  searchNote,
  updateNote,
  deleteNote,
};
