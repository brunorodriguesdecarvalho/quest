const express = require('express')
const { route } = require('express/lib/application')
const authMiddleware = require('../middlewares/auth')

const router = express.Router()

router.use(authMiddleware)

router.get('/', (req, res) => {
    res.send({ ok: true, user: req.userId })
})

router.get('/perguntas', (req,res)=>{

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

router.post('/perguntas/novapergunta', (req, res) => {
    idPergunta = 
    
    novaPergunta = {
        idPergunta : req.query.idPergunta,
        categoria : req.query.categoria,
        pergunta : req.query.pergunta,
        respostaCorreta : req.query.respostaCorreta,
        alternativaA : req.query.alternativaA,
        alternativaB : req.query.alternativaB,
        alternativaC : req.query.alternativaC,
        alternativaD : req.query.alternativaD,
        info: req.query.info
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

    res.send("teste")
})

module.exports = app => app.use('/p', router)