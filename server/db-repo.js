const sqlite = require("sqlite3").verbose();
const config = require("./config");
const bcrypt = require("bcrypt");
const db_repo = {};

db_repo.connection = new sqlite.Database(config.DB_PATH, (err) => {
  if (err) {
    console.error("Error al conectar:", err.message);
  } else {
    console.log("Conectado a la base de datos!");
  }
});

db_repo.closeConnection = () => {
  db_repo.connection.close((err) => {
    if (err) return err;
  });
};

function runQuery(query, args = []) {
  return new Promise((resolve, reject) => {
    db_repo.connection.all(query, args, (err, rows) => {
      if (err) {
        console.error(err.message, err.cause, err.stack);
        return reject(err);
      }
      return resolve(rows);
    });
  });
}

function runCommand(query, args = []) {
  return new Promise((resolve, reject) => {
    db_repo.connection.run(query, args, function (err) {
      if (err) {
        console.error(
          "Error en runCommand:",
          err.message,
          err.cause,
          err.stack,
        );
        return reject(err);
      }
      const lastID = this.lastID;
      const changes = this.changes;
      return resolve({ lastID, changes });
    });
  });
}

db_repo.getTopUsers = async (limit = 3) => {
  if (typeof limit != "number") throw new Error("limit must be a number!");
  const topUsersQuery = `
                select u.id, u.username, u.avatar, u.user_description as "userDescription", count(r.id) as review_count from users u join reviews r on r.user=u.id 
                group by u.id order by review_count desc
                limit ?;
            `;
  try {
    const result = await runQuery(topUsersQuery, [limit]);
    return result;
  } catch (err) {
    throw new Error("query failed while fetching users!");
  }
};
db_repo.getReviews = async () => {
  const reviewsQuery = `
                  select r.id, b.title as "bookTitle", r.title as "reviewTitle", r.text as "reviewText", u.id as "reviewerId", u.username as "reviewerName", b.cover as "image"
                  from reviews r join books b on r.book=b.id join users u on u.id=r.user
                  order by b.year desc; 
              `;
  try {
    const result = await runQuery(reviewsQuery);
    return result;
  } catch (err) {
    return new Error("query failed while fetching reveiws!");
  }
};
db_repo.getTopBooks = async (limit = 3) => {
  if (typeof limit != "number") throw new Error("limit must be a number!");
  const topBooksQuery = `
                  select b.id, b.title, b.cover as "image", b.author, b.year, 
                  count(r.id) as "review_count"
                  from books b join reviews r on b.id=r.book
                  group by b.id order by review_count
                  limit ?;
             `;
  try {
    const result = await runQuery(topBooksQuery, [limit]);
    return result;
  } catch (err) {
    throw new Error("query failed while fetching books!");
  }
};
db_repo.getReviewById = async (id) => {
  if (typeof id != "number") throw new Error("id must be a number!");
  try {
    const result = await runQuery(
      `
            select r.id, b.title as "bookTitle", r.title as "reviewTitle", r.text as "reviewText", u.id as "reviewerId",
            u.username as "reviewerName", b.cover as "image"
            from reviews r join books b on r.book=b.id join users u on u.id=r.user
            where r.id=?;
        `,
      [id],
    );
    if (result.length == 0) throw new Error("Review not found!");
    return result[0];
  } catch (err) {
    if (
      err.message === "Review not found!" ||
      err.message === "id must be a number!"
    )
      throw err;
    throw new Error("error while fetching the data!");
  }
};
db_repo.getUserById = async (id) => {
  if (typeof id != "number") throw new Error("id must be a number!");
  try {
    const [usr, usrRevs] = await Promise.all([
      runQuery(
        `
            select u.id, u.username, u.avatar, u.user_description as "userDescription" from users u
            where u.id = ?;
            `,
        [id],
      ),
      runQuery(
        `
            select r.id, b.title as "bookTitle", r.title as "reviewTitle", r.text as "reviewText", u.id as "reviewerId",
            u.username as "reviewerName", b.cover as "image"
            from reviews r join books b on r.book=b.id join users u on u.id=r.user
            where u.id=?;
            `,
        [id],
      ),
    ]);
    console.log(usr);
    if (usr.length == 0) throw new Error("no usr found!");
    const result = {
      userReviews: usrRevs,
      ...usr[0],
    };
    return result;
  } catch (err) {
    if (
      err.message === "no usr found!" ||
      err.message === "id must be a number!"
    )
      throw err;
    console.error(err.message);
    throw new Error("error while fetching the data!");
  }
};
db_repo.getUserByNickName = async (name) => {
  if (typeof name != "string") throw new Error("id must be a string!");
  try {
    const usr = await runQuery(
      `
            select u.id, u.username, u.avatar, u.user_description as "userDescription" from users u
            where u.username = ?;
            `,
      [name],
    );
    console.log(usr);
    if (usr.length == 0) throw new Error("no usr found!");
    const result = usr[0];
    return result;
  } catch (err) {
    if (
      err.message === "no usr found!" ||
      err.message === "id must be a string!"
    )
      throw err;
    console.error(err.message);
    throw new Error("error while fetching the data!");
  }
};

