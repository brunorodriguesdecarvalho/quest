const express = require('express')
//const { restart } = require('nodemon')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const authConfig = require('../config/auth.json')
const Category = require('../models/categories')
const colecaoCategoria = 'categories'

const { Router } = require('express');
const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId
const uri = process.env.mongoDbURI
const { route } = require('express/lib/application');
const { ObjectID } = require('mongodb');
const { isValidObjectId } = require('../database');
const authMiddleware = require('../middlewares/auth')
const bancodedados = 'QuestDB'


const router = express.Router()

//Para Front - Tela de Super Admin para Categorias
router.get('/', async (req, res) => {
    res.render('categoria', {nomeJogador: nomeJogador, perfil: "SUPER ADMIN"})
})

//CREATE
router.post('/', async (req, res) => {
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
router.get('/', async (req, res) => {
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

        return res.send(allcategories)

    } catch (err) {
        return res.status(400).send( {error: 'Falha - Leitura não realizada.'} )
    }
})



//UPDATE
router.put('/', async (req, res) => {
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
/* router.delete('/', async (req, res) => {
    try {

        if(!req.body._id) {
            return res.status(401).send("Falha do Cliente: Faltou informar a id da categoria a ser deletada")
        } else if(!await Category.findOne({"_id": ObjectId(req.body._id)})) {
            return res.status(412).send({error: 'Falha - Categoria não existe.Por favor informe outra categoria.'})
        } else {
            const delcategory = await Category.deleteOne({"_id": ObjectId(req.body._id)})
            return res.status(200).send("Categoria deletada com sucesso")
        }
    } catch (err) {
        return res.status(400).send( {error: 'Falha - Delete não realizado.'} )
    }
}) */

router.delete('/', async(req, res) => {

    console.log("_id:", req.body._id)

    MongoClient.connect(uri, { useUnifiedTopology: true }, function (err, QuestDB) {
        if (err) { 
            res.status(461).send("Erro na conexão") 
        }
        else {
            var dbo = QuestDB.db(bancodedados);
            dbo.collection(colecaoCategoria).deleteOne({"_id": ObjectId(req.body._id)}, function (err, confirmacao) {
                if (err) {
                    console.log("Erro ao tentar deletar categoria: ", err)
                    res.status(462).send("Impossível deletar essa categoria. Tente outro ID ou insulte o Bruno!")
                } else if (confirmacao.deletedCount == 1) {
                    console.log("Categoria deletada com sucesso: ",confirmacao)
                    res.status(200).send("Categoria deletada com sucesso.")
                } else {
                    res.status(463).send("Deu algum outro erro! Insulte o Bruno!")
                }
                QuestDB.close(); 
            })
        }
    })
})


module.exports = app => app.use('/categoria', router)