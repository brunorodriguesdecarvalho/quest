const jwt = require('jsonwebtoken')
const authConfig = require('../config/auth.json')

module.exports = (req, res, next) => {

    const authHeader = req.session.authorization || req.header.authorization 
    //console.log("Entrando pelo Middleware - AuthHeader: ", authHeader)

    if(!authHeader) {
        //console.log("Tentaram autenticar via Auth, mas não informaram o token!")
        return res.status(497).render('login')
        //return res.status(497).send( {error: 'Token não informado'})
    }

    const parts = authHeader.split(' ')
    
    if(!parts.length === 2) {
        //console.log("Tentaram autenticar via Auth, mas token não tem duas partes")
        return res.status(496).send({ error: 'Erro no Token'})
    }

    const [ scheme, token ] = parts

    if(!/^Bearer$/i.test(scheme)) {
        //console.log("Tentaram autenticar via Auth, mas token não tem Bearer")
        return res.status(495).send({ error: 'Token formatado incorretamente'})
    }

    jwt.verify(token, authConfig.secret, (err, decoded) => {
        if (err) {
            //console.log("Tentaram autenticar via Auth, mas token não foi deserializado...")
            return res.status(494).send({ error: 'Token inválido'})
        }
        req.userId = decoded.id
        return next()
    })

}