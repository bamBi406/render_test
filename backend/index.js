// imports
require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const Note = require('./models/note')

const app = express()

morgan.token('reqBody', (req) => {
    const body = req.body

    if (!body) {
        return ''
    }

    const bodyContent = {
        name: body.name,
        number: body.number
    }

    return JSON.stringify(bodyContent)
})

const errorHandler = (error, request, response, next) => {
    console.error(error.message)

    if (error.name === 'CastError') {
        return response.status(400).send({ error: 'malformated id' })
    } else if (error.name === 'ValidationError') {
        return response.status(400).json({ error: error.message })
    }

    next(error)
}

app.use(express.static('dist'))
app.use(express.json())
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :reqBody'))

app.get('/', (request, response) => {
    response.send('<h1>Hello World!</h1>')
})

app.get('/api/notes', (request, response) => {
    Note.find({}).then(notes => {
        response.json(notes)
    })
})

app.get('/api/notes/:id', (request, response, next) => {
    Note.findById(request.params.id)
        .then(note => {
            if (note) {
                response.json(note)
            } else {
                response.status(404).end()
            }
        })
        .catch(error => next(error))
})

app.delete('/api/notes/:id', (request, response, next) => {
    Note.findByIdAndDelete(request.params.id)
        .then(result => {
            response.status(204).end()
        })
        .catch(error => next(error))
})

app.post('/api/notes', (request, response, next) => {
    const body = request.body

    const note = new Note({
        content: body.content,
        important: body.important || false,
    })

    note.save()
        .then(savedNote => {
            response.json(savedNote)
        })
        .catch(error => next(error))
})

app.put('/api/notes/:id', (request, response, next) => {
    const { content, important } = request.body

    Note.findById(request.params.id)
        .then(note => {
            if (!note) {
                return response.status(404).end()
            }

            note.content = content
            note.important = important

            return note.save().then(updatedNote => {
                response.json(updatedNote)
            })
        })
        .catch(error => next(error))
})

const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)
app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`Server runnng on port ${PORT}`)
})
