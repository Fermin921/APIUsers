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

const MySqlConnection = {host : HOST, user : USER, password : PASSWORD, database: DATABASE,port : PORTE, }

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
*     summary: Obtener la lista de usuarios.
*     description: Obtiene la lista completa de usuarios desde la base de datos.
*     tags:
*       - usuarios
*     responses:
*       200:
*         description: Operación exitosa. Devuelve la lista de usuarios.
*         content:
*           application/json:
*             example:
*               - Tipo: 1
*                 Nombre: "Usuario1"
*                 Contraseña: "contraseña1"
*               - Tipo: 2
*                 Nombre: "Usuario2"
*                 Contraseña: "contraseña2"
*               # ... (otros usuarios)
*       401:
*         description: Token inválido. No se proporcionó o no es válido.
*         content:
*           application/json:
*             example:
*               mensaje: "Token inválido"
*       500:
*         description: Error interno del servidor. No se pudieron obtener los datos.
*         content:
*           application/json:
*             example:
*               mensaje: "Mensaje de error específico del servidor"
* 
* /usuarios/{id}:
*   get:
*       tags:
*           - usuarios
*       summary: Consultar un usuario mediante su id 
*       description : Devuelve los datos del usuario mediante su id 
*       parameters:
*           - name: id
*             in: path
*             description: ID del usuario
*             required: true
*             schema:
*               type: integer
*               format: int64
*       responses:
*          200:
*              description: Successful operation
*
* /insertar:
*   post:
*     summary: Insertar un nuevo usuario.
*     description: Inserta un nuevo usuario en la base de datos.
*     tags:
*       - usuarios
*     requestBody:
*       required: true
*       content:
*         application/json:
*           schema:
*             type: object
*             properties:
*               Tipo:
*                 type: integer
*                 description: Tipo de usuario.
*               Nombre:
*                 type: string
*                 description: Nombre del usuario.
*               Contraseña:
*                 type: string
*                 description: Contraseña del usuario.
*     responses:
*       200:
*         description: Datos insertados correctamente.
*         content:
*           application/json:
*             example:
*               message: "Datos insertados correctamente"
*       500:
*         description: Error interno del servidor. No se pudieron insertar los datos.
*         content:
*           application/json:
*             example:
*               message: "Error al insertar datos"
* /usuario/{Tipo}:
*   put:
*     summary: "Actualiza un usuario por Tipo"
*     description: "Actualiza la información de un usuario en la base de datos."
*     tags:
*       - usuarios
*     parameters:
*       - in: path
*         name: Tipo
*         description: "Tipo del usuario que se va a actualizar."
*         required: true
*         schema:
*           type: string
*     requestBody:
*       required: true
*       content:
*         application/json:
*           schema:
*             type: object
*             properties:
*               Usuario:
*                 type: string
*                 description: "Nuevo nombre de usuario."
*               Contraseña:
*                 type: string
*                 description: "Nueva contraseña del usuario."
*     responses:
*       200:
*         description: "OK. La actualización se realizó con éxito."
*         content:
*           application/json:
*             example:
*               mensaje: "ACTUALIZADO"
*       500:
*         description: "Error interno del servidor."
*         content:
*           application/json:
*             example:
*               mensaje: "Error SQL."
* /usuarios/{Tipo}:
*   delete:
*     summary: "Elimina un usuario por Tipo"
*     description: "Elimina un usuario de la base de datos según el Tipo proporcionado."
*     tags:
*       - usuarios
*     parameters:
*       - in: path
*         name: Tipo
*         description: "Tipo del usuario que se va a eliminar."
*         required: true
*         schema:
*           type: string
*     responses:
*       200:
*         description: "OK. El usuario ha sido eliminado."
*         content:
*           application/json:
*             example:
*               mensaje: "Registro Eliminado"
*       404:
*         description: "No se encontró el usuario a eliminar."
*         content:
*           application/json:
*             example:
*               mensaje: "Registro No Eliminado"
*       500:
*         description: "Error interno del servidor."
*         content:
*           application/json:
*             example:
*               mensaje: "Error SQL."
*/
app.get("/usuarios", async (req, res) => {    
    try {
        const token = req.token;

            const conn = await mysql.createConnection(MySqlConnection);
            const [rows, fields] = await conn.query('SELECT * from usuario');
            res.json(rows);
        
            //console.log("NO diste bien la key bro");
            //res.status(401).json({ mensaje: 'Token inválido' });
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
   const[rows,fields]=await conn.query('SELECT * from usuario where Tipo='+req.params.id);
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

        const [rows, fields] = await conn.execute('INSERT INTO usuario (Tipo, Usuario, Contraseña) VALUES (?, ?, ?)', [Tipo, Nombre, Contraseña]);

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
        await conn.query('UPDATE usuario SET Usuario = ?, Contraseña = ? WHERE Tipo = ?', [Usuario, Contraseña, req.params.Tipo]);
        res.json({ mensaje: "ACTUALIZADO" });
    } catch (err) {
        res.status(500).json({ mensaje: err.sqlMessage });
    }
});

app.delete("/usuarios/:Tipo", async (req, res) => {    
    try {
        const conn = await mysql.createConnection(MySqlConnection);
        const [rows, fields] = await conn.query('DELETE FROM usuario WHERE Tipo = ?', [req.params.Tipo]);

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



app.listen(PORTE,()=>{
    console.log("Servidor express escuchando en el puerto  "+ PORTe);
});

