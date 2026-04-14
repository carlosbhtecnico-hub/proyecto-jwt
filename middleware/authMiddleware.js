const jwt = require("jsonwebtoken");

const SECRET_KEY = "mi_clave_secreta_super_segura";

function verificarToken(req, res, next) {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({
      message: "Acceso denegado. No hay token de sesión.",
    });
  }

  try {
    const datosUsuario = jwt.verify(token, SECRET_KEY);
    req.usuario = datosUsuario;
    next();
  } catch (error) {
    return res.status(401).json({
      message: "Token inválido o expirado. Por favor inicia sesión nuevamente.",
    });
  }
}

module.exports = verificarToken;
