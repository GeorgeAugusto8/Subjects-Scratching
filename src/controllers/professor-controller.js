const repository = require('../repositories/professor-repository')

exports.get = (req, res, next) => {
    repository.get(req.body)
        .then(data => {
            res.status('200').send({
                data: data
            })
        }).catch(e => {
            res.status('400').send({
                message: 'Falha ao buscar professores.',
                data: e
            })
        })

}

exports.put = (req, res, next) => {
    if(!req.body.id || !req.body.avaliacao) {
        res.status('400').send({
            data: 'Dados inválidos.'
        })
    }
    repository.put(req.body)
        .then(data => {
            res.status('200').send({
                message: 'Sucesso ao registrar avaliação.',
            })
        }).catch(e => {
            res.status('500').send({
                message: 'Falha ao processar avaliação.',
                data: e
            })
        })

}
