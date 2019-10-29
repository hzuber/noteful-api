const path = require('path')
const express = require('express')
const xss = require('xss')
const NotesService = require('./notes-service')

const notesRouter = express.Router()
const jsonParser = express.json()
const sanitizeNote = note => ({
    id: note.id,
    name: xss(note.name),
    content: xss(note.content),
    date_modified: note.date_modified,
    folder_id: note.folder_id
})

notesRouter
    .route('/')
    .get((req, res, next) => {
        NotesService.getAllNotes(req.app.get('db'))
            .then(notes => 
                res.json(notes.map(sanitizeNote))
            )
            .catch(next)
    })
    .post(jsonParser, (req, res, next) => {
        const { name, content, date_modified, folder_id } = req.body
        const newNote = { name, date_modified, folder_id }

        for(const [key, value] of Object.entries(newNote)){
            if(value == null) {
                return res.status(400).json({
                    error: {
                        message: `Missing '${key}' in request body`
                    }
                })
            }
        }
        newNote.content = content
        NotesService.insertNote(
            req.app.get('db'),
            newNote
        )
        .then(note => {
            res.status(201)
                .location(path.posix.join(req.originalUrl + `/${note.id}`))
                .json(sanitizeNote(note))
        })
        .catch(next)
    })

notesRouter
    .route('/:note_id')
    .all((req, res, next) => {
        NotesService.getById(
            req.app.get('db'),
            req.params.note_id
        )
            .then(note => {
                if (!note) {
                    return res.status(404).json({
                        error: {
                            message: `Article doesn't exist`
                        }
                    })
                }
                res.note = note
                next()
            })
            .catch(next)
    })
    .get((req, res, next) => {
        res.json(sanitizeNote(res.note))
        console.log(note)
    })
    .delete((req, res, next) => {
        NotesService.deleteNote(
            req.app.get('db'),
            req.params.note_id
        )
        .then(() => {
            res.status(204).end()
        })
        .catch(next)
    })
    .patch(jsonParser, (req, res, next) => {
        
        const { name, content, folder_id } = req.body
        const noteToUpdate = { name, content, folder_id }

        const numberOfValues = Object.values(noteToUpdate).filter(Boolean).length
        if(numberOfValues === 0) {
            return res.status(400).json({
                error: {
                    message: `Request body must contain either 'name', 'content' or 'folder id'`
                }
            })
        }
        NotesService.updateNote(
            req.app.get('db'),
            req.params.note_id,
            noteToUpdate
        )
        .then(() => {
            res.status(204).end()
        })
        .catch(next)
    })

module.exports = notesRouter