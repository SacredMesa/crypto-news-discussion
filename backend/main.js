// Libraries
const express = require('express');
const dotenv = require('dotenv');
dotenv.config();
const fetch = require('node-fetch');
const withQuery = require('with-query').default;

const morgan = require('morgan');

// Instances
const app = express();

// Environment
const PORT = parseInt(process.argv[2] || process.env.PORT) || 3000;
const ENDPOINT = 'http://api.datanews.io/v1/headlines'
const HEADERS = {
    "x-api-key": process.env.API_KEY
}

// API query
const getHeadlines = async (coin) => {
    const url = withQuery(
        ENDPOINT, {
            q: coin || "",
            sortBy: "date",
            size: 3
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

// Request Handlers

app.get('/headlines/:coin', async (req, res) => {

    let coinName = req.params.coin

    try {
        const resultsRaw = await getHeadlines(coinName);

        console.log(resultsRaw)

        const status = resultsRaw.status;
        const results = resultsRaw.hits;

        res.status(status);
        res.type('application/JSON');
        res.json(results)
    } catch (e) {
        console.info(e)
        res.status(500);
        res.type('text/html');
        res.send(JSON.stringify(e));
    }

})

// Start Server
app.listen(PORT, () => {
    console.log(`listening on port ${PORT} at ${new Date()}`);
})
