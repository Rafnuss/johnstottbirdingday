const fetch = (...args) => import("node-fetch").then(({ default: fetch }) => fetch(...args));
const { writeFile } = require("fs/promises");
const path = require("path");

const GOOGLE_API_KEY = "AIzaSyCaVWdIpSvq8BoF7PvEK4oY3LByPYTQ2Xs";
const GOOGLE_SHEET_ID = "1GtyqPSkGOwpwHsez6kc4KWx_n2nMu45iMPf5sJHsBXc";
const TRIPREPORT_API_BASE = "http://tripreport.raphaelnussbaumer.com/tripreport-internal/v1";
const CURRENT_YEAR = String(new Date().getFullYear());

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function normalizeTripReport(url = "") {
  return url.replace("https://ebird.org/tripreport/", "").replace("/", "?tripReportPersonId=");
}

async function fetchJson(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

async function fetchUserData(year = CURRENT_YEAR) {
  const data = await fetchJson(
    `https://sheets.googleapis.com/v4/spreadsheets/${GOOGLE_SHEET_ID}/values/A1:F100?key=${GOOGLE_API_KEY}`,
  );
  const rows = data.values?.slice(1) ?? [];

  return rows
    .map((row) => ({
      email: row[1],
      name: row[2],
      party: row[3],
      tripreport: normalizeTripReport(row[4]),
      profile: row[5],
      year: row[0]?.substring(6, 10),
    }))
    .filter((user) => user.year === year);
}

async function fetchTripReportData(user) {
  const [numSpecies, checklistData, taxonData] = await Promise.all([
    fetchJson(`${TRIPREPORT_API_BASE}/num-species/${user.tripreport}`),
    fetchJson(`${TRIPREPORT_API_BASE}/checklists/${user.tripreport}`),
    fetchJson(`${TRIPREPORT_API_BASE}/taxon-list/${user.tripreport}`),
  ]);

  const checklists = checklistData.map((checklist) => ({
    ...checklist,
    user: user.name,
  }));

  const taxons = taxonData
    .filter(
      (species) =>
        species.category === "species" &&
        (!Object.prototype.hasOwnProperty.call(species, "exoticCategory") ||
          species.exoticCategory !== "X"),
    )
    .map((species) => species.speciesCode);

  return {
    ...user,
    num_sp: numSpecies,
    countryCode: [...new Set(checklists.map((checklist) => checklist.loc.countryCode))],
    num_checklist: checklists.length,
    checklists,
    taxons,
  };
}

async function fetchTripReport(timeout = 5000, callback = () => {}) {
  try {
    const users = await fetchUserData();
    console.log("spreadsheet read:");
    console.log(users);

    const completedUsers = [];
    const checklists = [];
    const taxons = [];

    for (const user of users) {
      console.log(`fetching: ${user.name}`);
      console.log(`waiting ${timeout / 1000}sec...`);
      await sleep(timeout);

      try {
        const tripReportData = await fetchTripReportData(user);
        completedUsers.push({
          email: tripReportData.email,
          name: tripReportData.name,
          party: tripReportData.party,
          tripreport: tripReportData.tripreport,
          profile: tripReportData.profile,
          year: tripReportData.year,
          num_sp: tripReportData.num_sp,
          countryCode: tripReportData.countryCode,
          num_checklist: tripReportData.num_checklist,
        });
        checklists.push(...tripReportData.checklists);
        taxons.push(...tripReportData.taxons);
        console.log("- fetched trip report data");
      } catch (error) {
        console.log(`Error with ${user.name}:`);
        console.log(error);
      }
    }

    console.log("\n-> fetched all data\n");

    const info = {
      counterSpecies: new Set(taxons).size,
      counterParticipants: completedUsers.reduce((acc, user) => acc + parseFloat(user.party || 0), 0),
      counterCountries: new Set(
        completedUsers.flatMap((user) => user.countryCode || []),
      ).size,
      counterChecklists: checklists.length,
      lastUpdated: new Date(),
    };

    await Promise.all([
      writeFile(path.join(__dirname, "checklists.json"), JSON.stringify(checklists)),
      writeFile(path.join(__dirname, "user.json"), JSON.stringify(completedUsers)),
      writeFile(path.join(__dirname, "info.json"), JSON.stringify(info)),
    ]);

    callback(null);
  } catch (error) {
    callback(error);
  }
}

if (require.main === module) {
  fetchTripReport(2000, (status) => {
    if (status == null) {
      console.log("Ok");
    } else {
      console.log(status);
    }
  });
}

module.exports = { fetchTripReport };
