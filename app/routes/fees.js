const client = require('../config/db.config')

async function getDailyFees(req, res) {
    let query = `SELECT SUM(fee_amt) from stats.block_stats where block_time < now() and block_time > now() - interval '1 Day';`
    let dbResponse = await client.query(query);
    res.send({
        fees: dbResponse.rows[0].sum
    });
}

module.exports = getDailyFees