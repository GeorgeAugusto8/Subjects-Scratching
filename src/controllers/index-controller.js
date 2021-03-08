
exports.get = (req, res, next) => {
    res.status('200') .send({title: 'api teste', version: '0.0.1'})
}