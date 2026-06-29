const express = require("express");
const cors = require("cors");
const db_repo = require("./db-repo");
const config = require("./config");
const cookieParser = require("cookie-parser");
const uuid = require("uuid");
const app = express();
const path = require("path");
const dist = path.join(__dirname, "/../", "/dist");

console.log("Iniciando servidor...");

app.use(express.static(dist));

// Middleware para debugging de todas las peticiones
app.use((req, res, next) => {
  console.log("\n--- Nueva petición ---");
  console.log("Timestamp:", new Date().toISOString());
  console.log("Método:", req.method);
  console.log("URL:", req.url);
  console.log("Headers:", JSON.stringify(req.headers, null, 2));
  console.log("Body:", req.body);
  console.log("Cookies:", req.cookies);
  console.log("-------------------\n");
  next();
});

// Middlewares básicos
app.use(express.json());
app.use(cookieParser());

// Middleware para CORS y preflight requests
app.use((req, res, next) => {
  console.log("Middleware CORS - Método:", req.method);
  console.log("Headers recibidos:", req.headers);

  // Configurar CORS headers
  const origin = req.headers.origin;
  console.log("Origin de la petición:", origin);

  res.header("Access-Control-Allow-Origin", "http://localhost:5173");
  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization",
  );
  res.header("Access-Control-Max-Age", "86400"); // 24 horas

  // Manejar preflight requests
  if (req.method === "OPTIONS") {
    console.log("Respondiendo a OPTIONS request con 204");
    console.log("Headers de respuesta:", res.getHeaders());
    res.status(204).end();
    return;
  }

  next();
});

// Middleware para logging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

async function authenticate(req, res, next) {
  try {
    const token = req.cookies["session_token"];
    if (!token) {
      return res.status(401).json({ error: "No autenticado" });
    }
    const usr_id = await db_repo.isTokenValid(token);
    req.usr_id = usr_id;
    next();
  } catch (err) {
    return res.status(401).json({ error: err.message });
  }
}

