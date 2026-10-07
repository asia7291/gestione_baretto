const mysql = require('mysql2/promise');

const pool = mysql.createPool({
	host: process.env.MYSQL_HOST || 'localhost',
	port: Number(process.env.MYSQL_PORT || 3306),
	user: process.env.MYSQL_USER || 'utente',
	password: process.env.MYSQL_PASSWORD || 'password',
	database: process.env.MYSQL_DATABASE || 'baretto',
	waitForConnections: true,
	connectionLimit: 10,
	queueLimit: 0,
	charset: 'utf8mb4',
});

async function initDatabase() {
	await pool.query(`
		CREATE TABLE IF NOT EXISTS prodotti (
			id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
			nome VARCHAR(120) NOT NULL,
			descrizione TEXT,
			prezzo DECIMAL(10, 2) NOT NULL,
			disponibile BOOLEAN NOT NULL DEFAULT TRUE,
			creato_il TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
		) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
	`);

	await pool.query(`
		CREATE TABLE IF NOT EXISTS personale (
			id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
			nome VARCHAR(80) NOT NULL,
			cognome VARCHAR(80) NOT NULL,
			ruolo VARCHAR(80) NOT NULL,
			email VARCHAR(254) UNIQUE,
			attivo BOOLEAN NOT NULL DEFAULT TRUE,
			creato_il TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
		) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
	`);

	await pool.query(`
		CREATE TABLE IF NOT EXISTS ordini (
			id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
			prodotto_id BIGINT UNSIGNED NOT NULL,
			personale_id BIGINT UNSIGNED NOT NULL,
			quantita INT UNSIGNED NOT NULL DEFAULT 1,
			totale DECIMAL(10, 2) NOT NULL,
			stato ENUM('in_attesa', 'in_preparazione', 'completato', 'annullato')
				NOT NULL DEFAULT 'in_attesa',
			creato_il TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
			CONSTRAINT fk_ordini_prodotto FOREIGN KEY (prodotto_id)
				REFERENCES prodotti(id),
			CONSTRAINT fk_ordini_personale FOREIGN KEY (personale_id)
				REFERENCES personale(id)
		) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
	`);

	console.log('Connessione al database baretto riuscita; tabelle verificate.');
}

if (require.main === module) {
	initDatabase().catch(async (error) => {
		console.error('Errore durante la connessione o la creazione delle tabelle:', error.message);
		await pool.end();
		process.exitCode = 1;
	});
}

module.exports = { pool, initDatabase };
