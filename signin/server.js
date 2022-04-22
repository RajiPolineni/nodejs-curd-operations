const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const bcrypt = require("bcrypt");
const path = require("path");
const jwt = require("jsonwebtoken");

const app = express();
app.use(express.json());
let db = null;
const initializeDbConnection = async () => {
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
             user_list;`;
        const users_list = await db.all(Query);
        res.send(users_list);
      }
    });
  }
});

//get by userid
app.get("/get/:userId", async (req, res) => {
  const { userId } = req.params;
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
        const Query = `SELECT * from user_list WHERE id=${userId};`;
        const users_details = await db.get(Query);
        res.send(users_details);
      }
    });
  }
});

//post
app.post("/post/", async (req, res) => {
  const { id, name, gender, organization } = req.body;
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
        const Query = `INSERT INTO 
                        user_list(
                            id,name,gender,organization
                            )
                        VALUES(
                            '${id}','${name}','${gender}','${organization}'
                            );`;
        const users_details = await db.run(Query);
        res.send(users_details);
      }
    });
  }
});

//put request
app.put("/put/:userId", async (req, res) => {
  const { userId } = req.params;
  const { name } = req.body;
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
        const query = `UPDATE user_list
            SET name='${name}' WHERE id=${userId};`;
        await db.run(query);
        res.send("Updated successfully");
      }
    });
  }
});

//delete request
app.delete("/delete/:userId", async (req, res) => {
  const { userId } = req.params;
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
        const query = `DELETE FROM user_list 
            WHERE id=${userId};`;
        await db.run(query);
        res.send("deleted successfully");
      }
    });
  }
});
app.listen(8000);
