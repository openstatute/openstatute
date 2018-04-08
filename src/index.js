const path = require('path');
const express = require('express');
const sassMiddleware = require('node-sass-middleware');
const { markdown } = require('markdown');
const markdownToc = require('markdown-toc');
const routeCache = require('route-cache');

const cachedTextFetch = require('./helpers/cached-text-fetch');
const states = require('./constants/states');

const app = express();

app.set('port', (process.env.PORT || 5000));

// sass files
// /sass
app.use(sassMiddleware({
  /* Options */
  src: path.join(__dirname, 'sass'),
  dest: path.join(__dirname, 'public'),
  debug: true,
  outputStyle: 'compressed',
  prefix: '/static',
}));

// static files
// /public
app.use('/static', express.static(path.join(__dirname, 'public')));
app.use('/static/uswds', express.static(path.join(__dirname, '..', 'node_modules', 'uswds', 'dist')));

// ejs files
// /views
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// routes
app.get('/', (req, res) => {
  res.render('index', {
    states,
  });
});

app.get('/law/:entity', (req, res) => {
  res.redirect(`/law/${req.params.entity}/constitution`);
});


app.get('/law/:entity/constitution', routeCache.cacheSeconds(60 * 60 * 60), (req, res, next) => {
  cachedTextFetch(`https://raw.githubusercontent.com/openstatute/us-statutes/production/${req.params.entity}/constitution.md`)
    .then((mdContent) => {
      res.render('law-document', {
        documentContent: markdown.toHTML(mdContent, 'Maruku'),
        toc: markdownToc(mdContent, { firsth1: false }).json,
      });
    })
    .catch(next);
});

app.listen(app.get('port'), () => {
  console.log('Node app is running on port', app.get('port'));
});
