'use strict';

const controller = require('./controllers/controller');

// Constants
 const PORT = 8080;

// App
 const app = express();
app.get('/', function (req, res) {
  res.send('Hello world hojohahaha 123456789');
});

app.listen(PORT);
console.log('Running on http://localhost:' + PORT);
