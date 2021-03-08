const express = require('express')
const router = express.Router()

const controller = require('../controllers/professor-controller')

router.get('/', controller.get)

router.put('/', controller.put)

module.exports = router

