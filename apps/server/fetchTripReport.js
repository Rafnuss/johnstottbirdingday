const fetch = (...args) => import("node-fetch").then(({ default: fetch }) => fetch(...args));
const { appendFile, writeFile } = require("fs/promises");
const path = require("path");

const GOOGLE_API_KEY = "AIzaSyCaVWdIpSvq8BoF7PvEK4oY3LByPYTQ2Xs";
const GOOGLE_SHEET_ID = "1GtyqPSkGOwpwHsez6kc4KWx_n2nMu45iMPf5sJHsBXc";
const TRIPREPORT_API_BASE = "http://tripreport.raphaelnussbaumer.com/tripreport-internal/v1";
const CURRENT_YEAR = String(new Date().getFullYear());

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getRunSource(source) {
  if (source === "manual-ui" || source === "manual") return "manual";
  if (source === "pm2" || source === "auto") return "auto";
  if (process.env.pm_id != null) return "auto";
  return "manual-cli";
}

function formatLogTimestamp(date = new Date()) {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  const hours = String(date.getUTCHours()).padStart(2, "0");
  const minutes = String(date.getUTCMinutes()).padStart(2, "0");
  const seconds = String(date.getUTCSeconds()).padStart(2, "0");

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds} UTC`;
}

function emitProgress(options, message) {
  console.log(message);
  options.onProgress?.(message);
}

async function appendActivityLog({ finishedAt, success, durationSeconds, source, error }) {
  const statusLabel = success ? "success" : "failed";
  const suffix = success ? "" : `: ${error}`;
  const line =
    `${finishedAt} - [${source}] Fetching ${statusLabel} (${durationSeconds}s)${suffix}\n`;

  await appendFile(path.join(__dirname, "log.txt"), line);
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
    `https://sheets.googleapis.com/v4/spreadsheets/${GOOGLE_SHEET_ID}/values/A:F?key=${GOOGLE_API_KEY}`,
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

async function fetchTripReport(timeout = 5000, callback = () => {}, options = {}) {
  const source = getRunSource(options.source);
  const startedMs = Date.now();

  try {
    const users = await fetchUserData();
    emitProgress(options, `Loaded ${users.length} participant rows for ${CURRENT_YEAR}.`);

    const completedUsers = [];
    const checklists = [];
    const taxons = [];

    for (const [index, user] of users.entries()) {
      const stepLabel = `[${index + 1}/${users.length}] ${user.name}`;
      emitProgress(options, `${stepLabel} - fetching trip report`);
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
        emitProgress(
          options,
          `${stepLabel} - done: ${tripReportData.num_sp} species, ${tripReportData.num_checklist} checklists`,
        );
      } catch (error) {
        emitProgress(options, `${stepLabel} - failed: ${error}`);
      }
    }

    emitProgress(options, "All trip report requests completed.");

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

    emitProgress(
      options,
      `Saved datasets: ${completedUsers.length} teams, ${checklists.length} checklists, ${new Set(taxons).size} species.`,
    );

    const finishedAt = formatLogTimestamp();
    const durationSeconds = Math.round((Date.now() - startedMs) / 100) / 10;
    await appendActivityLog({
      finishedAt,
      success: true,
      durationSeconds,
      source,
    });

    callback(null);
  } catch (error) {
    const finishedAt = formatLogTimestamp();
    const durationSeconds = Math.round((Date.now() - startedMs) / 100) / 10;

    try {
      await appendActivityLog({
        finishedAt,
        success: false,
        durationSeconds,
        source,
        error,
      });
    } catch (logError) {
      console.error("Failed to append log entry:", logError);
    }

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
