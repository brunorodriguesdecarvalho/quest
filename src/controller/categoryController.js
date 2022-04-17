const express = require('express')
//const { restart } = require('nodemon')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const authConfig = require('../config/auth.json')
const Category = require('../models/categories')
const colecaoCategoria = 'categories'
const colecao = 'QuestQuestionv2'

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
        if(!categoria || !free) {
            res.status(401).send("Falha do Cliente: Faltou informar nome da categoria")
        } else if(free.lenght === 0) {
            res.status(401).send("Falha do Cliente: Faltou informar se é gratuita")
        } else if(await Category.findOne({ categoria: categoria }))
            return res.status(412).send({error: 'Falha - Categoria já existe.Por favor informe outra categoria.'})

        const createcat = await Category.create(req.body)

        return res.send(createcat)

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
    try {
        if(!req.body._id) {
            res.status(432).send("Falha do Cliente: Faltou informar a ID da categoria a ser editada!")
        } else if(!await Category.findOne({"_id": ObjectId(req.body._id)})) {
            return res.status(412).send({error: 'Falha - Categoria não existe.Por favor informe outra categoria.'})
        } else {
            var update = {
                categoria: req.body.categoriaNova,
                free: req.body.freeNova,
            }

            MongoClient.connect(uri, { useUnifiedTopology: true }, function (err, QuestDB) {
                if (err) { 
                    res.status(461).send("Erro na conexão") 
                }
                else {
                    var dbo = QuestDB.db(bancodedados);
                    dbo.collection(colecaoCategoria).findOneAndUpdate({"_id": ObjectId(req.body._id)},{$set: update, $inc: { __v: 1}}, function (err, confirmacao) {
                        if (err) {
                            console.log("Erro ao tentar alterar categoria: ", err)
                            res.status(462).send("Impossível alterar essa categoria. Tente outro ID ou insulte o Bruno!")
                        } else if (confirmacao.updatedExisting = true ) {
                            console.log("Categoria alterada com sucesso: ",confirmacao)
                            //res.status(200).send("Categoria alterada com sucesso. Falta alterar as perguntas!")
                            MongoClient.connect(uri, { useUnifiedTopology: true }, function (err, QuestDB) {
                                if (err) { 
                                    console.log("Erro ao tentar atualizar a categoria nas perguntas: ", err)
                                    res.status(461).send("Erro na conexão: ", err) 
                                }
                                else {
                                    console.log("Não deu erro ao tentar atualizar a categoria nas perguntas?")
                                    var dbo = QuestDB.db(bancodedados);
                                    dbo.collection(colecao).updateMany({"categoria": req.body.categoriaVelha},{$set: {categoria:req.body.categoriaNova}, $inc: { __v: 1}}, function (err, confirmacao) {
                                        if (err) {
                                            console.log("Erro ao tentar atualizar as categorias das perguntas já existentes: ", err)
                                            res.status(462).send("Impossível alterar essa categoria. Tente outro ID ou insulte o Bruno!")
                                        } else if (confirmacao.matchedCount > 0 ) {
                                            console.log("Categoria alterada com sucesso nas perguntas: ",confirmacao)
                                            res.status(200).send("Categoria atualizada nas perguntas com sucesso.")
                                        } else {
                                            console.log("Categoria não foi atualizada nas perguntas com sucesso: ",confirmacao)
                                            res.status(463).send("Deu algum outro erro durante atualização das categorias nas perguntas já existentes! Insulte o Bruno!")
                                        }
                                        QuestDB.close();  
                                    })
                                }
                            })
                        } else {
                            console.log("Categoria não foi alterada com sucesso: ",confirmacao)
                            res.status(463).send("Deu algum outro erro antes de atualizar as categorias nas perguntas! Insulte o Bruno!")
                        }
                        QuestDB.close();  
                    })
                }
            })
        }

    } catch (err) {
        return res.status(400).send( {error: 'Falha - Update de Categoria não realizado.'} )
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