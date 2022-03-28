const express = require('express')
const { route } = require('express/lib/application')
const authMiddleware = require('../middlewares/auth')

const router = express.Router()

router.use(authMiddleware)

router.get('/', async(req, res) => {
    res.send({ ok: true, user: req.userId })
})

router.get('/perguntas', async(req,res)=>{

    categoriaReq = req.query.categoria
    questoes_ja_respondidas = req.query.questoes_ja_respondidas;

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
        dbo.collection("QuestQuestions").find(filtro_perguntas_respondidas).toArray(function (err, questions) {
            if (err) throw err;
            res.send(questions)
            QuestDB.close(); 
        })
    })
})

router.post('/perguntas/novapergunta', async(req, res) => {  
    novaPergunta = {
        idPergunta : req.body.idPergunta,
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
        var dbo = QuestDB.db("QuestDB");
        dbo.collection("QuestQuestions").insertOne(novaPergunta, function (err, confirmacao) {
            if (err) throw err;
            console.log(confirmacao)
            QuestDB.close(); 
        })
    })

    res.send("Pergunta cadastrada com sucesso!")
})

module.exports = app => app.use('/p', router)