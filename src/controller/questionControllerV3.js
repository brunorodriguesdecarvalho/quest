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

//Rota após o login - Desvio Super Admin
router.get('/', async(req,res) => {
    emailJogador = req.session.email
    //console.log("emailJogador: ", emailJogador)
    auth = req.headers.authorization || req.body.authorization || req.session.authorization
    nomeJogador = req.session.username
    //console.log("Token recebido no Servidor - question Controler 1: ", auth)
    console.log("Quem tentou jogar - question Controler 1: ", nomeJogador)

    if (emailJogador == "superadmin@superadmin") {
        res.render('admin', {nomeJogador: nomeJogador, perfil: "SUPER ADMIN"})
    } else {
        res.render('prelobby', {nomeJogador: nomeJogador, perfil: "Jogador"})
    }
})

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
            dica : req.body.dica,
            info: req.body.info,
            __v: 0
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
        dbo.collection(colecao).find().sort({categoria:1, pergunta: 1}).toArray(function await(err, questions) {
            if (err) throw err;
            res.status(200).send(questions)
            QuestDB.close(); 
        })
    })
})

//READ - REGRA DE FRONT - ÚNICA PERGUNTA QUALQUER DESDE QUE AINDA NÃO RESPONDIDA DURANTE A SESSÃO
//*** PARA SABER AS PERGUNTAS JÁ RESPONDIDAS, O FRONT PRECISA INFORMAR O ID DA PERGUNTA
router.get('/pergunta', async(req,res) => {

    //console.log("O que foi recebido-body: ", req.body)
    //console.log("O que foi recebido-query: ", req.query)

    data = JSON.parse(req.headers.data)

    //console.log("O que foi recebido-headers.data: ", data )

    if(!data.categoria || !data.questoes_ja_respondidas) {
        //console.log("categoria: ",!data.categoria)
        //console.log("questões respondidas: ",!data.questoes_ja_respondidas)
        res.status(421).send("Tá de zoeira né tio?! rsrs")
    } else {
        var categoriaReq = String(data.categoria)
        var respondidas = data.questoes_ja_respondidas
        var filtro

        if(respondidas.length==0 && !data.categoria) {

            filtro = {}

        } else {

            filtro = []
            filtro.push({ categoria: categoriaReq })

            if (respondidas.length===0) {
            
                filtro = { categoria: categoriaReq }

            } else {

                for(i=0;i<respondidas.length;i++){
                    item = respondidas[i]
                    item = item._id
                    item = ObjectId(item)
                    filtro.push( { _id : { $ne: item } } )
                }
 
                filtro = { $and: filtro }  

                MongoClient.connect(uri, { useUnifiedTopology: true }, function (err, QuestDB) {
                    if(err) throw err;
                    var dbo = QuestDB.db(bancodedados);
                    var alea = Math.floor(Math.random() * 11)
                    //console.log(alea)
                    dbo.collection(colecao).find(filtro).limit(1).skip(alea).toArray(function await(err, questions) {
                        if(err) throw err
                        else if(questions.length==0) {
                            res.status(421).send("Não há outras perguntas para exibir no momento. Peça para o administrador cadastrar mais e tente novamente.")
                        } else {
                            res.status(200).send(questions)
                        }
                        QuestDB.close(); 
                    })
                })
            
            }
        }
    }
})

//UPDATE
router.put('/pergunta', async(req, res) => {
    
    if(!req.body._id) {
        res.status(401).send("Falha do Cliente: Faltou informar ID da pergunta")
    } else if(!req.body.categoria) {
        res.status(402).send("Falha do Cliente: Faltou informar a categoria")
        // Falta testar se é uma categoria válida!
    } else if (!req.body.pergunta) {
        res.status(403).send("Falha do Cliente: Faltou informar a pergunta")
    } else if (!req.body.respostaCorreta) {
        res.status(404).send("Falha do Cliente: Faltou informar a resposta correta")
        //preciso testar algum formato?
    } else if (!req.body.alternativaA) {
        res.status(405).send("Falha do Cliente: Faltou informar alternativaA")
        //preciso testar algum formato?
    } else if (!req.body.alternativaB) {
        res.status(406).send("Falha do Cliente: Faltou informar alternativaB")
        //preciso testar algum formato?
    } else if (!req.body.alternativaC) {
        res.status(407).send("Falha do Cliente: Faltou informar alternativaC")
        //preciso testar algum formato?
    } else if (!req.body.alternativaA) {
        res.status(408).send("Falha do Cliente: Faltou informar alternativaD")
        //preciso testar algum formato?
    } else if (!req.body.info) {
        res.status(409).send("Falha do Cliente: Faltou informar a fonte")
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
                        info: req.body.info,
                        dica: req.body.dica
                    },
                    $inc: { __v: 1}
                }

                dbo.collection(colecao).updateOne({"_id": ObjectId(req.body._id)}, pergunta, function (err, confirmacao) {
                    if (err) {
                        console.log("Erro ao tentar alterar pergunta: ", err)
                        res.status(410).send("Impossível alterar essa pergunta. Tente outro ID ou insulte o Bruno!")
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
            res.status(461).send("Erro na conexão") 
        }
        else {
            var dbo = QuestDB.db(bancodedados);
            dbo.collection(colecao).deleteOne({"_id": ObjectId(req.body._id)}, function (err, confirmacao) {
                if (err) {
                    console.log("Erro ao tentar deletar pergunta: ", err)
                    res.status(462).send("Impossível deletar essa pergunta. Tente outro ID ou insulte o Bruno!")
                } else if (confirmacao.deletedCount == 1) {
                    console.log("Pergunta deletada com sucesso: ",confirmacao)
                    res.status(200).send("Pergunta deletada com sucesso.")
                } else {
                    res.status(463).send("Deu algum outro erro! Insulte o Bruno!")
                }
                QuestDB.close(); 
            })
        }
    })
})

router.get('/singleplayer', async(req,res) => {
    res.render('singleplayer')
})

router.get('/multiplayer', async(req,res) => {
    res.render('multiplayer')
})

module.exports = app => app.use('/jogoV3', router)