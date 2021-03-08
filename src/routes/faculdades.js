const express = require('express')
const router = express.Router()

const controller = require('../controllers/faculdade-controller')

router.get('/', controller.get)

router.get('/unidades', controller.getUnidades)

module.exports = router