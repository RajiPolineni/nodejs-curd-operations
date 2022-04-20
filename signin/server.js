const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const bcrypt = require("bcrypt");
const path = require("path");
const jwt = require("jsonwebtoken");

const app = express();
app.use(express.json());
let db = null;

initializeDbConnection = async () => {
  try {
    db = await open({
      filename: path.join(__dirname, "database.db"),
      driver: sqlite3.Database,
    });
  } catch (e) {
    console.log(e.message);
    process.exit(1);
  }
};
initializeDbConnection();

app.post("/register/", async (req, res) => {
  const { username, email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const selectUserQuery = `SELECT * FROM users WHERE username = '${username}';`;
  const dbUser = await db.get(selectUserQuery);
  if (dbUser === undefined) {
    const createUserQuery = `
      INSERT INTO 
        users (username, email, password) 
      VALUES 
        (
          '${username}', 
          '${email}',
          '${hashedPassword}'
        );`;
    const dbResponse = await db.run(createUserQuery);
    const newUserId = dbResponse.lastID;
    res.send(`Created new user with ${newUserId}`);
  } else {
    res.status(400);
    res.send("User already exists");
  }
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const selectUserQuery = `SELECT * FROM users WHERE username = '${username}'`;
  const dbUser = await db.get(selectUserQuery);
  if (dbUser === undefined) {
    res.status(400);
    res.send("Invalid User");
  } else {
    const isPasswordMatched = await bcrypt.compare(password, dbUser.password);
    if (isPasswordMatched === true) {
      const payload = {
        username: username,
      };
      const jwtToken = jwt.sign(payload, "krify");
      res.send({ jwtToken });
    } else {
      res.status(400);
      res.send("Invalid Password");
    }
  }
});

app.get("/users/", (req, res) => {
  let jwtToken;
  const authHeader = req.headers["authorization"];
  if (authHeader !== undefined) {
    jwtToken = authHeader.split(" ")[1];
  }
  if (jwtToken === undefined) {
    res.status(401);
    res.send("Invalid Access Token");
  } else {
    jwt.verify(jwtToken, "krify", async (error, payload) => {
      if (error) {
        res.send("Invalid Access Token");
      } else {
        const Query = `
            SELECT
              *
            FROM
             users;`;
        const users_list = await db.all(Query);
        res.send(users_list);
      }
    });
  }
});
app.listen(8000);
