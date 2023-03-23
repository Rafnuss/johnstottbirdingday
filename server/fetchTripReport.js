const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
const fs = require('fs');
const google_api_key = "AIzaSyCaVWdIpSvq8BoF7PvEK4oY3LByPYTQ2Xs";

async function fetchUserData() {
    const response = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/1GtyqPSkGOwpwHsez6kc4KWx_n2nMu45iMPf5sJHsBXc/values/A1:F100?key=${google_api_key}`);
    const data = await response.json();
    const rows = data.values.slice(1);
    const user = rows.map((row) => {
        return {
            email: row[1],
            name: row[2],
            party: row[3],
            tripreport: row[4].replace("https://ebird.org/tripreport/", "").replace("/", "?tripReportPersonId="),
            profile: row[5]
        };
    });
    return user
}

// Call the function and use the returned data
async function fetchTripReport(timeout = 5000, callback) {
    console.log(callback)
    try {
        const user = await fetchUserData();
        console.log("spreadsheet read: ")
        console.log(user)

        let checklists = [];
        let taxons = [];

        for (let i = 0; i < user.length; i++) {
            console.log("fetching: " + user[i].name)
            console.log("waiting " + timeout / 1000 + "sec...")
            await new Promise((resolve) => setTimeout(resolve, timeout)); // Wait 30 seconds

            const num_sp_res = await fetch("http://tripreport.raphaelnussbaumer.com/tripreport-internal/v1/num-species/" + user[i].tripreport)
            user[i].num_sp = await num_sp_res.json();
            console.log("- fetched number of species")

            const check_res = await fetch("http://tripreport.raphaelnussbaumer.com/tripreport-internal/v1/checklists/" + user[i].tripreport)
            let check_data = await check_res.json();
            check_data = check_data.map(c => {
                c.user = user[i].name
                return c
            })
            user[i].countryCode = [...new Set(check_data.map(c => c.loc.countryCode))]
            user[i].num_checklist = check_data.length
            checklists = [...checklists, ...check_data];
            console.log("- fetched checklists")

            const tax_res = await fetch("http://tripreport.raphaelnussbaumer.com/tripreport-internal/v1/taxon-list/" + user[i].tripreport)
            let tax_data = await tax_res.json();
            tax_data = tax_data.filter(s => {
                return s.category == "species" & (!s.hasOwnProperty("exoticCategory") || s.exoticCategory != "X")
            }).map(s => s.speciesCode)
            taxons = [...taxons, ...tax_data];
            console.log("- fetched taxons")
            /*
            const file2 = 'taxon-list/' + user[i].tripreport + '.json'
            fs.writeFile(file2, JSON.stringify(data2), (err) => {
                if (err)
                    console.log(err);
                else {
                    console.log("File " + file2 + " written successfully\n");
                }
            });
            */
        }
        console.log("\n-> fetched all data\n")

        fs.writeFile("checklists.json", JSON.stringify(checklists), (err) => {
            if (err)
                console.log(err);
            else {
                console.log("File checklists.json written successfully");
            }
        });

        await fs.writeFile("user.json", JSON.stringify(user), (err) => {
            if (err)
                console.log(err);
            else {
                console.log("File user.json written successfully");
            }
        });

        const info = {
            counterSpecies: [...new Set(taxons)].length,
            counterParticipants: user.reduce((acc, u) => acc + parseFloat(u.party), 0),
            counterCountries: [...new Set(user.map(u => u.countryCode))].length,
            //counterHours:,
            counterChecklists: checklists.length,
            lastUpdated: new Date()
        }

        await fs.writeFile("info.json", JSON.stringify(info), (err) => {
            if (err)
                console.log(err);
            else {
                console.log("File info.json written successfully");
            }
        });
        callback(null);
    } catch (error) {
        // handle any errors that occurred during the asynchronous operation
        callback(error);
    }
}
/*
fetchTripReport(2000, (status) => {
    if (status == null) {
        console.log("Ok")
    } else {
        console.log(status)
    }
});
*/
// add the code below
module.exports = { fetchTripReport };