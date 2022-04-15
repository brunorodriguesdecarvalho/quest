const express = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const authConfig = require('../config/auth.json')

const User = require('../models/user')


const router = express.Router()

function generateToken(params = {}) {
    return jwt.sign(params, authConfig.secret, {
        expiresIn: 86400
    })
}

router.post('/register', async (req, res) => {
    const { email } = req.body

    try {
        if(await User.findOne({ email }))
            return res.status(412).send({error: 'Falha - Usuário já existe com esse E-mail.Por favor informe outro e-mail.'})

        const user = await User.create(req.body)

        user.password = undefined

        return res.send( { 
            user, 
            token: generateToken({ id: user.id })
        } )

    } catch (err) {
        return res.status(400).send( {error: 'Falha - Registro não realizado.'} )
    }
})

router.post('/authenticate', async(req, res) => {

    //console.log("Estão tentando gerar um token via Auth/Authenticate")

    const { email, password } = req.body
    //console.log("Req.Body.email: ", email)
    //console.log("Req.Body.password: ", password)
    
    const user = await User.findOne( { email } ).select('+password')

    if(!user) {
        return res.status(499).send({ error: 'Usuário não encontrado com base no e-mail informado.'})
    } else if (!await bcrypt.compare(password, user.password)){
        return res.status(498).send({ error: 'Senha Inválida.'})
    } else {
        user.password = undefined

        const token = jwt.sign({ id: user.id}, authConfig.secret, {
            expiresIn: 86400
        })

        //res.render('jogo', { user: res.user, token: generateToken({ id: user.id }) } )

        //console.log("Só para avisar que alguém conseguiu gerar com sucesso um token via Auth/Authenticate")

        session = req.session
        session.authorization = "Bearer " + generateToken({ id: user.id })
        session.username = user.name
        session.email = user.email

        res.status(200).send({ 
            user, 
            token: generateToken({ id: user.id })
        })
    }
})

module.exports = app => app.use('/auth', router)