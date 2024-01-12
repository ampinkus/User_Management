// donde hacemos las importaciones de módulos para usar los directorios
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/*
console.log(__filename); // el directorio junto con el nombre del archivo
console.log(path.basename(__filename)); // el nombre del archivo
console.log(__dirname); // el directorio del archivo
*/

export default __dirname;
