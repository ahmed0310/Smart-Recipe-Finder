// seed.js — initialize MySQL schema and demo data
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
	// 1) Connect without a default database to create it if needed
	const adminConn = mysql.createConnection(ROOT_CONFIG);
	try {
		console.log('→ Creating database (if not exists)...');
		await run(adminConn, `CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
		console.log('✓ Database ready');
	} finally {
		adminConn.end();
	}

	// 2) Connect to the target database
	const db = mysql.createConnection({ ...ROOT_CONFIG, database: DB_NAME });
	try {
		console.log('→ Creating tables (if not exists)...');
		await run(db, `
			CREATE TABLE IF NOT EXISTS users (
				id INT AUTO_INCREMENT PRIMARY KEY,
				name VARCHAR(100) NOT NULL,
				email VARCHAR(255) NOT NULL UNIQUE,
				password VARCHAR(255) NOT NULL,
				created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
			) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
		`);

		await run(db, `
			CREATE TABLE IF NOT EXISTS favourites (
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
			CREATE TABLE IF NOT EXISTS contacts (
				id INT AUTO_INCREMENT PRIMARY KEY,
				name VARCHAR(100) NOT NULL,
				email VARCHAR(255) NOT NULL,
				message TEXT NOT NULL,
				created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
			) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
		`);
		console.log('✓ Tables ready');

		// 3) Seed demo user (if not exists)
		console.log('→ Seeding demo user...');
		await run(db, `
			INSERT INTO users (name, email, password)
			VALUES (?, ?, ?)
			ON DUPLICATE KEY UPDATE name = VALUES(name)
		`, ['Demo User', 'demo@example.com', 'password123']);
		const [userRow] = await run(db, `SELECT id FROM users WHERE email = ? LIMIT 1`, ['demo@example.com']);
		const demoUserId = userRow?.id || userRow?.['id'];
		console.log(`✓ Demo user id: ${demoUserId}`);

		// 4) Seed demo favourites (avoid duplicates by title for this user)
		console.log('→ Seeding demo favourites...');
		const demoFavs = [
			['Classic Spaghetti Carbonara', 'Creamy Italian pasta with pancetta, eggs, and cheese.'],
			['Chicken Tikka Masala', 'Tender chicken in a creamy tomato-based sauce with spices.']
		];
		for (const [title, text] of demoFavs) {
			await run(db, `
				INSERT INTO favourites (user_id, recipe_title, recipe_text)
				SELECT ?, ?, ?
				FROM DUAL
				WHERE NOT EXISTS (
					SELECT 1 FROM favourites WHERE user_id = ? AND recipe_title = ?
				)
			`, [demoUserId, title, text, demoUserId, title]);
		}
		console.log('✓ Demo favourites seeded');

		console.log('\nAll done! You can log in with:');
		console.log('  Email: demo@example.com');
		console.log('  Password: password123');
	} catch (err) {
		console.error('❌ Seed failed:', err);
		process.exitCode = 1;
	} finally {
		db.end();
	}
}

main();

