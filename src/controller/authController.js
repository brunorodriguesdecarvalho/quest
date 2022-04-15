const express = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const authConfig = require('../config/auth.json')

const User = require('../models/user')


const router = express.Router()


//Gerar Token
function generateToken(params = {}) {
    return jwt.sign(params, authConfig.secret, {
        expiresIn: 86400
    })
}

//Criar Usuário
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


//Reset de Senha
router.put('/register', async (req, res) => {
    const { email, newname, oldpassword, newpassword } = await req.body

    try{
        if(!email) {
            res.status(401).send("Falha do Cliente: Faltou informar email do usuário!")
        } else if (!oldpassword) {
            res.status(401).send("Falha do Cliente: Faltou informar a senha!")
        } else if (!newpassword) {
            res.status(401).send("Falha do Cliente: Faltou informar a nova senha!")
        } else if(!await User.findOne({ email: email }))
            return res.status(412).send({error: 'Falha - Email não cadastrado!'})

        var hashpassword = await bcrypt.hash(newpassword, 10)

        var updateuser = {
            password: hashpassword,
            name: newname,
            $inc: { __v: 1}
        }

        const bduser = await User.findOne( {email} ).select('+password')

        if(!bduser) {
            return res.status(400).send({ error: 'Usuário não encontrado com base no e-mail informado.'})
        }


        const isValidPassword = await bcrypt.compare(oldpassword, bduser.password)

        if(!isValidPassword){
            return res.status(401).send({ error: 'Senha inválida'})
        } else {     

            const user = await User.findOneAndUpdate({email}, updateuser).select('+password')

            user.newpassword = undefined
            /*
            const token = jwt.sign({ id: user.id}, authConfig.secret, {
                expiresIn: 86400
            })
            */
            return res.status(200).send("Usuário atualizado com sucesso" )
            }
    } catch (err) {
        return res.status(400).send( {error: 'Falha - Usuário não pode ser atualizado.'} )
    }
})

//Deletar Usuário
router.delete('/register', async (req, res) => {
    const { email, password} = await req.body

    try{
        if(!email) {
            res.status(401).send("Falha do Cliente: Faltou informar email do usuário")
        } else if (!password) {
            res.status(401).send("Falha do Cliente: Faltou informar a senha")
        } else if(!await User.findOne({ email: email }))
            res.status(412).send({error: 'Falha - Email não cadastrado!'})
    
        const bduser = await User.findOne( {email} ).select('+password')

        if(!bduser) {
            return res.status(400).send({ error: 'Usuário não encontrado com base no e-mail informado.'})
        }

        const isValidPassword = await bcrypt.compare(password, bduser.password)

        if(!isValidPassword){
            return res.status(401).send({ error: 'Senha inválida'})
        } else {     

            const user = await User.deleteOne({email}).select('+password')
            return res.status(200).send("Usuário deletado com sucesso")
        }
    } catch (err) {
        return res.status(400).send( {error: 'Falha - Delete não realizado.'} )
    }   
})



//Ler um usuário 
router.get('/register', async (req, res) => {
    const { email} = await req.body

    try {
        if(!email) {
            res.status(401).send("Falha do Cliente: Faltou informar email do usuário")
        } 

        const bduser = await User.findOne( {email} )

        if(!bduser) {
            return res.status(400).send({ error: 'Usuário não encontrado com base no e-mail informado.'})
        }

        res.status(200).send({ bduser})
    } catch (err) {
        return res.status(400).send( {error: 'Falha - Busca não realizada.'} )
    }
})



//Ver Todos os Usuários
router.get('/read', async (req, res) => {
    
    try{
        const allusers = await User.find( {} )

        res.status(200).send({ allusers})

    } catch (err) {
        return res.status(400).send( {error: 'Falha - Busca não realizada.'} )
    }
    
})


//Autenticar Usuário
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