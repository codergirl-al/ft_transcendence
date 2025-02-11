const { Pool } = require('pg');

const pool = new Pool({
	user: 'yourUsername',
	host: 'localhost',
	database: 'yourDatabase',
	password: 'yourPassword',
	port: 5432,
});

pool.connect((err, client, release) => {
	if (err) {
		return console.error('Error acquiring client', err.stack);
	}
	console.log('Connected to the database');
	release();
});

module.exports = pool;