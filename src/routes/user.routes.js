// tengo que importar e instanciar la función router
import { Router } from 'express';
// tengo que importar los controladores de las rutas desde user.controller.js
import { getUsers, findUser, form, create, edit, update, deactivateUser, viewUser,} from '../controllers/user.controller.js';

//Creo una instancia de la clase Router
const router = Router();

// creo las rutas
// obtener los usuarios
router.get('/',getUsers) // llamo la función getProject
router.post('/',findUser)  // to use the find form
router.get('/adduser', form);  
router.post('/adduser', create);
router.get('/edituser/:id', edit);
router.post('/edituser/:id', update);
router.get('/:id',deactivateUser);
router.get('/viewuser/:id', viewUser);



// tengo que exportar las rutas
export default router;