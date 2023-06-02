// https://fullstackopen.com/en/part3/node_js_and_express#exercises-3-1-3-6
// Exercises 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8

const express = require('express')
const morgan = require('morgan')
const cors = require('cors') 

const app = express()

const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: "Unknown endpoint."})
}

morgan.token('body', request => { return JSON.stringify(request.body) })
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))
app.use(express.json())
app.use(cors())
app.use(express.static('build'))

let persons = [
    { 
      "id": 1,
      "name": "Arto Hellas", 
      "number": "040-123456"
    },
    { 
      "id": 2,
      "name": "Ada Lovelace", 
      "number": "39-44-5323523"
    },
    { 
      "id": 3,
      "name": "Dan Abramov", 
      "number": "12-43-234345"
    },
    { 
      "id": 4,
      "name": "Mary Poppendieck", 
      "number": "39-23-6423122"
    }
]

app.get('/info', (request, response) => { 
    const dateObject = new Date()
    response.send(
        `<div>
            <p>Phonebook has info for ${persons.length} people</p>
            <p>${dateObject}</p>
            <a href='http://localhost:3001/api/persons'>API</a>
        </div>`
    )
})

app.get('/api/persons', (request, response) => {
    return response.json(persons)
})

app.get('/api/persons/:id', (request, response) => { 
    const id = Number(request.params.id)
    const person = persons.find(person => person.id === id)

    if (person) { 
        return response.json(person)
    } else { 
        response.statusMessage = 'Person not found.'
        return response.status(404).end()
    }
})

const generateId = () => { 
    const maxId = persons.length > 0
        ? Math.max(...persons.map(person => person.id))
        : 0
    return maxId + 1
}

app.post('/api/persons/', (request, response) => {
    const body = request.body
    const exists = persons.find(person => person.name.toLowerCase() === body.name.toLowerCase())

    if (exists) { 
        return response.status(409).json({
            error: 'Name must be unique.'
        })
    }
    if(!body.name) { 
        return response.status(400).json({
            error: 'Name missing.'
        })
    }

    if (!body.number) { 
        return response.status(400).json({
            error: 'Number missing.'
        })
    }

    const person = {
        id: Math.floor(Math.random() * 2**50),
        name: body.name,
        number: body.number
    }
    persons = persons.concat(person)
    return response.json(persons)
})

app.delete('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    persons = persons.filter(person => person.id !== id)
    return response.status(204).end()
})

app.use(unknownEndpoint)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => { 
    console.log(`Server running on port ${PORT}`)
})