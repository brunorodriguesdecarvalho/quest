const express = require('express')
const MongoClient = require('mongodb').MongoClient;
const uri = process.env.mongoDbURI
const { route } = require('express/lib/application')
const authMiddleware = require('../middlewares/auth')

const router = express.Router()

router.use(authMiddleware)

router.get('/', async(req, res) => {
    res.send({ ok: true, user: req.userId })
})

router.get('/perguntas', async(req,res)=>{   

    if (!req.query.questoes_ja_respondidas) {
        return res.status(419).send("Falha - [req.query.questoes_ja_respondidas] não informado na requisição. Informe o número zero se não respondeu nenhuma pergunta.")

    } else if (!req.query.categoria) {
        return res.status(420).send("Falha - [req.query.categoria] não foi informado na requisição ou em branco.")

    } else if ( 
            (req.query.categoria != "Sociedade") &&
            (req.query.categoria != "Variedades") &&
            (req.query.categoria != "Mundo") &&
            (req.query.categoria != "Esportes") &&
            (req.query.categoria != "Ciência") &&
            (req.query.categoria != "Artes e Entretenimento")
        ) {
        return res.status(427).send("Falha - [req.query.categoria] inválida. Escolha entre essas opções: Sociedade, Variedades, Mundo, Esportes, Ciência ou Artes e Entretenimento.")

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

router.post('/novapergunta', async(req, res) => {  
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

module.exports = app => app.use('/jogo', router)