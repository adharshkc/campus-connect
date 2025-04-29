const express = require("express");
const connectDB = require("./config/config");
const authRoute = require("./routes/auth.routes");
const adminRoute = require("./routes/admin.routes");
const session = require("express-session");
const path = require("path");
const expressLayouts = require("express-ejs-layouts");
const staffRoute = require("./routes/teacher.routes");
const studentRoute = require("./routes/student.routes");
const cors = require('cors')

const app = express();
const port = 3000;

// app.use(expressLayouts);
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors())
app.use(express.static(path.join(__dirname, "public")));
// app.set('layout', 'layout.ejs')
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(
  session({
    secret: "this is a secret",
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 600000 * 24 },
  }),
);

app.use("/", authRoute);
app.use("/", adminRoute);
app.use("/", staffRoute);
app.use("/", studentRoute);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render("error", { error: err.message });
});
app.listen(port, () => {
  console.log("Server is running on port", port);
});
