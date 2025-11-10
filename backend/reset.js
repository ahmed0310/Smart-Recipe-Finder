// reset.js — drop and recreate empty schema for clean tests
const mysql = require('mysql2');

const DB_NAME = 'smart_recipe_finder';
const ROOT_CONFIG = {
	host: 'localhost',
	user: 'root',
	password: '1234'
};

function run(connection, sql, params = []) {
	return new Promise((resolve, reject) => {
		connection.query(sql, params, (err, results) => {
			if (err) return reject(err);
			resolve(results);
		});
	});
}

async function main() {
	const admin = mysql.createConnection(ROOT_CONFIG);
	try {
		console.log('→ Ensuring database exists…');
		await run(admin, `CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
	} finally {
		admin.end();
	}

	const db = mysql.createConnection({ ...ROOT_CONFIG, database: DB_NAME });
	try {
		console.log('→ Dropping tables (if exist)…');
		await run(db, `SET FOREIGN_KEY_CHECKS=0;`);
		await run(db, `DROP TABLE IF EXISTS favourites;`);
		await run(db, `DROP TABLE IF EXISTS contacts;`);
		await run(db, `DROP TABLE IF EXISTS users;`);
		await run(db, `SET FOREIGN_KEY_CHECKS=1;`);

		console.log('→ Recreating empty tables…');
		await run(db, `
			CREATE TABLE users (
				id INT AUTO_INCREMENT PRIMARY KEY,
				name VARCHAR(100) NOT NULL,
				email VARCHAR(255) NOT NULL UNIQUE,
				password VARCHAR(255) NOT NULL,
				created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
			) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
		`);

		await run(db, `
			CREATE TABLE favourites (
				id INT AUTO_INCREMENT PRIMARY KEY,
				user_id INT NOT NULL,
				recipe_title VARCHAR(255) NOT NULL,
				recipe_text TEXT,
				created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
				INDEX (user_id),
				CONSTRAINT fk_favourites_user
					FOREIGN KEY (user_id) REFERENCES users(id)
					ON DELETE CASCADE ON UPDATE CASCADE
			) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
		`);

		await run(db, `
			CREATE TABLE contacts (
				id INT AUTO_INCREMENT PRIMARY KEY,
				name VARCHAR(100) NOT NULL,
				email VARCHAR(255) NOT NULL,
				message TEXT NOT NULL,
				created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
			) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
		`);

		console.log('✓ Database reset complete. Tables are empty.');
	} catch (err) {
		console.error('❌ Reset failed:', err);
		process.exitCode = 1;
	} finally {
		db.end();
	}
}

main();