app.post("/api/register", async (req, res) => {
  console.log("Register endpoint - Body:", req.body);
  console.log("Register endpoint - Cookies:", req.cookies);
  try {
    const { username, pass } = req.body;
    if (!username || !pass) {
      return res.status(400).json({ error: "Falta usuario o contraseña" });
    }
    if (pass.length < 8) {
      return res
        .status(400)
        .json({ error: "La contraseña debe tener al menos 8 caracteres" });
    }
    if (pass.length > 32) {
      return res
        .status(400)
        .json({ error: "La contraseña debe tener máximo 32 caracteres" });
    }
    if (username.length > 16) {
      return res
        .status(400)
        .json({ error: "El usuario debe tener máximo 16 caracteres" });
    }
    if (username.length < 4) {
      return res
        .status(400)
        .json({ error: "El usuario debe tener al menos 4 caracteres" });
    }

    const userId = await db_repo.createUser(username, pass);
    if (!userId) {
      return res.status(500).json({ error: "Error al crear el usuario" });
    }

    const token = uuid.v4();
    const expiration = new Date(Date.now() + 1000 * 60 * 60);
    const isTokenSet = await db_repo.setToken(
      username,
      token,
      expiration.toISOString(),
    );

    if (!isTokenSet) {
      return res.status(500).json({ error: "Error al iniciar sesión" });
    }

    res
      .cookie("session_token", token, {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
        path: "/",
        maxAge: 3600000, // 1 hora
      })
      .json({ username, isTokenSet });
  } catch (err) {
    if (err.message.includes("user already exists")) {
      return res.status(400).json({ error: "El usuario ya existe" });
    }
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/login", async (req, res) => {
  console.log("Login endpoint - Body:", req.body);
  console.log("Login endpoint - Cookies:", req.cookies);
  try {
    const { username, pass } = req.body;
    if (!username || !pass) {
      return res.status(400).json({ error: "Falta usuario o contraseña" });
    }
    if (pass.length < 8) {
      return res
        .status(400)
        .json({ error: "La contraseña debe tener al menos 8 caracteres" });
    }
    if (pass.length > 32) {
      return res
        .status(400)
        .json({ error: "La contraseña debe tener máximo 32 caracteres" });
    }
    if (username.length > 16) {
      return res
        .status(400)
        .json({ error: "El usuario debe tener máximo 16 caracteres" });
    }
    if (username.length < 4) {
      return res
        .status(400)
        .json({ error: "El usuario debe tener al menos 4 caracteres" });
    }

    let user;
    const validated = await db_repo.checkPassword(username, pass);
    if (!validated) {
      return res
        .status(401)
        .json({ error: "Usuario o contraseña incorrectos" });
    } else {
      user = await db_repo.getUserByNickName(username);
    }

    const token = uuid.v4();
    const expiration = new Date(Date.now() + 1000 * 60 * 60);
    const isTokenSet = await db_repo.setToken(
      username,
      token,
      expiration.toISOString(),
    );

    if (!isTokenSet) {
      return res.status(500).json({ error: "Error al iniciar sesión" });
    }

    res
      .cookie("session_token", token, {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
        path: "/",
        maxAge: 3600000, // 1 hora
      })
      .json({ username, isTokenSet, user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/home", async (req, res) => {
  try {
    const [usr, rev, bk] = await Promise.all([
      db_repo.getTopUsers(3),
      db_repo.getReviews(),
      db_repo.getTopBooks(3),
    ]);
    const result = {
      topUsers: usr,
      reviews: rev,
      topBooks: bk,
    };
    res.json(result);
  } catch (err) {
    res.json({ error: err.message });
  }
});

app.get("/api/review/:id", async (req, res) => {
  try {
    const revId = parseInt(req.params.id.toString());
    const result = await db_repo.getReviewById(revId);
    res.json(result);
  } catch (err) {
    res.json({ error: err.message });
  }
});

app.post("/api/review", async (req, res) => {
  try {
    const user = parseInt(req.body.user.toString());
    const book = parseInt(req.body.book_id.toString());
    const title = req.body.title.toString();
    const content = req.body.content.toString();
    await db_repo.postReview(user, book, title, content);
    return res.json({ ok: true, msg: "review creada con exito" });
  } catch (err) {
    res.json({ error: err.message });
  }
});

app.post("/api/", (req, res) => {
  const review = req.body;
  db_repo.res.status(201).json(newNote);
});

app.get("/api/user/:id", async (req, res) => {
  try {
    const usrId = parseInt(req.params.id.toString());
    const result = await db_repo.getUserById(usrId);
    res.json(result);
  } catch (err) {
    res.json({ error: err.message });
  }
});

app.put("/api/user/:id", async (req, res) => {
  try {
    const token = req.cookies['session_token'];
    console.log(token)
    const user = parseInt(req.params.id.toString());
    const tokenUser = await db_repo.isTokenValid(token);
    console.log("UPDATE USER -----------------------------------",token, user, tokenUser);
    if (!tokenUser || tokenUser !== user){
      throw new Error('token invalido!', token, user, tokenUser)
    }
    const newUsername = req.body.username?.toString();
    const newPassword = req.body.password?.toString();
    const newUserDescription = req.body.userDescription?.toString();
    const userData = {username: newUsername, password: newPassword, user_description: newUserDescription};
    await db_repo.updateUser(user, userData);
    return res.json({ ok: true, msg: "update exitoso!" });
  } catch (error) {
    res.json({ error: error.message });
  }
});

app.get("/api/book/:id", async (req, res) => {
  try {
    const bookId = parseInt(req.params.id.toString());
    const result = await db_repo.getBookById(bookId);
    res.json(result);
  } catch (err) {
    res.json({ error: err.message });
  }
});

app.get("/api/books", async (req, res) => {
  try {
    const result = await db_repo.getBooks();
    res.json(result);
  } catch (err) {
    res.json({ error: err.message });
  }
});

app.get("*", (req, res) => {
  res.sendFile(dist + "/index.html");
});

// Manejador de errores 404
app.use((req, res, next) => {
  res
    .status(404)
    .json({ error: `Ruta ${req.method} ${req.path} no encontrada` });
});

// Manejador de errores general
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Error interno del servidor" });
});

process.on("SIGINT", () => {
  db_repo.closeConnection((err) => {
    if (err) {
      console.error("Error al cerrar:", err.message);
    } else {
      console.log("Conexión cerrada correctamente");
    }
    process.exit(0);
  });
});

// Iniciar el servidor
const PORT = config.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
  console.log("Rutas disponibles:");
  console.log("POST /api/register - Registro de usuarios");
  console.log("POST /api/login - Inicio de sesión");
  console.log("GET /api/home - Página principal");
  console.log("GET /api/review/:id - Obtener reseña");
  console.log("GET /api/user/:id - Obtener usuario");
  console.log("GET /api/book/:id - Obtener libro");
});
