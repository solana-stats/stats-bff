var express = require('express');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var healthRoute = require('./routes/health');
var transactionRoute = require('./routes/transactions');
const {readSecrets} = require("./config/secrets.config");

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use('/stats-bff/health', healthRoute);
app.use('/stats-bff/:stat', transactionRoute);

async function init() {
  await readSecrets();
}

init().then(() => {
  app.listen(8081, () => {
    console.log(`Stats-BFF Started Successfully`);
  });
})

module.exports = app;
