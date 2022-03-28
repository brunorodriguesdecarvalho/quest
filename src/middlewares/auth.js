const jwt = require('jsonwebtoken')
const authConfig = require('../config/auth.json')


module.exports = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if(!authHeader)
        return res.status(411).send( {error: 'Token não informado'})

    const parts = authHeader.split(' ')
    
    if(!parts.length === 2)
        return res.status(412).send({ error: 'Erro no Token'})

    const [ scheme, token ] = parts

    if(!/^Bearer$/i.test(scheme))
        return res.status(417).send({ error: 'Token formatado incorretamente'})

    jwt.verify(token, authConfig.secret, (err, decoded) => {
        if (err) return res.status(401).send({ error: 'Token inválido'})

        req.userId = decoded.id 
        return next()
    })

}