// Libraries
const express = require('express');
const fetch = require('node-fetch');
const withQuery = require('with-query').default;
const EventEmitter = require("events");
const expressWS = require('express-ws');

const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const jwt = require('jsonwebtoken')
const nodemailer = require('nodemailer');

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
app.use(morgan('combined'));
app.use(express.json())
app.use(express.urlencoded({extended: true}))

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

const SQL_SELECT_USER = 'select email, nickname from user where email = ? and password = sha1(?)';
const SQL_REGISTER_USER = 'insert into user(email, password, nickname) values (?, sha1(?), ?)';

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

const insertMessage = (doc, col) => {
    mongoClient.db(MONGO_DB).collection(col)
        .insertOne(doc);
}

// Nodemailer
const transporter = nodemailer.createTransport({
    service: '"SendinBlue"',
    auth: {
        user: process.env.EMAIL_ADDRESS,
        pass: process.env.EMAIL_PASSWORD
    }
});

const welcomeMail = (recipient) => {
    return{
        from: process.env.EMAIL_ADDRESS,
        to: recipient.email,
        subject: 'Ready for some Alphas?',
        html: `<b>Welcome to OctoBus! Login today and get the alphas you need to ride your way to the moon</b><br><hr>
            Username: <b>${recipient.username}</b><br>
            Created on: <b>${new Date()}</b>`
    }
};

const sendMail = (recipient) => {
    const mail = welcomeMail(recipient)
    transporter.sendMail(mail, (error, info) => {
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });
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

const headlinesEmitter = new EventEmitter();

setInterval(async () => {

    for (let i = 0; i < featuredCoins.length; i++) {
        const resultsRaw = await getHeadlines(featuredCoins[i]);

        const formattedResults = []

        for (let x = 0; x < resultsRaw.hits.length; x++) {
            formattedResults.push(
                {
                    pubDate: new Date(resultsRaw.hits[x].pubDate).toLocaleDateString(),
                    pubTime: new Date(resultsRaw.hits[x].pubDate).toLocaleTimeString([], { hour12: false }),
                    title: resultsRaw.hits[x].title,
                    source: resultsRaw.hits[x].source,
                    url: resultsRaw.hits[x].url
                }
            )
        }
        headlinesEmitter.emit("newNews", formattedResults, featuredCoins[i]);
    }
}, 3600000);

headlinesEmitter.on("newNews",
    async (news, coin) => {
        await insertHeadlines(news, coin)
        console.log(`New headlines for ${coin} inserted into Mongo at: ${new Date()}`);
    });

// Authentication Settings
const TOKEN_SECRET = process.env.TOKEN_SECRET

const mkAuth = (passport) => {
    return (req, res, next) => {
        passport.authenticate('local',
            (err, user, info) => {
                if ((null != err) || (!user)) {
                    res.status(401)
                    res.type('application/json')
                    res.json({error: err})
                    return
                }
                // attach user to the request object
                req.user = user
                next()
            }
        )(req, res, next)
    }
}

passport.use(
    new LocalStrategy(
        {usernameField: 'username', passwordField: 'password'},
        async (user, password, done) => {
            // perform the authentication
            console.log(`LocalStrategy> username: ${user}, password: ${password}`);
            const conn = await pool.getConnection();
            try {
                const [result, _] = await conn.query(SQL_SELECT_USER, [user, password]);
                console.log('>>> result: ', result);
                if (result.length > 0) {
                    done(null, {
                        email: result[0].email,
                        nickname: result[0].nickname,
                        loginTime: (new Date()).toString()
                    });
                } else
                    done('Incorrect login', false);
            } catch (e) {
                done(e, false);
            } finally {
                conn.release();
            }
        }
    )
)

passport.use(
    new GoogleStrategy({
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: "https://octobus.herokuapp.com/auth/google/callback"
        },
        (accessToken, refreshToken, profile, cb) => {
            User.findOrCreate({googleId: profile.id},
                (err, user) => {
                    return cb(err, user);
                }
            );
        }
    )
);

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
    let mongoCoinMsgCol = `${coin}-messages`

    console.info(`New websocket connection: ${name}`, ROOM)

    ws.participantName = name
    ROOM[coin][name] = ws

    ws.on('message', async (payload) => {
        console.info('>>> payload: ', payload)
        const chat = JSON.stringify({
            from: name,
            message: payload,
            timestamp: (new Date()).toString()
        })
        for (let p in ROOM[coin]) {
            ROOM[coin][p].send(chat)
        }
        await insertMessage(JSON.parse(chat), mongoCoinMsgCol)
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

app.get('/messages/pull/:coin', async (req, res) => {
    let coinName = req.params.coin
    try {
        const messages = (await mongoClient.db(MONGO_DB)
            .collection(`${coinName}-messages`)
            .find({})
            .toArray())
        res.status(200);
        res.type('application/JSON');
        res.json(messages)
    } catch (e) {
        console.info(e)
        res.status(500);
        res.type('text/html');
        res.send(JSON.stringify(e));
    }
})


app.post('/login',
    localStrategyAuth, (req, res) => {
        console.info(`user: `, req.user)
        const timestamp = (new Date()).getTime() / 1000
        const token = jwt.sign({
            sub: req.user.username,
            iss: 'OctoBu$-Backend',
            iat: timestamp,
            exp: timestamp + (60 * 60),
            data: {
                avatar: req.user.avatar,
                loginTime: req.user.loginTime
            }
        }, TOKEN_SECRET)

        res.status(200)
        res.type('application/json')
        res.json({message: `Login in at ${new Date()}`, token, nickname: req.user.nickname})
    }
)

app.get('/auth/google',
    passport.authenticate('google', {scope: ["email"]})
)

app.get("/auth/google/callback", passport.authenticate('google'),
    (req, resp) => {
        const token = generateJWT(req)
        if (token) {
            let responseHTML = '<html><head><title>Main</title></head><body></body><script>res = %value%; window.opener.postMessage(res, "*");window.close();</script></html>'
            responseHTML = responseHTML.replace('%value%', JSON.stringify({
                user: req.user.username,
                token
            }));
            resp.status(200).send(responseHTML);
        }
    });

app.post('/register', async (req, res) => {

    console.log("incoming registration body: ", req.body);

    const conn = await pool.getConnection();
    try {
        const [result, _] = await conn.query(
            SQL_REGISTER_USER,
            [req.body.username, req.body.password, req.body.nickname]
        )

        const email = req.body.username;
        const nick = req.body.nickname;


        console.log('>>>REGISTRATION RESULTS: ', result);

        sendMail({email, nick})

        res.status(200)
        res.type('application/json')
        res.json('registration worked. Please now login')
    } catch (e) {
        console.log('Something went wrong: ', e)
        res.status(409)
        res.type('application/json')
        res.json(JSON.stringify(e))
    } finally {
        conn.release();
    }
});

app.post('/verify', (req, res) => {
    const token = req.body.token
    console.log('token: ', token)
    try {
        const verified = jwt.verify(token, TOKEN_SECRET)
        console.info(`Verified token`, verified)
        req.token = verified
        res.status(200)
        res.type('application/json')
        res.json(verified)
    } catch (e) {
        res.status(403)
        res.json({message: 'Forbidden!', error: e})
        return
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
