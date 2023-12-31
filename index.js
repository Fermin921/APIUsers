const express=require('express');
const morgan = require('morgan');
const fs=require('fs');
const path=require('path');
const mysql =require('mysql2/promise');
const bearerToken = require('express-bearer-token'); 
const app=express();
const cors = require('cors');
var accessLogStream = fs.createWriteStream(path.join(__dirname,'access.log'),{flags:'a'});
const swaggerUI = require('swagger-ui-express');
const swaggerjsDoc= require('swagger-jsdoc');
app.use(morgan('combined',{stream:accessLogStream}));
app.use(cors());
app.use(express.json());
app.use(bearerToken());

const multer = require('multer');
const folder = path.join(__dirname+'/archivos/');
const storage = multer.diskStorage({
    destination : function(req,file,cb) {cb(null,folder)},
    filename: function (req,file,cb) {cb(null,file.originalname)}
});
const upload = multer({storage:storage})
app.use(express.urlencoded({extended:true}));
app.use(upload.single('archivo'));
const PORT = process.env.PORT || 8080
const PORTE = process.env.MYSQLPORT ;
const HOST = process.env.MYSQLHOST || 'localhost';
const USER = process.env.MYSQLUSER || 'root';
const PASSWORD = process.env.MYSQLPASSWORD || '';
const DATABASE = process.env.MYSQL_DATABASE || 'login';
const URL = process.env.URL

const MySqlConnection = {host : HOST, user : USER, password : PASSWORD, database: DATABASE,port : PORTE}

const data = fs.readFileSync(path.join(__dirname,'./Options.json'),{ encoding: 'utf8', flag: 'r' });
const obj = JSON.parse(data)

const swaggerOptions = {
    definition: obj,
    apis: [`${path.join(__dirname,"./index.js")}`],
}

app.post('/RecibirArchivo',(req,res)=>{
    console.log(`se recibio el archivo: ${req.file.originalname}`);
    console.log('se recibio el formulario:'+JSON.stringify(req.body));
    res.json(req.body);
})
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended:true}));
app.post('/Recibir', (req, res) => {
    const { tipo, usuario, contraseña } = req.body;
    res.json({ mensaje: 'Datos recibidos exitosamente \n Tipo: '+tipo + '\n Usuario: ' + usuario + '\ Contraseña: '+contraseña });
});
/**
 * @swagger
 * /usuarios:
 *   get:
 *     summary: Obtiene la lista de usuarios.
 *     description: Retorna la lista completa de usuarios almacenados en la base de datos.
 *     tags:
 *       - Usuarios
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Éxito. Retorna la lista de usuarios.
 *         content:
 *           application/json:
 *             example:
 *               - id: 1
 *                 nombre: Usuario1
 *                 email: usuario1@example.com
 *               - id: 2
 *                 nombre: Usuario2
 *                 email: usuario2@example.com
 *       500:
 *         description: Error interno del servidor.
 *         content:
 *           application/json:
 *             example:
 *               mensaje: Error en la base de datos.
 */

/**
 * @swagger
 * /ruta-protegida:
 *   get:
 *     summary: Ruta protegida que requiere autenticación básica.
 *     description: Ruta que solo permite el acceso si se proporcionan credenciales de autenticación básica.
 *     tags:
 *       - Usuarios
 *     security:
 *       - BasicAuth: []
 *     responses:
 *       200:
 *         description: Éxito. Acceso permitido.
 *         content:
 *           text/plain:
 *             example: ¡Acceso permitido!
 *       401:
 *         description: No autorizado. Las credenciales de autenticación son incorrectas.
 *         content:
 *           text/plain:
 *             example: Acceso no autorizado
 */

/**
 * @swagger
 * /usuarios/{id}:
 *   get:
 *     summary: Obtiene un usuario por ID.
 *     description: Retorna los detalles de un usuario específico según el ID proporcionado.
 *     tags:
 *       - Usuarios
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID del usuario a consultar.
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Éxito. Retorna los detalles del usuario.
 *         content:
 *           application/json:
 *             example:
 *               id: 1
 *               nombre: Usuario1
 *               email: usuario1@example.com
 *       404:
 *         description: No encontrado. El usuario con el ID proporcionado no existe.
 *         content:
 *           application/json:
 *             example:
 *               mensaje: Usuario no encontrado.
 *       500:
 *         description: Error interno del servidor.
 *         content:
 *           application/json:
 *             example:
 *               mensaje: Error en la base de datos.
 */

/**
 * @swagger
 * /insertar:
 *   post:
 *     summary: Inserta un nuevo usuario.
 *     description: Inserta un nuevo usuario en la base de datos con la información proporcionada.
 *     tags:
 *       - Usuarios
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             Tipo: 1
 *             Nombre: NuevoUsuario
 *             Contraseña: NuevaContraseña
 *     responses:
 *       200:
 *         description: Éxito. Datos insertados correctamente.
 *         content:
 *           application/json:
 *             example:
 *               message: Datos insertados correctamente.
 *       500:
 *         description: Error interno del servidor.
 *         content:
 *           application/json:
 *             example:
 *               message: Error al insertar datos.
 */

