const { Router } = require('express');
const express = require('express')
const MongoClient = require('mongodb').MongoClient;
const uri = process.env.mongoDbURI
const { route } = require('express/lib/application')
const authMiddleware = require('../middlewares/auth')

const router = express.Router()

router.use(authMiddleware)

//CREATE

router.post('/novapergunta', async(req, res) => {  
    if(!req.body.categoria) {
        res.status(401).send("Falha do Cliente: Faltou informar a categoria")
        // Falta testar se é uma categoria válida!
    } else if (!req.body.pergunta) {
        res.status(401).send("Falha do Cliente: Faltou informar a pergunta")
    } else if (!req.body.respostaCorreta) {
        res.status(401).send("Falha do Cliente: Faltou informar a resposta correta")
        //preciso testar algum formato?
    } else if (!req.body.alternativaA) {
        res.status(401).send("Falha do Cliente: Faltou informar alternativaA")
        //preciso testar algum formato?
    } else if (!req.body.alternativaB) {
        res.status(401).send("Falha do Cliente: Faltou informar alternativaB")
        //preciso testar algum formato?
    } else if (!req.body.alternativaC) {
        res.status(401).send("Falha do Cliente: Faltou informar alternativaC")
        //preciso testar algum formato?
    } else if (!req.body.alternativaA) {
        res.status(401).send("Falha do Cliente: Faltou informar alternativaD")
        //preciso testar algum formato?
    } else if (!req.body.info) {
        res.status(401).send("Falha do Cliente: Faltou informar a fonte")
    } else {
        novaPergunta = {
            categoria : req.body.categoria,
            pergunta : req.body.pergunta,
            respostaCorreta : req.body.respostaCorreta,
            alternativaA : req.body.alternativaA,
            alternativaB : req.body.alternativaB,
            alternativaC : req.body.alternativaC,
            alternativaD : req.body.alternativaD,
            info: req.body.info
        } 
    
        MongoClient.connect(uri, { useUnifiedTopology: true }, function (err, QuestDB) {
            if (err) throw err;
            else {
                var dbo = QuestDB.db("QuestDB");
                dbo.collection("QuestQuestionv2").insertOne(novaPergunta, function (err, confirmacao) {
                    if (err) {
                        console.log("Erro ao tentar cadastrar nova pergunta!")
                        res.status(400).send("Impossível registrar essa pergunta. Tente outro ID ou fale com o Bruno!")
                    } else if (!confirmacao.insertedId) {
                        console.log("Erro ao tentar cadastrar nova pergunta!")
                        res.status(400).send("Impossível registrar essa pergunta. ID inválido! Tente outro ID. Use sempre números!")
                        } else {
                        console.log("Pergunta cadastrada: ", confirmacao)
                        res.send("Pergunta cadastrada com sucesso!")
                    }
                    QuestDB.close(); 
                })}
        })
    }
})

//READ

//UPDATE

//DELETE

router.delete('/novapergunta', async(req, res) => {
    var ObjectId = require('mongodb').ObjectId
    var ide = ObjectId(req.body._id);

    MongoClient.connect(uri, { useUnifiedTopology: true }, function (err, QuestDB) {
        if (err) {res.status(400).send("Erro na conexão");}
        else {
            var dbo = QuestDB.db("QuestDB");
            dbo.collection("QuestQuestionv2").deleteById(ide, function (err, confirmacao) {
                if (err) {
                    console.log("Erro ao tentar deletar pergunta!")
                    res.status(400).send("Impossível deletar essa pergunta. Tente outro ID ou insulte o Bruno!")
                } 
                res.send
                QuestDB.close(); 
            })}
    })
})

module.exports = app => app.use('/jogoV2', router)