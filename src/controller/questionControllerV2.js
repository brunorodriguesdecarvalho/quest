const { Router } = require('express');
const express = require('express')
const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId
const uri = process.env.mongoDbURI
const { route } = require('express/lib/application');
const { ObjectID } = require('mongodb');
const { isValidObjectId } = require('../database');
const authMiddleware = require('../middlewares/auth')
const bancodedados = 'QuestDB'
const colecao = 'QuestQuestionv2'

const router = express.Router()

router.use(authMiddleware)

//CREATE
router.post('/pergunta', async(req, res) => {  
    if(!req.body.categoria) {
        res.status(461).send("Falha do Cliente: Faltou informar a categoria")
        // Falta testar se é uma categoria válida!
    } else if (!req.body.pergunta) {
        res.status(462).send("Falha do Cliente: Faltou informar a pergunta")
    } else if (!req.body.respostaCorreta) {
        res.status(463).send("Falha do Cliente: Faltou informar a resposta correta")
        //preciso testar algum formato?
    } else if (!req.body.alternativaA) {
        res.status(464).send("Falha do Cliente: Faltou informar alternativaA")
        //preciso testar algum formato?
    } else if (!req.body.alternativaB) {
        res.status(465).send("Falha do Cliente: Faltou informar alternativaB")
        //preciso testar algum formato?
    } else if (!req.body.alternativaC) {
        res.status(466).send("Falha do Cliente: Faltou informar alternativaC")
        //preciso testar algum formato?
    } else if (!req.body.alternativaA) {
        res.status(467).send("Falha do Cliente: Faltou informar alternativaD")
        //preciso testar algum formato?
    } else if (!req.body.info) {
        res.status(468).send("Falha do Cliente: Faltou informar a fonte da pergunta.")
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
            if (err) {
                res.status(469).send("Erro de conexão no Mongo - Verifique a URI apontada!")
            } else {
                var dbo = QuestDB.db(bancodedados);
                dbo.collection(colecao).insertOne(novaPergunta, function (err, confirmacao) {
                    if (err) {
                        console.log("Erro ao tentar cadastrar nova pergunta!")
                        res.status(470).send("Impossível registrar essa pergunta. Tente outro ID ou fale com o Bruno!")
                    } else if (!confirmacao.insertedId) {
                        console.log("Erro ao tentar cadastrar nova pergunta!")
                        res.status(471).send("Impossível registrar essa pergunta. ID inválido! Tente outro ID. Use sempre números!")
                    } else {
                        console.log("Pergunta cadastrada: ", confirmacao.insertedId)
                        res.send("Pergunta cadastrada com sucesso!")
                    }
                    QuestDB.close(); 
                })}
        })
    }
})

//READ

//READ - SIMPLES - TODAS AS PERGUNTAS
router.get('/perguntas', async(req,res)=>{   
    MongoClient.connect(uri, { useUnifiedTopology: true }, function (err, QuestDB) {
        if (err) throw err;
        var dbo = QuestDB.db(bancodedados);
        dbo.collection(colecao).find().toArray(function await(err, questions) {
            if (err) throw err;
            res.status(200).send(questions)
            QuestDB.close(); 
        })
    })
})

//READ - REGRA DE FRONT - ÚNICA PERGUNTA QUALQUER DESDE QUE AINDA NÃO RESPONDIDA DURANTE A SESSÃO
//*** PARA SABER AS PERGUNTAS JÁ RESPONDIDAS, O FRONT PRECISA INFORMAR O ID DA PERGUNTA
router.get('/teste', async(req,res) => {
    var categoriaReq = String(req.body.categoria)
    var respondidas = req.body.questoes_ja_respondidas

    //console.log("Categorias Informadas - REQ: ", categoriaReq)
    //console.log("Questões Respondidas - REQ: ", respondidas)
    ///console.log(respondidas.length)

    var filtro

    if(respondidas.length==0 && !req.body.categoria) {
        //console.log("Sem info de ID")
        filtro = {}
    } else {
        filtro = []
        filtro.push({ categoria: categoriaReq })

        if (respondidas.length===0) {

            //console.log("Sem perguntas respondidas!")
        
            filtro = { categoria: categoriaReq }

        } else {

            for(i=0;i<respondidas.length;i++){
                item = respondidas[i]
                item = item._id
                item = ObjectId(item)
                filtro.push( { _id : { $ne: item } } )
            }

            filtro = { $and: filtro }

            //console.log("filtro2: ", filtro)
        
        }
    }

    MongoClient.connect(uri, { useUnifiedTopology: true }, function (err, QuestDB) {
        if(err) throw err;
        var dbo = QuestDB.db(bancodedados);
        dbo.collection(colecao).find(filtro).toArray(function await(err, questions) {
            if(err) throw err
            else if(questions.length==0) {
                res.status(400).send("Deu ruim, pois a query não tem nenhum resultado com esses filtros (Categoria + Exclusão de certos IDs")
            } else {
                res.status(200).send(questions)
            }
            QuestDB.close(); 
        })
    })
})

//UPDATE
router.put('/pergunta', async(req, res) => {
    
    if(!req.body._id) {
        res.status(401).send("Falha do Cliente: Faltou informar ID da pergunta")
    } else if(!req.body.categoria) {
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
        console.log("_id:", req.body._id)

        MongoClient.connect(uri, { useUnifiedTopology: true }, function (err, QuestDB) {
            if (err) { 
                res.status(400).send("Erro na conexão") 
            }
            else {
                var dbo = QuestDB.db(bancodedados);

                var pergunta = { 
                    $set: {
                        categoria : req.body.categoria,
                        pergunta : req.body.pergunta,
                        respostaCorreta : req.body.respostaCorreta,
                        alternativaA : req.body.alternativaA,
                        alternativaB : req.body.alternativaB,
                        alternativaC : req.body.alternativaC,
                        alternativaD : req.body.alternativaD,
                        info: req.body.info
                    }
                }

                dbo.collection(colecao).updateOne({"_id": ObjectId(req.body._id)}, pergunta, function (err, confirmacao) {
                    if (err) {
                        console.log("Erro ao tentar alterar pergunta: ", err)
                        res.status(400).send("Impossível alterar essa pergunta. Tente outro ID ou insulte o Bruno!")
                    } else {
                        console.log("Pergunta alterada com sucesso: ",confirmacao)
                        res.status(200).send("Pergunta alterada com sucesso.")
                    }
                    QuestDB.close(); 
                })
            }
        })
    }
})


//DELETE
router.delete('/pergunta', async(req, res) => {

    console.log("_id:", req.body._id)

    MongoClient.connect(uri, { useUnifiedTopology: true }, function (err, QuestDB) {
        if (err) { 
            res.status(400).send("Erro na conexão") 
        }
        else {
            var dbo = QuestDB.db(bancodedados);
            dbo.collection(colecao).deleteOne({"_id": ObjectId(req.body._id)}, function (err, confirmacao) {
                if (err) {
                    console.log("Erro ao tentar deletar pergunta: ", err)
                    res.status(400).send("Impossível deletar essa pergunta. Tente outro ID ou insulte o Bruno!")
                } else if (confirmacao.deletedCount == 1) {
                    console.log("Pergunta deletada com sucesso: ",confirmacao)
                    res.status(200).send("Pergunta deletada com sucesso.")
                } else {
                    res.status(400).send("Deu algum outro erro! Insulte o Bruno!")
                }
                QuestDB.close(); 
            })
        }
    })
})

module.exports = app => app.use('/jogoV2', router)