const path = require("path");

const rootEnv = path.resolve(__dirname, "..", "..", ".env");
const backendEnv = path.resolve(__dirname, "..", ".env");
require("dotenv").config({ path: rootEnv });
require("dotenv").config({ path: backendEnv });

const app = require("./app");
const connectDB = require("./config/db");

const PORT = process.env.PORT || 5000;

connectDB();
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
