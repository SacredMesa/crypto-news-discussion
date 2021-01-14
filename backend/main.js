// Libraries
const express = require('express');
const fetch = require('node-fetch');
const withQuery = require('with-query').default;
const EventEmitter = require("events");
const expressWS = require('express-ws');

const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const jwt = require('jsonwebtoken')

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
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

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

const SQL_SELECT_USER = 'select user_id from user where user_id = ? and password = sha1(?)'

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
//                     pubTime: new Date(resultsRaw.hits[x].pubDate).toLocaleTimeString([], { hour12: false }),
//                     title: resultsRaw.hits[x].title,
//                     source: resultsRaw.hits[x].source,
//                     url: resultsRaw.hits[x].url
//                 }
//             )
//         }
//         headlinesEmitter.emit("newNews", formattedResults, featuredCoins[i]);
//     }
// }, 20000);
//
// headlinesEmitter.on("newNews",
//     async (news, coin) => {
//         await insertHeadlines(news, coin)
//         console.log(`New headlines for ${coin} inserted into Mongo at: ${new Date()}`);
//     });

// Authentication Settings
const TOKEN_SECRET = process.env.TOKEN_SECRET || 'abcd1234'

const mkAuth = (passport) => {
    return (req, resp, next) => {
        passport.authenticate('local',
            (err, user, info) => {
                if ((null != err) || (!user)) {
                    resp.status(401)
                    resp.type('application/json')
                    resp.json({ error: err })
                    return
                }
                // attach user to the request object
                req.user = user
                next()
            }
        )(req, resp, next)
    }
}

passport.use(
    new LocalStrategy(
        { usernameField: 'username', passwordField: 'password' },
        async (user, password, done) => {
            // perform the authentication
            console.info(`LocalStrategy> username: ${user}, password: ${password}`)
            const conn = await pool.getConnection()
            try {
                const [ result, _ ] = await conn.query(SQL_SELECT_USER, [ user, password ])
                console.info('>>> result: ', result)
                if (result.length > 0)
                    done(null, {
                        username: result[0].user_id,
                        avatar: `https://i.pravatar.cc/400?u=${result[0].email}`,
                        loginTime: (new Date()).toString()
                    })
                else
                    done('Incorrect login', false)
            } catch(e) {
                done(e, false)
            } finally {
                conn.release()
            }
        }
    )
)

const localStrategyAuth = mkAuth(passport)

app.use(passport.initialize())

// Chat WebSockets
const ROOM = {
    bitcoin: {},
    ethereum: {},
    sushiswap: {}
}

app.ws('/chat/:coin', (ws, req) => {
    const name = req.query.name
    let coin = req.params.coin

    console.info(`New websocket connection: ${name}`, ROOM)

    ws.participantName = name
    ROOM[coin][name] = ws

    ws.on('message', (payload) => {
        console.info('>>> payload: ', payload)
        const chat = JSON.stringify({
            from: name,
            message: payload,
            timestamp: (new Date()).toString()
        })
        for (let p in ROOM[coin])
            ROOM[coin][p].send(chat)
    })

    ws.on('close', () => {
        console.info(`Closing websocket connection for ${name}`)
        ROOM[coin][name].close()
        delete ROOM[coin][name]
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

app.post('/login',
    // passport middleware to perform login
    // passport.authenticate('local', { session: false }),
    // authenticate with custom error handling
    localStrategyAuth,
    (req, resp) => {
        // do something
        console.info(`user: `, req.user)
        // generate JWT token
        const timestamp = (new Date()).getTime() / 1000
        const token = jwt.sign({
            sub: req.user.username,
            iss: 'myapp',
            iat: timestamp,
            //nbf: timestamp + 30,
            exp: timestamp + (60 * 60),
            data: {
                avatar: req.user.avatar,
                loginTime: req.user.loginTime
            }
        }, TOKEN_SECRET)

        resp.status(200)
        resp.type('application/json')
        resp.json({message: `Login in at ${new Date()}`, token})
    }
)

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
