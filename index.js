// Importación de librerías necesarias
const express = require("express"); // Framework para crear el servidor
const jwt = require("jsonwebtoken"); // Para generar y validar tokens JWT
const cookieParser = require("cookie-parser"); // Permite leer cookies
const users = require("./users"); // Usuarios ficticios
const verificarToken = require("./middleware/authMiddleware"); // Middleware de autenticación

// Configuración básica del servidor
const app = express();
const PORT = 3000;
const SECRET_KEY = "mi_clave_secreta_super_segura";

// Middlewares globales
app.use(express.json()); // Permite recibir datos en formato JSON
app.use(cookieParser()); // Permite manejar cookies

// ==========================
//        RUTA LOGIN
// ==========================
// Permite autenticar al usuario y generar un token JWT
app.post("/login", (req, res) => {
  const { username, password } = req.body;

// Validar que se envíen los datos
  if (!username || !password) {
    return res.status(400).json({
      message: "Por favor proporciona usuario y contraseña.",
    });
  }

  // Buscar usuario en el arreglo
  const usuarioEncontrado = users.find(
    (u) => u.username === username && u.password === password
  );

  // Si no existe, retornar error 401
  if (!usuarioEncontrado) {
    return res.status(401).json({
      message: "Credenciales incorrectas. No autorizado.",
    });
  }

  // Generar token JWT con duración de 1 hora
  const token = jwt.sign(
    { id: usuarioEncontrado.id, username: usuarioEncontrado.username },
    SECRET_KEY,
    { expiresIn: "1h" }
  );

  //Enviar token como cookie segura
  res.cookie("token", token, {
    httpOnly: true, //No accesible desde JS (protege contra xss)
    secure: false, //En produccion deberia ser true (HTTPS)
    maxAge: 3600000, //1 Hora
  });

//Respuesta exitosa
  return res.status(200).json({
    message: `Bienvenido/a, ${usuarioEncontrado.username}!`,
  });
});

// ==========================
//  RUTA PROTEGIDA (/perfil)
// ==========================
// Solo accesible si el token JWT es válido

app.get("/perfil", verificarToken, (req, res) => {
  return res.status(200).json({
    message: "Acceso autorizado a ruta protegida.",
    usuario: {
      id: req.usuario.id,
      username: req.usuario.username,
    },
  });
});

// ==========================
//        RUTA LOGOUT
// ==========================
// Permite cerrar sesión eliminando la cookie del token
app.post('/logout', (req, res) => {
  console.log("Usuario cerró sesión"); // Registro en consola

  // Elimina la cookie del navegador
  res.clearCookie('token');

  return res.status(200).json({
    message: 'Logout realizado correctamente.'
  });
});

// ==========================
//     RUTA PRINCIPAL
// ==========================
// Ruta base del servidor
app.get("/", (req, res) => {
  res.send("Servidor Express con JWT funcionando ✅");
});

// ==========================
//       RUTA SESIÓN
// ==========================
// Verifica si el usuario tiene una sesión activa
app.get("/sesion", (req, res) => {
  const token = req.cookies.token;

  // Si no hay token no se inicia sesión
  if (!token) {
    return res.status(401).json({
      message: "No hay sesión activa. Usuario no autenticado."
    });
  }

  // Si existe token la sesión se activa
  return res.status(200).json({
    message: "Sesión activa. Usuario autenticado correctamente."
  });
});

// ==========================
//    INICIO DEL SERVIDOR
// ==========================
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
