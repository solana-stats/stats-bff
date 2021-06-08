const client = require('../config/db.config')

const minuteQuery = `SELECT Extract(year from block_time) as year,
    Extract(month from block_time) as month,
    Extract(day from block_time) as day,
    Extract(hour from block_time) as hour,
    Extract(minute from block_time) as minute,
    SUM(num_transactions) as value
    FROM stats.block_stats
    WHERE block_time > now()  - INTERVAL '1 HOUR' AND block_time < now()
    GROUP BY Date_Part('minute', block_time), Date_Part('hour',block_time), Date_Part('day',block_time), Date_Part('month',block_time), Date_Part('year',block_time)
    ORDER BY year, month, day, hour, minute`;

const hourQuery = `SELECT Extract(year from block_time) as year,
    Extract(month from block_time) as month,
    Extract(day from block_time) as day,
    Extract(hour from block_time) as hour,
    Sum(num_transactions) as value
    FROM stats.block_stats
    WHERE block_time > now()  - INTERVAL '1 DAY' AND block_time < now()
    GROUP BY Date_Part('hour',block_time), Date_Part('day',block_time), Date_Part('month',block_time), Date_Part('year',block_time)
    ORDER BY year, month, day, hour;`;

const dayQuery = `SELECT Extract(year from block_time) as year,
    Extract(month from block_time) as month,
    Extract(day from block_time) as day,
    SUM(num_transactions) as value
    FROM stats.block_stats
    WHERE block_time > now() - INTERVAL '7 DAY' AND block_time < now()
    GROUP BY Date_Part('day',block_time), Date_Part('month',block_time), Date_Part('year',block_time)
    ORDER BY year, month, day;`

const tpsQuery = `SELECT Sum(num_transactions)/86400 as tps
    FROM stats.block_stats
    WHERE block_time BETWEEN Now() - INTERVAL '24 HOURS' And Now()`;

function createQuery(interval, stat) {
    let query = '';
    switch (interval) {
        case 'M':
            query = minuteQuery;
            break;
        case 'H':
            query = hourQuery;
            break;
        default:
            query = dayQuery;
            break;
    }
    if (stat === 'transaction') {
        return query;
    } else if (stat === 'fee') {
        return query.replace('num_transactions', 'fee_amt');
    } else if (stat === 'serum') {
        return query.replace('num_transactions', 'num_serum');
    } else {
        return query.replace('num_transactions', 'num_voting')
    }
}

async function getTransactionData(req, res) {
    const stat = req.params.stat;
    const interval = req.query.interval;

    let query = createQuery(interval, stat);
    let dbResponse = await client.query(query);
    res.send(convertToDataSeries(dbResponse));
}

async function getPastDayTPS(req, res) {
    let dbResponse = await client.query(tpsQuery);
    res.send({
        tps: dbResponse.rows[0].tps
    })
}

function convertToDataSeries(data) {
    let formatedResponse = [];
    data.rows.forEach(row => {
        let hour = row.hour ? row.hour : 0;
        let minute = row.minute ? row.minute : 0;
        let date = new Date(row.year, (row.month - 1), row.day, hour, minute);
        let unixTime = date.getTime() / 1000;
        formatedResponse.push({
            time: unixTime,
            value: Number(row.value)
        });
    });
    return formatedResponse;
}

exports.getTransactionData = getTransactionData
exports.getPastDayTPS = getPastDayTPS