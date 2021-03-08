const mongoose = require('mongoose')
const Faculdade = mongoose.model('Faculdade')
const Unidade = mongoose.model('Unidade')

exports.get = () => {
    return Faculdade.find({})  
}

exports.getUnidades = (data) => {
    return Unidade.find({"faculdade": data.faculdade})  
}


