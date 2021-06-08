var express = require('express');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var healthRoute = require('./routes/health');

const {readSecrets} = require("./config/secrets.config");

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use('/stats-bff/health', healthRoute);

async function init() {
  await readSecrets();
}

init().then(() => {
  const {getPastDayTPS, getTransactionData} = require('./routes/transactions');
  const feeRoute = require('./routes/fees');
  app.use('/stats-bff/transactions/:stat', getTransactionData);
  app.use('/stats-bff/tps', getPastDayTPS);
  app.use('/stats-bff/fee', feeRoute);
  app.listen(8080, () => {
    console.log(`Stats-BFF Started Successfully`);
  });
})

module.exports = app;
