const path = require('path');
const publicPath = path.join(__dirname, '../public');
const express = require('express');

const app = express();
const port = process.env.PORT || 3000;

// Serving frontend directory
app.use(express.static(publicPath));

app.listen(port, () => {
  console.log(`Server up at port ${port}.`);
});
