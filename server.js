import 'dotenv/config.js';
import dns from 'dns';
dns.setServers(["1.1.1.1"]);

import app from './src/app.js';
import connectDB from './src/db/db.js';

connectDB();

app.listen(process.env.PORT || 3000, () => {
  console.log('Server is running on port ' + (process.env.PORT || 3000));
});