const express = require('express');
const app = express();
const port = 3000;

const mapsRouter = require('./routes/maps');
const bossesRouter = require('./routes/bosses');

app.use('/api/maps', mapsRouter);
app.use('/api/bosses/maps', bossesRouter);

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
})