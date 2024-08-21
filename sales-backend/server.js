
const express = require('express')
const app = express();
const router = require('./Routes.js')

// Use the routes defined in routes.js
app.use('/', router);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
