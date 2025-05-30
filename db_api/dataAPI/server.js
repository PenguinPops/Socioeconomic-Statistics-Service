const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const axios = require('axios');
const { MongoClient, ServerApiVersion, Int32 } = require("mongodb");
const promClient = require('prom-client');

const register = new promClient.Registry();

register.setDefaultLabels({
    app: 'data-api'
});

promClient.collectDefaultMetrics({ register });

const httpRequestDurationMicroseconds = new promClient.Histogram({
    name: 'http_request_duration_seconds',
    help: 'Duration of HTTP requests in seconds',
    labelNames: ['method', 'route', 'code'],
    buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10]
});

register.registerMetric(httpRequestDurationMicroseconds);

const app = express();
const port = 3018;

app.use((req, res, next) => {
    const end = httpRequestDurationMicroseconds.startTimer();
    res.on('finish', () => {
        end({ method: req.method, route: req.route.path, code: res.statusCode });
    });
    next();
});

app.get('/metrics', async (req, res) => {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
});


app.use(cors());
app.use(bodyParser.json());

const uri = "mongodb://admin:secret@mongodb:27017/statsdb?authSource=admin";
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

let dbClient;

async function connectToDatabase() {
    try {
        dbClient = await client.connect();
        console.log("Connected to MongoDB! ✅");
    } catch (err) {
        console.error("Connection error ❌:", err);
        throw err;
    }
}

connectToDatabase().catch(console.error);

//API routes

function getCollectionName(stat) {
    switch (stat) {
        case "pkb": return "PKB";
        case "inflation": return "Inflacja";
        case "minimal": return "Minimalna";
        case "avg": return "Srednia";
        default: throw new Error(`Unknown stat: ${stat}`);
    }
}

// GET stat by year
// Example: /api/stats/pkb/year/2020

app.get('/api/stats/:stat/year/:year', async (req, res) => {
    const { stat, year } = req.params;

    try {
        const collectionName = getCollectionName(stat);
        const collection = dbClient.db("Stats").collection(collectionName);

        const result = await collection.aggregate([
            { $match: { "year": year.toString() } },
            { $project: { _id: 0, value: "$val" } }
        ]).toArray();

        if (result.length > 0) {
            res.json({ stat, year, value: result[0].value });
        } else {
            res.status(404).json({ error: `No data found for ${stat} in year ${year}` });
        }
    } catch (error) {
        console.error(`Error fetching ${stat} for year ${year}:`, error);
        res.status(500).json({ error: error.message });
    }
});

// GET stat by range
// Example: /api/stats/pkb/range/2000/2020

app.get('/api/stats/:stat/range/:startYear/:endYear', async (req, res) => {
    const { stat, startYear, endYear } = req.params;

    try {
        const collectionName = getCollectionName(stat);
        const collection = dbClient.db("Stats").collection(collectionName);

        const result = await collection.aggregate([
            { $match: { "year": { $gte: startYear.toString(), $lte: endYear.toString() } } },
            { $project: { _id: 0, year: "$year", value: "$val" } }
        ]).toArray();

        if (result.length > 0) {
            res.json({
                stat,
                range: `${startYear}-${endYear}`,
                data: result
            });
        } else {
            res.status(404).json({ error: `No data found for ${stat} between ${startYear} and ${endYear}` });
        }
    } catch (error) {
        console.error(`Error fetching ${stat} for range ${startYear}-${endYear}:`, error);
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/events/year/:year', async (req, res) => {
    const { year } = req.params;

    try {
        const collection = dbClient.db("Events").collection("events");

        const result = await collection.aggregate([
            { $match: { year: Number(year) } }
        ]).toArray();

        const placements = result[0].events.map(event => ({
            ...event,
            placement: ((parseInt(event.date.split("-")[1]) * 30 + parseInt(event.date.split('-')[2])) / 361).toFixed(3)

        }));

        return res.json({
            year: year,
            events: placements
        });

    } catch (error) {
        console.error(`Error fetching events for year ${year}:`, error);
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/events/range/:startYear/:endYear', async (req, res) => {
    const { startYear, endYear } = req.params;

    try {
        const collection = dbClient.db("Events").collection("events");

        // Get all matching years
        const result = await collection.aggregate([
            { $match: { year: { $gte: Number(startYear), $lte: Number(endYear) } } }
        ]).toArray();

        // Flatten all events into a single array and add placement
        const allEvents = result.flatMap(yearDoc =>
            yearDoc.events.map(event => ({
                ...event,
                year: yearDoc.year, // Include year for reference
                placement: ((parseInt(event.date.split("-")[1] - 1) * 30 + parseInt(event.date.split("-")[2])) / 361).toFixed(3)
            })
            ));

        return res.json({
            range: `${startYear}-${endYear}`,
            events: allEvents
        });

    } catch (error) {
        console.error(`Error fetching events for range ${startYear}-${endYear}:`, error);
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/gus/retirement/types', async (req, res) => {
    try {
        const response = await axios.get('https://bdl.stat.gov.pl/api/v1/Variables?subject-id=P2860');
        const data = response.data;
        const result = {};
        data.results.forEach(item => {
            result[item.id] = item.n1;
        });
        res.json(result);
    } catch (error) {
        console.error('Error fetching retirement types:', error);
        res.status(500).json({ error: 'Failed to fetch retirement types' });
    }
});

app.get('/api/gus/retirement/:id/year/:year', async (req, res) => {
    const { id, year } = req.params;
    try {
        const response = await axios.get(`https://bdl.stat.gov.pl/api/v1/data/by-unit/000000000000?var-id=${id}`);
        const data = response.data;

        const values = data.results[0].values;
        const yearData = values.find(item => item.year === year);

        return res.json({
            id: id,
            year: year,
            value: yearData.val
        });
    } catch (error) {
        console.error('Error fetching data from BDL:', error);
        if (error.response && error.response.status === 404) {
            res.status(404).json({ error: `Variable with ID ${id} not found` });
        } else {
            res.status(500).json({ error: 'Failed to fetch data from BDL API' });
        }
    }
});

app.get('/api/gus/retirement/:id/range/:startYear/:endYear', async (req, res) => {
    const { id, startYear, endYear } = req.params;
    try {
        const response = await axios.get(`https://bdl.stat.gov.pl/api/v1/data/by-unit/000000000000?var-id=${id}`);
        const data = response.data;

        const values = data.results[0].values;
        const filteredValues = values.filter(item => item.year >= startYear && item.year <= endYear);

        return res.json({
            id: id,
            range: `${startYear}-${endYear}`,
            data: filteredValues
        });
    } catch (error) {
        console.error('Error fetching data from BDL:', error);
        if (error.response && error.response.status === 404) {
            res.status(404).json({ error: `Variable with ID ${id} not found` });
        } else {
            res.status(500).json({ error: 'Failed to fetch data from BDL API' });
        }
    }
});

app.get('/', (req, res) => {
    res.send('Stats API is running');
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

process.on('SIGINT', async () => {
    if (dbClient) {
        await dbClient.close();
        console.log("Database connection closed.");
    }
    process.exit(0);
});