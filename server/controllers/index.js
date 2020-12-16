const express = require('express');

const app = express();

app.use(require('./user'));
app.use(require('./login'));
app.use(require('./upload'));
app.use(require('./image'));
app.use(require('./message'));

module.exports = app;
