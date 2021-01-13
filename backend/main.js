// Libraries
const express = require('express');
const fetch = require('node-fetch');
const withQuery = require('with-query').default;
const EventEmitter = require("events");
const expressWS = require('express-ws')

const {MongoClient} = require('mongodb');
const mysql = require('mysql2/promise');

const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
dotenv.config();

// Instances
const app = express();
const appWS = expressWS(app)

app.use(cors());
// app.use(morgan('combined'));

// Environment
const PORT = parseInt(process.argv[2] || process.env.PORT) || 3000;
const ENDPOINT = 'http://api.datanews.io/v1/headlines'
const HEADERS = {
    "x-api-key": process.env.API_KEY
}

// SQL Connection Pool
const pool = mysql.createPool({
    host: process.env.MYSQL_SERVER,
    port: process.env.MYSQL_SERVER_PORT,
    user: process.env.MYSQL_USERNAME,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_SCHEMA,
    connectionLimit: process.env.MYSQL_CONN_LIMIT
});

// Mongo Settings
const MONGO_URL = process.env.MONGO_URL;
const MONGO_DB = process.env.MONGO_DB;

const mongoClient = new MongoClient(MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const insertHeadlines = (doc, col) => {
    mongoClient.db(MONGO_DB).collection(col)
        .drop();
    mongoClient.db(MONGO_DB).collection(col)
        .insertMany(doc);
}

// API query and recurring call
const getHeadlines = async (coin) => {
    const url = withQuery(
        ENDPOINT, {
            q: coin || "",
            sortBy: "date",
            language: "en",
            size: 100
        }
    );
    console.log(url);
    let result = await fetch(url, {headers: HEADERS});
    try {
        let rawResult = await result.json();
        console.log(rawResult);
        return rawResult;
    } catch (e) {
        console.error('ERROR');
        return Promise.reject(e);
    }
};

const featuredCoins = [
    'bitcoin',
    'ethereum',
    'sushiswap'
]

// const headlinesEmitter = new EventEmitter();
//
// setInterval(async () => {
//
//     for (let i = 0; i < featuredCoins.length; i++) {
//         const resultsRaw = await getHeadlines(featuredCoins[i]);
//
//         const formattedResults = []
//
//         for (let x = 0; x < resultsRaw.hits.length; x++) {
//             formattedResults.push(
//                 {
//                     pubDate: new Date(resultsRaw.hits[x].pubDate).toLocaleDateString(),
//                     pubTime: new Date(resultsRaw.hits[x].pubDate).toLocaleTimeString(),
//                     title: resultsRaw.hits[x].title,
//                     source: resultsRaw.hits[x].source,
//                     url: resultsRaw.hits[x].url
//                 }
//             )
//         }
//         headlinesEmitter.emit("newNews", formattedResults, featuredCoins[i]);
//     }
// }, 20000);

// headlinesEmitter.on("newNews",
//     async (news, coin) => {
//         await insertHeadlines(news, coin)
//         console.log(`New headlines for ${coin} inserted into Mongo at: ${new Date()}`);
//     });

// WebSockets
const ROOM = {}

app.ws('/chat', (ws, req) => {
    const name = req.query.name
    console.info(`New websocket connection: ${name}`, ROOM)
    // add the web socket connection to the room
    ws.participantName = name
    ROOM[name] = ws

    // setup
    ws.on('message', (payload) => {
        console.info('>>> payload: ', payload)
        // construct the message and stringify it
        const chat = JSON.stringify({
            from: name,
            message: payload,
            timestamp: (new Date()).toString()
        })
        // broadcast to everyone in the ROOM
        for (let p in ROOM)
            ROOM[p].send(chat)
    })

    ws.on('close', () => {
        console.info(`Closing websocket connection for ${name}`)
        // close our end of the connection
        ROOM[name].close()
        // remove ourself from the room
        delete ROOM[name]
    })

})

// Request Handlers
app.get('/headlines/:coin', async (req, res) => {

    let coinName = req.params.coin

    try {
        const headlines = (await mongoClient.db(MONGO_DB)
            .collection(coinName)
            .find({})
            .toArray())

        res.status(200);
        res.type('application/JSON');
        res.json(headlines)
    } catch (e) {
        console.info(e)
        res.status(500);
        res.type('text/html');
        res.send(JSON.stringify(e));
    }

})

// Start Server
const p0 = (async () => {
    console.info('Pinging SQL database...')
    const conn = await pool.getConnection();
    await conn.ping();
    conn.release()
    return true;
})()

const p1 = (async () => {
    console.info('Pinging Mongo database...')
    await mongoClient.connect()
})()

Promise.all([p0, p1])
    .then(() => {
        app.listen(PORT, () => {
            console.info(`Application started on port ${PORT} at ${new Date()}`)
        })
    })
    .catch(e => console.error('Cannot connect to database', e))
