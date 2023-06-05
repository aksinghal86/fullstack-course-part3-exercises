// https://fullstackopen.com/en/part3/saving_data_to_mongo_db#connecting-the-backend-to-a-database
// Exercises 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9, 3.10, 3.11, 3.12, 3.13, 3.14

const express = require('express')
const morgan = require('morgan')
const cors = require('cors') 
require('dotenv').config()

const Person = require('./models/person')
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
    Person.find({}).then(persons => { 
        return response.json(persons)
    })
})

app.get('/api/persons/:id', (request, response) => { 
    Person.findById(request.params.id)
        .then(person => {
            return response.json(person)
        })
        .catch(error => {
            console.log('error 404', error.message)
        })
})

app.post('/api/persons/', (request, response) => {
    const body = request.body
    // const exists = persons.find(person => person.name.toLowerCase() === body.name.toLowerCase())

    // if (exists) { 
    //     return response.status(409).json({
    //         error: 'Name must be unique.'
    //     })
    // }
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

    const person = new Person({
        name: body.name.toLowerCase(),
        number: body.number
    })

    person.save().then(savedPerson => {
        return response.json(savedPerson)
    })
})

// app.delete('/api/persons/:id', (request, response) => {
//     const id = Number(request.params.id)
//     persons = persons.filter(person => person.id !== id)
//     return response.status(204).end()
// })

app.use(unknownEndpoint)

const PORT = process.env.PORT
app.listen(PORT, () => { 
    console.log(`Server running on port ${PORT}`)
})