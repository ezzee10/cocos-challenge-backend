import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedInstruments1748799375610 implements MigrationInterface {
	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`INSERT INTO instruments (ticker,"name","type") VALUES
				('DYCA','Dycasa S.A.','ACCIONES'),
				('CAPX','Capex S.A.','ACCIONES'),
				('PGR','Phoenix Global Resources','ACCIONES'),
				('MOLA','Molinos Agro S.A.','ACCIONES'),
				('MIRG','Mirgor','ACCIONES'),
				('PATA','Importadora y Exportadora de la Patagonia','ACCIONES'),
				('TECO2','Telecom','ACCIONES'),
				('FERR','Ferrum S.A.','ACCIONES'),
				('SAMI','S.A San Miguel','ACCIONES'),
				('IRCP','IRSA Propiedades Comerciales S.A.','ACCIONES');
			INSERT INTO instruments (ticker,"name","type") VALUES
				('GAMI','Boldt Gaming S.A.','ACCIONES'),
				('DOME','Domec','ACCIONES'),
				('INTR','Compañía Introductora de Buenos Aires S.A.','ACCIONES'),
				('MTR','Matba Rofex S.A.','ACCIONES'),
				('FIPL','Fiplasto','ACCIONES'),
				('GARO','Garovaglio Y Zorraquín','ACCIONES'),
				('SEMI','Molinos Juan Semino','ACCIONES'),
				('HARG','Holcim (Argentina) S.A.','ACCIONES'),
				('BPAT','Banco Patagonia','ACCIONES'),
				('RIGO','Rigolleau S.A.','ACCIONES');
			INSERT INTO instruments (ticker,"name","type") VALUES
				('CVH','Cablevision Holding','ACCIONES'),
				('BBAR','Banco Frances','ACCIONES'),
				('LEDE','Ledesma','ACCIONES'),
				('CELU','Celulosa Argentina S.A.','ACCIONES'),
				('CECO2','Central Costanera','ACCIONES'),
				('AGRO','Agrometal','ACCIONES'),
				('AUSO','Autopistas del Sol','ACCIONES'),
				('BHIP','Banco Hipotecario S.A.','ACCIONES'),
				('BOLT','Boldt S.A.','ACCIONES'),
				('CARC','Carboclor S.A.','ACCIONES');
			INSERT INTO instruments (ticker,"name","type") VALUES
				('BMA','Banco Macro S.A.','ACCIONES'),
				('CRES','Cresud S.A.','ACCIONES'),
				('EDN','Edenor S.A.','ACCIONES'),
				('GGAL','Grupo Financiero Galicia','ACCIONES'),
				('DGCU2','Distribuidora De Gas Cuyano S.A.','ACCIONES'),
				('GBAN','Gas Natural Ban S.A.','ACCIONES'),
				('CGPA2','Camuzzi Gas del Sur','ACCIONES'),
				('CADO','Carlos Casado','ACCIONES'),
				('GCLA','Grupo Clarin S.A.','ACCIONES'),
				('GRIM','Grimoldi','ACCIONES');
			INSERT INTO instruments (ticker,"name","type") VALUES
				('RICH','Laboratorios Richmond','ACCIONES'),
				('MOLI','Molinos Río de la Plata','ACCIONES'),
				('VALO','BCO DE VALORES ACCIONES ORD.','ACCIONES'),
				('TGNO4','Transportadora de Gas del Norte','ACCIONES'),
				('LOMA','Loma Negra S.A.','ACCIONES'),
				('IRSA','IRSA Inversiones y Representaciones S.A.','ACCIONES'),
				('PAMP','Pampa Holding S.A.','ACCIONES'),
				('TGSU2','Transportadora de Gas del Sur','ACCIONES'),
				('TXAR','Ternium Argentina S.A','ACCIONES'),
				('YPFD','Y.P.F. S.A.','ACCIONES');
			INSERT INTO instruments (ticker,"name","type") VALUES
				('MORI','Morixe Hermanos S.A.C.I.','ACCIONES'),
				('INVJ','Inversora Juramento S.A.','ACCIONES'),
				('POLL','Polledo S.A.','ACCIONES'),
				('METR','MetroGAS S.A.','ACCIONES'),
				('LONG','Longvie','ACCIONES'),
				('SUPV','Grupo Supervielle S.A.','ACCIONES'),
				('ROSE','Instituto Rosenbusch','ACCIONES'),
				('OEST','Oeste Grupo Concesionario','ACCIONES'),
				('COME','Sociedad Comercial Del Plata','ACCIONES'),
				('CEPU','Central Puerto','ACCIONES');
			INSERT INTO instruments (ticker,"name","type") VALUES
				('ALUA','Aluar Aluminio Argentino S.A.I.C.','ACCIONES'),
				('CTIO','Consultatio S.A.','ACCIONES'),
				('TRAN','Transener S.A.','ACCIONES'),
				('HAVA','Havanna Holding','ACCIONES'),
				('BYMA','Bolsas y Mercados Argentinos S.A.','ACCIONES');
				INSERT INTO instruments (ticker,"name","type") VALUES
				('ARS','PESOS','MONEDA');`,
		);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query('DELETE FROM instruments');
	}
}
