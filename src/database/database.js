// donde creamos la conexión a la base de datos
//importo dotenv para poder usar .env
import 'dotenv/config';
// importo la clase Sequelize
import Sequelize from "sequelize";

// Creamos un objeto base de datos y lo exportamos usando los datos de .env
export const sequelize = new Sequelize({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  dialect: 'mysql',
  // other Sequelize configurations...
});
