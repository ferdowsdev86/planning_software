const
    express          = require('express'),
    app              = express(),
    port             = 3000,
    cors             = require('cors'),
    bodyParser       = require('body-parser'),
    sessions         = require('express-session'),
    { readFileSync } = require('fs'),
    fakeDelay        = 250;

app.use(cors({ origin : 'http://localhost', credentials : true }));
app.use(bodyParser.json());
app.use(sessions({
    secret            : 'bryntum',
    saveUninitialized : true,
    resave            : false
}));

// Saving each user session data in a shared variable.
// Much more performant than saving directly in the session.
const
    sessionData = {},
    // Used to filter the in-memory "database" by different "operators"
    filterEvaluators = {
        '*' : (a, b) => filterEvaluators['='](a, b) || a?.toString().includes(b),
        '=' : (a, b) => a === b,
        '>' : (a, b) => a > b,
        '<' : (a, b) => a < b
    };

// Use to get data, either saved in the current session or from the data file
const getData = (req) => {
    // Demo data is saved with the session
    if (!sessionData[req.sessionID]) {
        sessionData[req.sessionID] = {};
        checkSessions(req);
    }

    if (!sessionData[req.sessionID].resources) {
        Object.assign(sessionData[req.sessionID], {
            resources  : JSON.parse(readFileSync('../data/resources.json')),
            events     : JSON.parse(readFileSync('../data/events.json')),
            timeRanges : JSON.parse(readFileSync('../data/timeranges.json'))
        });
    }
    return sessionData[req.sessionID];
};

// Used to clear the "memory" of old sessions
const checkSessions = (req) => {
    for (const [sessionID, session] of Object.entries(sessionData)) {
        // Extend life of current session
        if (sessionID === req.sessionID) {
            session.expires = new Date().getTime() + (1000 * 60 * 60 * 2);
        }
        // Non-current session has expired, clear the saved data
        else if (session.expires < new Date().getTime()) {
            sessionData[sessionID] = undefined;
            //console.log(`Session ${sessionID} expired`);
        }
    }
};

// Use to sort the in-memory "database" on different fields.
// The default sorting is ascending sortIndex
function sortData(req, data, field = 'sortIndex', ascending = true) {
    data.sort((a, b) => a[field] > b[field] ? ascending ? 1 : -1 : ascending ? -1 : 1);
    sessionData[req.sessionID].dataIsSorted = arguments.length > 1;
}

// Separate function to get resources as it is used not only when reading resources, but also when reading events and
// resourceTimeRanges
function getResources(req, startIndex, count, sorters, filters) {
    let { resources } = getData(req);

    if (sorters?.length) {
        // Each object has 2 properties, field (string) and ascending (boolean)
        for (const { ascending, field } of sorters) {
            sortData(req, resources, field, ascending);
        }

    }
    // If no sorters, sort with default values
    else if (req.session.dataIsSorted) {
        sortData(req, resources);
    }

    if (filters?.length) {
        // Each filter object has 4 properties:
        // * field (string)
        // operator (=,*,>,< supported in this backend)
        // value
        // caseSensitive (boolean)
        for (const { field, operator, value, caseSensitive } of filters) {
            const
                evaluator   = filterEvaluators[operator], // The evaluation function matching current operator
                filterValue = caseSensitive ? value : value?.toLowerCase?.();

            resources = resources.filter(r =>
                evaluator(caseSensitive ? r[field] : r[field]?.toLowerCase?.(), filterValue, caseSensitive));
        }
    }

    return {
        total : resources.length,
        data  : resources.slice(startIndex, startIndex * 1 + count)
    };
}

app.get('/read-resources', async(req, res) => {
    const
        // Params provided by the client
        startIndex = parseInt(req.query.startIndex),
        count      = parseInt(req.query.count),
        sorters    = req.query.sort ? JSON.parse(req.query.sort) : null,
        filters    = req.query.filter ? JSON.parse(req.query.filter) : null,
        result     = getResources(req, startIndex, count);

    await new Promise(resolve => setTimeout(resolve, fakeDelay));

    // Return the expected JSON response
    res.json({
        success : true,
        ...result
    });
});

app.post('/create-resources', async(req, res) => {
    const
        { resources } = getData(req),
        records       = req.body.data; // We get the added records as an array of objects
    let maxId         = resources.reduce((acc, r) => r.id > acc ? r.id : acc, 0);

    // Create unique id's for all added records
    records.forEach(r => r.id = maxId += 1);

    // Add the records to the session "database"
    resources.push(...records);

    sortData(req, resources);

    await new Promise(resolve => setTimeout(resolve, fakeDelay));

    // Return the expected JSON response
    res.json({
        success : true,
        data    : records
    });
});

