const repository = require('../repositories/faculdade-repository')

exports.get = (req, res, next) => {
    repository.get(req.body)
        .then(data => {
            res.status('200').send({
                data: data
            })
        }).catch(e => {
            res.status('400').send({
                message: 'Falha ao buscar faculdades.',
                data: e
            })
        })

}

exports.getUnidades = (req, res, next) => {
    repository.getUnidades(req.body)
        .then(data => {
            res.status('200').send({
                data: data
            })
        }).catch(e => {
            res.status('400').send({
                message: 'Falha ao buscar unidades.',
                data: e
            })
        })

}
