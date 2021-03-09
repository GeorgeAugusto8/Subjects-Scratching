const express = require('express')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')

const app = express()

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: false}))

mongoose.connect(`${process.env.DATABASE_URI}&w=majority`)

const Professor = require('./models/professor')
const Faculdade = require('./models/faculdade')
const Unidade = require('./models/unidade')

const indexRoute = require('./routes/index')
const professoresRoute = require('./routes/professores')
const faculdadesRoute = require('./routes/faculdades')

app.use('/', indexRoute)
app.use('/professores', professoresRoute)
app.use('/faculdades', faculdadesRoute)

module.exports = app