db_repo.getBookById = async (id) => {
  try {
    if (typeof id != "number") throw new Error("id must be a number!");
    const [book, bookRevs] = await Promise.all([
      runQuery(
        `
            select b.id, b.title, b.cover as "image", b.author, b.year
            from books b where b.id = ?;
            `,
        [id],
      ),
      runQuery(
        `
            select r.id, b.title as "bookTitle", r.title as "reviewTitle", r.text as "reviewText", u.id as "reviewerId",
            u.username as "reviewerName", b.cover as "image"
            from reviews r join books b on r.book=b.id join users u on u.id=r.user
            where b.id=?;
            `,
        [id],
      ),
    ]);
    const result = {
      reviews: bookRevs,
      ...book[0],
    };
    if (book.length == 0) throw new Error("no book found!");
    return result;
  } catch (err) {
    if (
      err.message === "no book found!" ||
      err.message === "id must be a number!"
    )
      throw err;
    throw new Error("error while fetching the data!");
  }
};

db_repo.getBooks = async () => {
  try {
     const result = await runQuery(
        `
            select id, title from books;
        `
      )
     return result;
  } catch (err) {
    throw err;
  }
}

db_repo.createUser = async (name, pass) => {
  try {
    if (!name || !pass) throw new Error("Usuario o contraseña inválidos");
    const Pass = pass.toString();
    const Name = name.toString();

    // Verificar si el usuario ya existe
    const repeated = await runQuery(
      `SELECT id FROM users WHERE username = ?;`,
      [Name],
    );

    if (repeated.length > 0) {
      throw new Error("user already exists!");
    }

    const hashedPass = await bcrypt.hash(Pass, 7);
    const result = await runCommand(
      `INSERT INTO users (username, password) VALUES (?, ?);`,
      [Name, hashedPass],
    );

    if (!result || !result.lastID) {
      throw new Error("Error al crear el usuario");
    }

    return result.lastID;
  } catch (err) {
    console.error("Error en createUser:", err);
    if (err.message === "user already exists!") throw err;
    throw new Error("Error al crear el usuario");
  }
};

db_repo.updateUser = async (id, data) => {

  try {
    const props = Object.entries(data).filter((prop)=>{
      return prop[1] !== null && prop[1] !== undefined
    })
  
    if(props.length === 0) throw new Error("no se encontraron propiedades validas que cambiar");

    const set = props.map((prop)=>{
      return `${prop[0]} = ?`
    }).join(", ");

    const query = props.map((prop)=>prop[1]);
  
    console.log("SET",set,"QUERY", query);

    const result = await runCommand(
        `UPDATE users SET ${set} where id = ?;`,
        [...query, id],
      );
  } catch (error) {
    throw error
  }
}

db_repo.checkPassword = async (name, pass) => {
  try {
    if (!name || !pass) throw new Error("Usuario o contraseña inválidos");
    const Name = name.toString();
    const Pass = pass.toString();

    const users = await runQuery(
      `SELECT password FROM users WHERE username = ?;`,
      [Name],
    );

    if (!users || users.length === 0) {
      throw new Error("Usuario no encontrado");
    }

    const hashedPass = users[0].password;
    if (!hashedPass) {
      throw new Error("Usuario no registrado o contraseña no establecida");
    }

    const result = await bcrypt.compare(Pass, hashedPass);
    return result;
  } catch (err) {
    console.error(err);
    throw new Error("Error al verificar usuario y contraseña");
  }
};

db_repo.setToken = async (user, token, expiration) => {
  if (!user || !token || !expiration) {
    throw new Error("Usuario o token inválidos");
  }
  try {
    // Obtener el ID del usuario
    const userResult = await runQuery(
      `SELECT id FROM users WHERE username = ?;`,
      [user],
    );

    if (!userResult || userResult.length === 0) {
      throw new Error("Usuario no encontrado");
    }

    const userId = userResult[0].id;

    await runCommand(
      `INSERT INTO sessions (token, user, expiration) VALUES (?, ?, ?);`,
      [token, userId, expiration],
    );
    return true;
  } catch (err) {
    console.error("Error en setToken:", err);
    return false;
  }
};

db_repo.isTokenValid = async (token) => {
  if (!token) throw new Error("invalid token provided!");
  try {
    const session = await runQuery(
      `
            select user as "userId", expiration, active from sessions
            where token = ?;
            `,
      [token],
    );
    if (!session[0]) throw new Error("token not found!");
    const currentTime = new Date().toISOString();
    if (session[0].expiration < currentTime) throw new Error("token expired!");
    if (!session[0].active) throw new Error("token revoked!");
    return session[0].userId;

  } catch (err) {
    if (err.message === "token not found!" || err.message === "token expired!")
      throw err;
    throw new Error("auth failed!");
  }
};

db_repo.clearToken = async (token) => {
  if (!token) throw new Error("invalid token provided!");
  try {
    await runCommand(
      `
            update sessions
            set active=0
            where token = ?
            `,
      [token],
    );
  } catch (err) {
    throw new Error("error while clearing token!");
  }
};

db_repo.postReview = async (userId, bookId, title, text) => {
  if (title.toString().length < 3) throw new Error("the title is too short!");
  if (text.toString().length < 15)
    throw new Error("the content must be at least 15 characters long!");
  try {
    const user = await db_repo.getUserById(userId);
    if (user.length === 0) throw new Error("invalid user!");
    const result = await runCommand(
      `
          insert into reviews (user, book, title, text)
          values (?,?,?,?)
          `,
      [userId, bookId, title, text],
    );
    return result;
  } catch (err) {
    if (err.message == "invalid user!") throw err;
    console.error(err.message);
    throw new Error("failed to post a new review");
  }
};

module.exports = db_repo;