/**
 * @swagger
 * /usuario/{Tipo}:
 *   put:
 *     summary: Actualiza un usuario por Tipo.
 *     description: Actualiza la información de un usuario específico según el Tipo proporcionado.
 *     tags:
 *       - Usuarios
 *     parameters:
 *       - in: path
 *         name: Tipo
 *         required: true
 *         description: Tipo del usuario a actualizar.
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             Usuario: UsuarioActualizado
 *             Contraseña: ContraseñaActualizada
 *     responses:
 *       200:
 *         description: Éxito. Usuario actualizado correctamente.
 *         content:
 *           application/json:
 *             example:
 *               message: Usuario actualizado correctamente.
 *       500:
 *         description: Error interno del servidor.
 *         content:
 *           application/json:
 *             example:
 *               message: Error al actualizar el usuario.
 */
/**
 * @swagger
 * /usuarios/{Tipo}:
 *   delete:
 *     summary: Elimina un usuario por Tipo.
 *     description: Elimina un usuario de la base de datos según el Tipo proporcionado.
 *     tags:
 *       - Usuarios
 *     parameters:
 *       - in: path
 *         name: Tipo
 *         required: true
 *         description: Tipo del usuario a eliminar.
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Éxito. Registro eliminado correctamente.
 *         content:
 *           application/json:
 *             example:
 *               mensaje: Registro Eliminado
 *       404:
 *         description: No encontrado. El usuario con el Tipo proporcionado no existe.
 *         content:
 *           application/json:
 *             example:
 *               mensaje: Registro No Eliminado
 *       500:
 *         description: Error interno del servidor.
 *         content:
 *           application/json:
 *             example:
 *               mensaje: Mensaje de error específico en la base de datos.
 */
app.get("/usuarios", async (req, res) => {    
    try {
        const token = req.token;

            const conn = await mysql.createConnection(MySqlConnection);
            const [rows, fields] = await conn.query('SELECT * from Usuarios');
            res.json(rows);
        
    } catch (err) {
        res.status(500).json({ mensaje: err.sqlMessage });
    }
});

const basicAuth = require('express-basic-auth');

// Configurar el middleware de autenticación básica
const auth = basicAuth({
    users: { 'Fermin921': '1234' }, // 
    challenge: true, // 
    unauthorizedResponse: 'Acceso no autorizado', // 
});

  // Ruta protegida que requiere autenticación
app.get('/ruta-protegida', auth, (req, res) => {
    res.send('¡Acceso permitido!');
});

app.get("/usuarios/:id",async(req,res)=>{    
console.log(req.params.id)
const conn=await mysql.createConnection(MySqlConnection)
   const[rows,fields]=await conn.query('SELECT * from Usuarios where ID='+req.params.id);
if(rows.length==0)
{
    res.status(484).json({mensaje:"Usuario No existe"});
}else{
    res.json(rows);
}
});

app.post('/insertar', async (req, res) => {
    try {
        const conn = await mysql.createConnection(MySqlConnection);

        const { Tipo, Nombre, Contraseña } = req.body;

        const [rows, fields] = await conn.execute('INSERT INTO Usuarios (ID, Usuario, Contraseña) VALUES (?, ?, ?)', [Tipo, Nombre, Contraseña]);

        res.json({ message: 'Datos insertados correctamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al insertar datos' });
    }
});

app.put("/usuario/:Tipo", async (req, res) => {
    try {
        const conn = await mysql.createConnection(MySqlConnection);
        const { Usuario, Contraseña } = req.body;
        console.log(Usuario + Contraseña);
        console.log(req.body);
        await conn.query('UPDATE Usuarios SET Usuario = ?, Contraseña = ? WHERE ID = ?', [Usuario, Contraseña, req.params.Tipo]);
        res.json({ mensaje: "ACTUALIZADO" });
    } catch (err) {
        res.status(500).json({ mensaje: err.sqlMessage });
    }
});

app.delete("/usuarios/:Tipo", async (req, res) => {    
    try {
        const conn = await mysql.createConnection(MySqlConnection);
        const [rows, fields] = await conn.query('DELETE FROM Usuarios WHERE ID = ?', [req.params.Tipo]);

        if (rows.affectedRows == 0) {
            res.json({ mensaje: "Registro No Eliminado" });
        } else {
            res.json({ mensaje: "Registro Eliminado" });
        }

    } catch (err) {
        res.status(500).json({ mensaje: err.sqlMessage });
    }
});

const swaggerDocs = swaggerjsDoc(swaggerOptions);

app.use("/api-docs",swaggerUI.serve,swaggerUI.setup(swaggerDocs));
app.get("/options",(req,res)=>
{
    res.json(data)
})

app.use("/api-docs-json",(req,res)=>{
    res.json(swaggerDocs);
});



app.listen(PORT,()=>{
    console.log("Servidor express escuchando en el puerto  "+ PORT);
});

