const express = require('express')
//const { restart } = require('nodemon')
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
    const { email, password } = req.body
    
    const user = await User.findOne( { email } ).select('+password')

    if(!user) {
        return res.status(400).send({ error: 'Usuário não encontrado com base no e-mail informado.'})
    }

    if(!await bcrypt.compare(password, user.password)){
        return res.status(401).send({ error: 'Senha Inválida.'})
    }

    user.password = undefined

    const token = jwt.sign({ id: user.id}, authConfig.secret, {
        expiresIn: 86400
    })

    res.status(200).send({ 
        user, 
        token: generateToken({ id: user.id })
    })
})

module.exports = app => app.use('/auth', router)