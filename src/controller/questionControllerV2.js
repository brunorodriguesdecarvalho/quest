const { Router } = require('express');
const express = require('express')
const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId
const uri = process.env.mongoDbURI
const { route } = require('express/lib/application');
const { ObjectID } = require('mongodb');
const authMiddleware = require('../middlewares/auth')
const bancodedados = 'QuestDB'
const colecao = 'QuestQuestionv2'

const router = express.Router()

router.use(authMiddleware)

//CREATE
router.post('/pergunta', async(req, res) => {  
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
                var dbo = QuestDB.db(bancodedados);
                dbo.collection(colecao).insertOne(novaPergunta, function (err, confirmacao) {
                    if (err) {
                        console.log("Erro ao tentar cadastrar nova pergunta!")
                        res.status(400).send("Impossível registrar essa pergunta. Tente outro ID ou fale com o Bruno!")
                    } else if (!confirmacao.insertedId) {
                        console.log("Erro ao tentar cadastrar nova pergunta!")
                        res.status(400).send("Impossível registrar essa pergunta. ID inválido! Tente outro ID. Use sempre números!")
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
router.get('/pergunta', async(req,res)=>{   

    if (!req.query.questoes_ja_respondidas) {
        return res.status(419).send("Falha - [req.query.questoes_ja_respondidas] não informado na requisição. Informe o número zero se não respondeu nenhuma pergunta.")

    } else if (!req.query.categoria) {
        return res.status(420).send("Falha - [req.query.categoria] não foi informado na requisição ou em branco.")

    } else {
        categoriaReq = req.query.categoria
        questoes_ja_respondidas = req.query.questoes_ja_respondidas;
        questoes_ja_respondidas = questoes_ja_respondidas.split(",")
        qtd_perguntas_respondidas = questoes_ja_respondidas.length
        filtro_perguntas_respondidas = []

        filtro_perguntas_respondidas.push( { categoria: categoriaReq } )
        
        for(i=0;qtd_perguntas_respondidas>i;i++) {
            filtro_perguntas_respondidas.push( { idPergunta: { $ne: String(questoes_ja_respondidas[i]) } } )
        }

        filtro_perguntas_respondidas = { $and: filtro_perguntas_respondidas }

        MongoClient.connect(uri, { useUnifiedTopology: true }, function (err, QuestDB) {
            if (err) throw err;
            var dbo = QuestDB.db("QuestDB");
            dbo.collection("QuestQuestions").find(filtro_perguntas_respondidas).toArray(function await(err, questions) {
                if (questions.length < 1) return res.status(430).send("Ainda não há outras perguntas cadastradas para " + categoriaReq)
                if (err) throw err;
                res.status(200).send(questions)
                QuestDB.close(); 
            })
        })
    }
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