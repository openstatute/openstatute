const path = require('path');
const express = require('express');
const { markdown } = require('markdown');
const moment = require('moment');

const getContent = require('./helpers/get-content');
const states = require('./constants/states');

const app = express();

app.set('port', (process.env.PORT || 5000));

// static files
// /public
app.use('/static', express.static(path.join(__dirname, '..', 'public')));

// ejs files
// /views
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use((req, res, next) => {
  res.locals.moment = moment;
  res.locals.title = null;
  res.locals.states = states;
  next();
});

// routes
app.get('/', (req, res) => {
  res.render('index');
});

app.get('/law/:entity', (req, res) => {
  res.redirect(`/law/${req.params.entity}/constitution`);
});

app.get('/law/:entity/:documentId', (req, res) => {
  let sectionIndex = 'all';

  // special case
  // some document is too big to display in full
  if (req.params.entity === 'alabama' && req.params.documentId === 'constitution') {
    sectionIndex = 1;
  }

  res.redirect(`/law/${req.params.entity}/${req.params.documentId}/${sectionIndex}`);
});

app.get('/law/:entity/:documentId/:sectionIndex', (req, res, next) => {
  const sectionIndex = req.params.sectionIndex === 'all' ? 'all' : parseInt(req.params.sectionIndex, 10);

  getContent(req.params.entity, req.params.documentId, sectionIndex)
    .then((result) => {
      res.render('law-document', {
        entity: req.params.entity,
        sectionIndex,
        documentId: req.params.documentId,
        title: `${result.sectionTitle} - ${result.documentTitle}`,
        documentContent: markdown.toHTML(result.mdContent),
        date: result.date,
        toc: result.toc,
      });
    })
    .catch(next);
});

app.use((req, res) => {
  res.status(404).render('error', { status: 404, message: 'Not Found' });
});

app.use((err, req, res, next) => { // eslint-disable-line
  console.error(err.stack);

  if (err && err.response && err.response.status === 404) {
    return res.status(404).render('error', { status: 404, message: 'Not Found' });
  }

  return res.status(500).render('error', { status: 500, message: 'Internal Server Error' });
});

app.listen(app.get('port'), () => {
  console.log('Node app is running on port', app.get('port'));
});
