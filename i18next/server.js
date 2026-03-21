import express from 'express';
import i18next from 'i18next';
import FSBackend from 'i18next-fs-backend';
import middleware from 'i18next-http-middleware';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const preload = ['en', 'zh-CN'];
const port = 4170;
const app = express();

i18next
  .use(FSBackend)
  .use(middleware.LanguageDetector)
  .init({
    // debug: true,
    initImmediate: false,
    lng: 'en',
    fallbackLng: 'en',
    load: preload,
    preload,
    ns: ['translation'],
    defaultNS: 'translation',
    backend: {
      loadPath: path.join(__dirname, '../src/locales/{{lng}}/{{ns}}.json'),
      addPath: path.join(__dirname, '../src/locales/{{lng}}/{{ns}}.missing.json')
    },
    saveMissing: true,
    saveMissingTo: 'current',
    interpolation: {
      escapeValue: false
    }
  });

app.use(express.json());
app.use(middleware.handle(i18next));

app.get('/', (req, res) => {
  console.log(__dirname, __filename);
  res.send(req.t('welcome'));
});

app.post('/', (req, res) => {
  console.log(req.body);
  res.send('Received');
});

// missing keys make sure the body is parsed (i.e. with [body-parser](https://github.com/expressjs/body-parser#bodyparserjsonoptions))
app.post('/locales/add/:lng/:ns', (req, res) => {
  console.log(req.body);
  middleware.missingKeyHandler(i18next)(req, res);
});
// addPath for client: http://localhost:5170/locales/add/{{lng}}/{{ns}}

// multiload backend route
app.get('/locales/resources.json', middleware.getResourcesHandler(i18next));
// can be used like:
// GET /locales/resources.json
// GET /locales/resources.json?lng=en
// GET /locales/resources.json?lng=en&ns=translation

// serve translations:
app.use('/locales', express.static('../src/locales'));
// GET /locales/en/translation.json
// loadPath for client: http://localhost:5170/locales/{{lng}}/{{ns}}.json

app.get(
  '/locales/:lng/:ns',
  middleware.getResourcesHandler(i18next, {
    maxAge: 60 * 60 * 24 * 30, // adds appropriate cache header if cache option is passed or NODE_ENV === 'production', defaults to 30 days
    cache: true // defaults to false
  })
);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
