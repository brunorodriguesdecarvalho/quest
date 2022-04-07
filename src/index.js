//Importar biblioteca Express
const express = require('express')
const bodyParser = require('body-parser')

//Para usar bibilioteca Express
const app = express()

//Para entender arquivos JSON  
app.use(bodyParser.json())

//Para o servidor entender/decodar quando parâmetros forem passados pela URL
app.use(bodyParser.urlencoded( {extended: false} ))

//Cookie-Parser
const cookieParser = require('cookie-parser')

//MongoClient
const MongoClient = require('mongodb').MongoClient;

// Pacote Path - Para publicação
const path = require('path');

//ObjectID ajuda no controle das chaves de identificação
const { ObjectId } = require("mongodb");

const { stringify } = require("querystring");

//CORS
const cors = require('cors')

//Reconhecimento dinâmico de porta do servidor ou localhost = 5000
const PORT = process.env.PORT || 4201
const msg_PORT = `Servidor Node.JS para QUEST FATEC disponível via porta ${PORT}!`

// hard coded configuration object
const confCors = {
 
    // origin undefined handler
    // see https://github.com/expressjs/cors/issues/71
    originUndefined: function (req, res, next) {
            next()
    },
 
    // Cross Origin Resource Sharing Options
    cors: {
        // origin handler
        origin: function (origin, cb) {
            // setup a white list
            let wl = ['*']
            cb(null, true)
        },
        optionsSuccessStatus: 200
    }
}

app.use(confCors.originUndefined , cors(confCors.cors))
app.use(cookieParser())
app.use(express.json())
app.use(express.urlencoded({ extended: false}))

const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('../swagger/novoswagger.json');

//app.use('/swagger', express.static('swagger'));
app.use('/swagger', swaggerUi.serve, swaggerUi.setup(swaggerDocument));


require('./controller/authController')(app)
require('./controller/questionController')(app)
require('./controller/questionControllerV2')(app)

app.get('/', (req, res) => {
    res.writeHead(200, {'Content-Type': 'text/html'})
    res.end('Bem Vindo ao Quest - Cadastre-se ou Faca Login para jogar...')
})

app.listen(PORT, () => {
    console.log(`${msg_PORT}`)
});