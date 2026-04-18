BEGIN TRANSACTION;
CREATE TABLE alerts (
	id INTEGER NOT NULL, 
	timestamp DATETIME, 
	type VARCHAR(50) NOT NULL, 
	media_path VARCHAR(255), 
	media_filename VARCHAR(255), 
	status VARCHAR(20), 
	PRIMARY KEY (id)
);
INSERT INTO "alerts" VALUES(1,'2026-04-18 06:54:32.219000','human_detected','/static/uploads/cc8d5b7b2208447f89e12d87906e2d37.jpg','cc8d5b7b2208447f89e12d87906e2d37.jpg','unseen');
INSERT INTO "alerts" VALUES(2,'2026-04-18 06:56:42.781000','intrusion','/static/uploads/97254cac4ff24831b7ed59e8eb4221c1.jpg','97254cac4ff24831b7ed59e8eb4221c1.jpg','unseen');
INSERT INTO "alerts" VALUES(3,'2026-04-18 06:58:51.492000','motion','/static/uploads/67e8d46036ac4734ba4fe7ff1e53e990.jpg','67e8d46036ac4734ba4fe7ff1e53e990.jpg','unseen');
CREATE TABLE users (
	id INTEGER NOT NULL, 
	username VARCHAR(80) NOT NULL, 
	password_hash VARCHAR(255) NOT NULL, 
	created_at DATETIME, 
	PRIMARY KEY (id), 
	UNIQUE (username)
);
INSERT INTO "users" VALUES(1,'admin','scrypt:32768:8:1$phCUSdFDVDVeiG86$628768b5b5ac0c121e3e2f5a846656fea2fb64f1ff32ab7d2843eca90b3cfda9f79cf905ee31a98e4f13f2552d0e7a4d698d606043d80800179f5ed7cb7c4c50','2026-04-18 06:53:40.016688');
COMMIT;
