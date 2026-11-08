require("dotenv").config();
const dns = require("dns");
dns.setServers(["1.1.1.1"]);

const app = require("./src/app.js");
const connectDB = require("./src/db/db.js");

connectDB();

app.listen(process.env.PORT || 3000, () => {
  console.log('Server is running on port ' + (process.env.PORT || 3000));
});