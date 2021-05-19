
async function healthCheck(req, res) {
  res.send('Stats-BFF is healthy');
}

module.exports = healthCheck;