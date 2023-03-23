const express = require('express')
const fs = require('fs');
const fetchtripreport = require('./fetchTripReport')
const port = 8081;
const app = express()

//fetchtripreport.fetchTripReport(2000)

app.get('/fetch', async (req, res) => {
    res.sendFile(__dirname + "/fetch.html");
});

app.get("/fetch-start", (req, res) => {
    const startTime = new Date().toISOString()
    fetchtripreport.fetchTripReport(3000, (status) => {
        if (status == null) {
            const logMessage = `${startTime} - Fetching Sucess\n`;
            fs.appendFile('log.txt', logMessage, () => { });
            res.send({ response: logMessage });
        } else {
            const logMessage = `${startTime} - Fetching failed: ${status}\n`;
            fs.appendFile('log.txt', logMessage, () => { });
            res.send({ response: logMessage });
        }
    });
});

app.get('/user', async (req, res) => {
    const user = fs.readFileSync("user.json")
    const jsonUser = JSON.parse(user.toString());
    res.json(jsonUser);
});

app.get('/checklist', async (req, res) => {
    const checklists = fs.readFileSync("checklists.json")
    const jsonChecklists = JSON.parse(checklists.toString());
    res.json(jsonChecklists);
});

app.get('/info', async (req, res) => {
    const info = fs.readFileSync("info.json")
    const jsonInfo = JSON.parse(info.toString());
    res.json(jsonInfo);
});

app.get('/log', async (req, res) => {
    const log = fs.readFileSync("log.txt")
    res.send(log);
});

app.listen(port, () => console.log(`johnstottbirding app listening on port ${port}!`));
