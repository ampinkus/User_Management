// en la carpeta models se incluyen los archivos que crean las tablas de la base de datos
// para poder usar los Datatypes y definir el tipo de datos. 
import { DataTypes } from "sequelize"; 
// importo la instancia sequelize para poder comunicarme con la base de datos
import {sequelize} from '../database/database.js';

// creo la tabla Users, se define como un objeto, y la exporto como Project
// para poder usarla en otros módulos

// Define the Users model
export const User = sequelize.define('users', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
  },
  first_name: {
    type: DataTypes.STRING(45),
    allowNull: false,
  },
  last_name: {
    type: DataTypes.STRING(45),
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING(45),
    allowNull: false,
  },
  phone: {
    type: DataTypes.STRING(45),
    allowNull: false,
  },
  comments: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  status: {
    type: DataTypes.STRING(10),
    allowNull: false,
    defaultValue: 'active',
  },
}, {
  // Define additional model options here, if needed
  tableName: 'users', // Make sure the table name matches the one in your SQL script
  timestamps: false, // Set to true if you want Sequelize to manage createdAt and updatedAt columns
});