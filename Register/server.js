const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

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

app.get("/", async (req, res) => {
  const query = `SELECT * FROM user_list;`;
  const details = db.get(query);
  res.send(details);
  console.log("request Successful");
});
app.post("/register/", async (req, res) => {
  const details = req.body;
  const {
    firstname,
    lastname,
    email,
    number,
    organization,
    picture,
    about,
    resume,
  } = details;
  const query = `INSERT INTO user_list(firstname,lastname,email,number,organization,picture,about,resume) 
    VALUES('${firstname}','${lastname}','${email}','${number}','${organization}','${picture}','${about}','${resume}');`;
  const newUser = db.run(query);
  res.send(newUser);
  console.log("User Registered");
});

app.listen(8080);
