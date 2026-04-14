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

  res.cookie("token", token, {
    httpOnly: true,
    secure: false,
    maxAge: 3600000,
  });

  return res.status(200).json({
    message: `Bienvenido/a, ${usuarioEncontrado.username}!`,
  });
});

app.get("/perfil", verificarToken, (req, res) => {
  return res.status(200).json({
    message: "Acceso autorizado a ruta protegida.",
    usuario: {
      id: req.usuario.id,
      username: req.usuario.username,
    },
  });
});

app.post("/logout", (req, res) => {
  res.clearCookie("token");
  return res.status(200).json({
    message: "Sesión cerrada correctamente.",
  });
});

app.get("/", (req, res) => {
  res.send("Servidor Express con JWT funcionando ✅");
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
