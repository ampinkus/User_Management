import express from 'express';
import exphbs from 'express-handlebars';
import __dirname from './utils.js';
import path from 'path';
// importo la instancia sequelize para poder comunicarme con la base de datos que cree en el archivo database
import {sequelize} from "./database/database.js";
// importo las rutas de project y task. Tengo que usar el .js porque son archivos
import userRoutes from './routes/user.routes.js';

const app = express();
// create the port variable with environment and 4000 as default
const port = process.env.PORT || 4000;

// middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Estructura de configuración para el motor de plantillas
// In this line of code, you are configuring the Express application (app) to use Handlebars as the template engine
const handlebars = exphbs.create({ extname: '.hbs',}); // Specify the '.hbs' extension
app.engine('.hbs', handlebars.engine);
app.set('view engine', '.hbs');

// indicamos el directorio views donde se almacenan las plantillas
app.set('views', path.resolve(__dirname, './views')); // va con ./ porque es una carpeta
// archivos estáticos
app.use('/', express.static(__dirname + '/public')); // va con / sin punto 

// quiero que app use las rutas
app.use(userRoutes);

// renderizamos el archivo de handlebars que en nuestro caso es el home.hbs
app.get('/', (req, res) => {
    res.render('home');
})

// creo una función main que sea asíncrona.
async function main() { 
    try {
     // para sincronizar las bases de datos con sequelize y quedarse escuchando en el puerto 4000   
    await sequelize.sync({alter:true});// apply the changes to the table without dropping the old one
    // await sequelize.sync({force:false});// During development to avoid to modify the tables
    app.listen(port);
    console.log("Server is running on port 4000");   
    }catch(error) {
        console.error('Unable to connect to the database:',error);  
    }
}

main();

// hasta el minuto 26