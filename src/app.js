require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const { NODE_ENV } = require('./config');
const foldersRouter = require('../folders/folder-router')
const notesRouter = require('../notes/note-router')

const app = express()
const morganOption = (NODE_ENV === 'production' ? 'tiny' : 'common')

app.get('/', (req, res) => {
    res.send('Hello World')
})

app.use(morgan(morganOption))
app.use(helmet())
app.use(cors())

app.use('/api/folders', foldersRouter)
app.use('/api/notes', notesRouter)

module.exports = app