app.post('/delete-resources', async(req, res) => {
    const
        { ids }       = req.body, // We get the id's to delete as an array
        { resources } = getData(req);

    // Remove records from the session "database"
    for (const id of ids) {
        resources.splice(resources.findIndex(r => r.id === id), 1);
    }

    await new Promise(resolve => setTimeout(resolve, fakeDelay));

    // Return the expected JSON response
    res.json({
        success : true
    });
});

app.post('/update-resources', async(req, res) => {
    const
        records        = req.body.data, // We get the modified records as an array of objects
        updatedRecords = [],
        { resources }  = getData(req);

    while (records.length) {
        const record = resources.find(r => r.id === records[0].id);

        Object.assign(record, records.shift());

        // Keep track of the modified records, they need to be a part of the response sent to the client
        updatedRecords.push(record);
    }

    await new Promise(resolve => setTimeout(resolve, fakeDelay));

    // Return the expected JSON response
    res.json({
        success : true,
        data    : updatedRecords
    });
});

app.get('/read-events', async(req, res) => {
    const
        { query }   = req,
        // Params provided by the client
        startIndex  = parseInt(query.startIndex),
        count       = parseInt(query.count),
        startDate   = new Date(query.startDate),
        endDate     = new Date(query.endDate),
        sorters     = req.query.sort ? JSON.parse(req.query.sort) : null,
        filters     = req.query.filter ? JSON.parse(req.query.filter) : null,
        { events }  = getData(req),
        resources   = getResources(req, startIndex, count, sorters, filters).data,
        resourceIds = resources.map(r => r.id);

    await new Promise(resolve => setTimeout(resolve, fakeDelay));

    // Return the expected JSON response
    res.json({
        success : true,
        data    : events.filter(r => resourceIds.includes(r.resourceId)).filter(r => {
            const
                rStart = new Date(r.startDate),
                rEnd   = new Date(r.endDate);

            return (rStart >= startDate && rStart <= endDate) || (rEnd >= startDate && rEnd <= endDate);
        })
    });
});

app.post('/create-events', async(req, res) => {
    const
        { events } = getData(req),
        records    = req.body.data; // We get the added records as an array of objects
    let maxId      = events.reduce((acc, r) => r.id > acc ? r.id : acc, 0);

    // Create unique id's for all added records
    records.forEach(r => r.id = maxId += 1);

    // Add the records to the session "database"
    events.push(...records);

    await new Promise(resolve => setTimeout(resolve, fakeDelay));

    // Return the expected JSON response
    res.json({
        success : true,
        data    : records
    });
});

app.post('/delete-events', async(req, res) => {
    const
        { ids }    = req.body, // We get the id's to delete as an array
        { events } = getData(req);

    // Remove records from the session "database"
    for (const id of ids) {
        events.splice(events.findIndex(r => r.id === id), 1);
    }

    await new Promise(resolve => setTimeout(resolve, fakeDelay));

    // Return the expected JSON response
    res.json({
        success : true
    });
});

app.post('/update-events', async(req, res) => {
    const
        records        = req.body.data, // We get the modified records as an array of objects
        updatedRecords = [],
        { events }     = getData(req);

    while (records.length) {
        const record = events.find(r => r.id === records[0].id);

        Object.assign(record, records.shift());

        // Keep track of the modified records, they need to be a part of the response sent to the client
        updatedRecords.push(record);
    }

    await new Promise(resolve => setTimeout(resolve, fakeDelay));

    // Return the expected JSON response
    res.json({
        success : true,
        data    : updatedRecords
    });
});

app.get('/read-resourcetimeranges', async(req, res) => {
    const
        { query }      = req,
        // Params provided by the client
        startIndex     = parseInt(query.startIndex),
        count          = parseInt(query.count),
        startDate      = new Date(query.startDate),
        endDate        = new Date(query.endDate),
        sorters        = req.query.sort ? JSON.parse(req.query.sort) : null,
        filters        = req.query.filter ? JSON.parse(req.query.filter) : null,
        { timeRanges } = getData(req),
        resources      = getResources(req, startIndex, count, sorters, filters),
        resourceIds    = resources.map(r => r.id);

    // Return the expected JSON response
    res.json({
        success : true,
        data    : timeRanges.filter(r => resourceIds.includes(r.resourceId)).filter(r => {
            const
                rStart = new Date(r.startDate),
                rEnd   = new Date(r.endDate);

            return (rStart >= startDate && rStart <= endDate) || (rEnd >= startDate && rEnd <= endDate);
        })
    });
});

app.listen(port, () => {
    console.log(`Bryntum Infinite scroll demo backend running on http://localhost:${port}`);
});
