const client = require('../config/db.config')

async function getDailyFees(req, res) {
    console.log('creating query');
    let query = `SELECT SUM(fee_amt) from stats.block_stats where block_time < now() and block_time > now() - interval '1 Day';`
    console.log('sending query');
    try {
        let dbResponse = await client.query(query);
        console.log('response received');
        res.send({
            fees: dbResponse.rows[0].sum
        });
    } catch (e) {
        console.log(e);
    }
}

module.exports = getDailyFees