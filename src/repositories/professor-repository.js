const mongoose = require('mongoose')
const Professor = mongoose.model('Professor')

exports.get = (data) => {
    return Professor.find({"faculdade": data.faculdade, "unidade" : data.unidade})  
}

exports.put = async (data) => {
    var professor = await Professor.findById(data.id)
    return Professor.findByIdAndUpdate(data.id, {
        $set: {
            Avaliacao_quantidade : professor.Avaliacao_quantidade + 1,
            Avaliacao_total : parseInt(professor.Avaliacao_total) + parseInt(data.avaliacao)
        }
    })
}
