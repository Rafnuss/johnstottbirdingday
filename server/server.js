const express = require('express')
const fs = require('fs');
const port = 8081;
const app = express()


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

app.listen(port, () => console.log(`johnstottbirding app listening on port ${port}!`));
