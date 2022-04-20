const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

const app = express();
app.use(express.json());

let db = null;
dbConnection = async () => {
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
dbConnection();

//get request
app.get("/", async (req, res) => {
  const userDetails = await db.all("SELECT * FROM users");
  res.send(userDetails);
});

//get by id
app.get("/get/:userId", async (req, res) => {
  const { userId } = req.params;
  const query = `SELECT * from users WHERE id=${userId};`;
  const details = await db.get(query);
  res.send(details);
});

//post
app.post("/post/", async (req, res) => {
  const { id, name, gender, organization, location } = req.body;
  const query = `INSERT INTO 
  users(
      id,name,gender,organization,location
      )
  VALUES(
      '${id}','${name}','${gender}','${organization}','${location}'
      );`;
  const userDetails = await db.run(query);
  res.send(userDetails);
});

//put request
app.put("/put/:userId", async (req, res) => {
  const { userId } = req.params;
  const { name } = req.body;
  const query = `UPDATE users
  SET name='${name}' WHERE id=${userId};`;
  await db.run(query);
  res.send("Updated successfully");
});

//delete request
app.delete("/delete/:userId", async (req, res) => {
  const { userId } = req.params;
  const query = `DELETE FROM users 
    WHERE id=${userId};`;
  await db.run(query);
  res.send("deleted successfully");
});
app.listen(8000);
