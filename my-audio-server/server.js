const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const port = 8000;

app.use(cors());
app.use(express.static(path.join(__dirname, 'assets')));

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});