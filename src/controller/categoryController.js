const express = require('express')
//const { restart } = require('nodemon')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const authConfig = require('../config/auth.json')

const Category = require('../models/categories')

const router = express.Router()

//CREATE
router.post('/register', async (req, res) => {
    const { categoria, free } = req.body

    try {
        if(!categoria) {
            res.status(401).send("Falha do Cliente: Faltou informar nome da categoria")
        } else if(free.lenght === 0) {
            res.status(401).send("Falha do Cliente: Faltou informar se é gratuita")
        } else if(await Category.findOne({ categoria: categoria }))
            return res.status(412).send({error: 'Falha - Categoria já existe.Por favor informe outra categoria.'})

        const createcat = await Category.create(req.body)

        return res.send({createcat})

    } catch (err) {
        return res.status(400).send( {error: 'Falha - Registro não realizado.'} )
    }
})


//READ ONE
router.get('/categoria', async (req, res) => {
    const { categoria } = req.body

    try {

        if(!categoria) {
            res.status(401).send("Falha do Cliente: Faltou informar nome da categoria a ser deletada")
        } else if(!await Category.findOne({ categoria: categoria }))
            return res.status(412).send({error: 'Falha - Categoria não existe.Por favor informe outra categoria.'})
    

        const onecategory = await Category.findOne({categoria: categoria})

        return res.send({onecategory})

    } catch (err) {
        return res.status(400).send( {error: 'Falha - Leitura não realizada.'} )
    }
})


//READ ALL
router.get('/categorias', async (req, res) => {

    try {
        
        const allcategories = await Category.find({})

        return res.send({allcategories})

    } catch (err) {
        return res.status(400).send( {error: 'Falha - Leitura não realizada.'} )
    }
})



//UPDATE
router.put('/categoria', async (req, res) => {
    const { oldcategoria, newcategoria, newfree } = req.body

   
    try {

        if(!oldcategoria) {
            res.status(401).send("Falha do Cliente: Faltou informar nome da categoria a ser editada!")
        } else if(!await Category.findOne({ categoria: oldcategoria }))
            return res.status(412).send({error: 'Falha - Categoria não existe.Por favor informe outra categoria.'})
    
        var update = {
            categoria: newcategoria,
            free: newfree,
            $inc: { __v: 1}
        }

        const upcat = await Category.findOneAndUpdate({categoria: oldcategoria}, update)

        return res.status(200).send({upcat})

    } catch (err) {
        return res.status(400).send( {error: 'Falha - Update não realizado.'} )
    }
})


//DELETE
router.delete('/categoria', async (req, res) => {
    const { categoria } = req.body

    try {

        if(!categoria) {
            res.status(401).send("Falha do Cliente: Faltou informar nome da categoria a ser deletada")
        } else if(!await Category.findOne({ categoria: categoria }))
            return res.status(412).send({error: 'Falha - Categoria não existe.Por favor informe outra categoria.'})


        const delcategory = await Category.deleteOne({categoria: categoria})

        return res.status(200).send("Categoria deletada com sucesso")

    } catch (err) {
        return res.status(400).send( {error: 'Falha - Delete não realizado.'} )
    }
})


module.exports = app => app.use('/categoria', router)