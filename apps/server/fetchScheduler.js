const { fetchTripReport } = require("./fetchTripReport");

const FETCH_INTERVAL_MS = 15 * 60 * 1000;
const FETCH_TIMEOUT_MS = 3000;

let isRunning = false;

function runFetch() {
  if (isRunning) {
    console.log("Skipping scheduled fetch because a previous run is still in progress.");
    return;
  }

  isRunning = true;
  console.log("Starting scheduled fetch.");

  fetchTripReport(
    FETCH_TIMEOUT_MS,
    (status) => {
      if (status == null) {
        console.log("Scheduled fetch completed successfully.");
      } else {
        console.log(`Scheduled fetch failed: ${status}`);
      }

      isRunning = false;
    },
    { source: "auto" },
  );
}

console.log(`Fetch scheduler started. Interval: ${FETCH_INTERVAL_MS / 60000} minutes.`);
runFetch();
setInterval(runFetch, FETCH_INTERVAL_MS);
