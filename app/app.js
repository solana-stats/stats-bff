var express = require('express');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var healthRoute = require('./routes/health');
var transactionRoute = require('./routes/transactions');
var feeRoute = require('./routes/fees');
const {readSecrets} = require("./config/secrets.config");

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use('/stats-bff/health', healthRoute);
app.use('/stats-bff/transactions/:stat', transactionRoute);
app.use('/stats-bff/fee', feeRoute);

async function init() {
  await readSecrets();
}

init().then(() => {
  app.listen(8080, () => {
    console.log(`Stats-BFF Started Successfully`);
  });
})

module.exports = app;
