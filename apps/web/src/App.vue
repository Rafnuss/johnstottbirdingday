<template>
  <div
    class="app-shell"
    :class="{
      'app-shell-sidebar-hidden': !sidebarVisible && !isMobile,
      'app-shell-mobile': isMobile,
    }"
  >
    <button
      v-if="!sidebarVisible"
      class="map-reveal-button"
      type="button"
      @click="sidebarVisible = true"
      aria-label="Show sidebar"
    >
      <svg viewBox="0 0 16 16" aria-hidden="true" class="ui-icon">
        <path
          fill="currentColor"
          d="M5.3 13.7a1 1 0 0 1 0-1.4L9.59 8l-4.3-4.3a1 1 0 0 1 1.42-1.4l4.99 5a1 1 0 0 1 0 1.4l-4.99 5a1 1 0 0 1-1.41 0Z"
        />
      </svg>
    </button>

    <div v-if="isMobile && sidebarVisible" class="sidebar-backdrop" @click="sidebarVisible = false"></div>

    <aside class="sidebar" :class="{ 'sidebar-hidden': !sidebarVisible }">
      <header class="sidebar-header">
        <a class="brand-link brand-link-compact" href="https://johnstottbirdingday.com/en/">
          <img src="/logo_small.svg" alt="John Stott Birding Day" class="brand-mark compact-mark" />
        </a>
        <a class="brand-link brand-link-wide" href="https://johnstottbirdingday.com/en/">
          <img src="/logo.svg" alt="John Stott Birding Day" class="brand-mark" />
        </a>
        <div class="header-copy">
          <h1>The Bird Race</h1>
        </div>
        <button class="toggle-button" type="button" @click="sidebarVisible = false" aria-label="Hide sidebar">
          <svg viewBox="0 0 16 16" aria-hidden="true" class="ui-icon">
            <path
              fill="currentColor"
              d="M10.7 2.3a1 1 0 0 1 0 1.4L6.41 8l4.3 4.3a1 1 0 1 1-1.42 1.4L4.3 8.7a1 1 0 0 1 0-1.4l4.99-5a1 1 0 0 1 1.41 0Z"
            />
          </svg>
        </button>
      </header>

      <section class="stats-grid">
        <article class="stat-card">
          <div class="stat-value">
            <img src="/pigeon.svg" alt="" class="stat-icon-image" />
            <span>{{ info.counterSpecies }}</span>
          </div>
          <div class="stat-label">Species</div>
        </article>
        <article class="stat-card">
          <div class="stat-value">
            <svg viewBox="0 0 16 16" aria-hidden="true" class="stat-icon-svg">
              <path
                fill="currentColor"
                d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm-5 6a5 5 0 0 1 10 0v.5a.5.5 0 0 1-.5.5h-9a.5.5 0 0 1-.5-.5V14Z"
              />
            </svg>
            <span>{{ info.counterParticipants }}</span>
          </div>
          <div class="stat-label">Participants</div>
        </article>
        <article class="stat-card">
          <div class="stat-value">
            <svg viewBox="0 0 16 16" aria-hidden="true" class="stat-icon-svg">
              <path
                fill="currentColor"
                d="M3 1.5A.5.5 0 0 1 3.5 1h.79a.5.5 0 0 1 .43.24L5.3 2H12a.5.5 0 0 1 .4.8L10.5 5l1.9 2.2a.5.5 0 0 1-.4.8H5.3l-.58.76a.5.5 0 0 1-.43.24H4V15a.5.5 0 0 1-1 0V1.5Z"
              />
            </svg>
            <span>{{ info.counterCountries }}</span>
          </div>
          <div class="stat-label">Countries</div>
        </article>
        <article class="stat-card">
          <div class="stat-value">
            <svg viewBox="0 0 16 16" aria-hidden="true" class="stat-icon-svg">
              <path
                fill="currentColor"
                d="M2.5 3a.5.5 0 0 0 0 1h11a.5.5 0 0 0 0-1h-11Zm0 4a.5.5 0 0 0 0 1h11a.5.5 0 0 0 0-1h-11Zm0 4a.5.5 0 0 0 0 1h11a.5.5 0 0 0 0-1h-11Z"
              />
            </svg>
            <span>{{ info.counterChecklists }}</span>
          </div>
          <div class="stat-label">Checklists</div>
        </article>
      </section>

      <section class="sidebar-body">
        <div v-if="loading" class="panel-message">Loading race data…</div>
        <div v-else-if="errorMessage" class="panel-message panel-message-error">{{ errorMessage }}</div>
        <div v-else class="table-wrap">
          <table class="race-table">
            <thead>
              <tr>
                <th>Name</th>
                <th class="metric-heading">
                  <span class="metric-head" aria-label="Species" title="Species">
                    <img src="/pigeon.svg" alt="Species" class="metric-head-image metric-head-image-blue" />
                  </span>
                </th>
                <th class="metric-heading">
                  <span class="metric-head" aria-label="Checklists" title="Checklists">
                    <svg viewBox="0 0 16 16" aria-hidden="true" class="metric-head-icon">
                      <path
                        fill="currentColor"
                        d="M2.5 3a.5.5 0 0 0 0 1h11a.5.5 0 0 0 0-1h-11Zm0 4a.5.5 0 0 0 0 1h11a.5.5 0 0 0 0-1h-11Zm0 4a.5.5 0 0 0 0 1h11a.5.5 0 0 0 0-1h-11Z"
                      />
                    </svg>
                  </span>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="participant in users"
                :key="participant.email || participant.name"
                @mouseenter="hoveredUser = participant.name"
                @mouseleave="hoveredUser = null"
                :class="{ 'is-active-row': hoveredUser === participant.name }"
              >
                <td>
                  <div class="name-cell">
                    <a
                      v-if="participant.tripreport"
                      :href="tripReportUrl(participant.tripreport)"
                      target="_blank"
                      rel="noopener noreferrer"
                      class="name-link name-link-tripreport"
                    >
                      {{ participant.name }}
                    </a>
                    <span v-else class="name-link name-text name-text-plain">{{ participant.name }}</span>
                    <a
                      v-if="participant.party && participant.profile"
                      :href="participant.profile"
                      target="_blank"
                      rel="noopener noreferrer"
                      class="party-badge party-badge-link"
                      :title="`${participant.party} observers`"
                    >
                      <svg viewBox="0 0 16 16" aria-hidden="true" class="party-badge-icon">
                        <path
                          fill="currentColor"
                          d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm-5 6a5 5 0 0 1 10 0v.5a.5.5 0 0 1-.5.5h-9a.5.5 0 0 1-.5-.5V14Z"
                        />
                      </svg>
                      <span>{{ participant.party }}</span>
                    </a>
                    <span
                      v-else-if="participant.party"
                      class="party-badge party-badge-static"
                      :title="`${participant.party} observers`"
                    >
                      <svg viewBox="0 0 16 16" aria-hidden="true" class="party-badge-icon">
                        <path
                          fill="currentColor"
                          d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm-5 6a5 5 0 0 1 10 0v.5a.5.5 0 0 1-.5.5h-9a.5.5 0 0 1-.5-.5V14Z"
                        />
                      </svg>
                      <span>{{ participant.party }}</span>
                    </span>
                    <div v-if="participant.countryCode?.length" class="flag-list flag-list-inline">
                      <span
                        v-for="country in participant.countryCode"
                        :key="country"
                        :class="['fi', `fi-${country.toLowerCase()}`]"
                        :title="countryDisplayName(country)"
                      />
                    </div>
                  </div>
                </td>
                <td class="metric-cell">{{ participant.num_sp }}</td>
                <td class="metric-cell">{{ participant.num_checklist }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <footer class="sidebar-footer">
        <span v-if="info.lastUpdated">Last updated: {{ formatDateTime(info.lastUpdated) }}</span>
        <span v-else>Waiting for latest update timestamp…</span>
      </footer>
    </aside>

    <main class="map-shell">
      <div ref="mapContainer" class="map-canvas"></div>
      <div v-if="mapError" class="map-overlay">
        <h2>Map unavailable</h2>
        <p>{{ mapError }}</p>
      </div>
    </main>
  </div>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref, watch } from "vue";
import mapboxgl from "mapbox-gl";
import "flag-icons/css/flag-icons.min.css";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "http://localhost:8081").replace(/\/$/, "");
const MAPBOX_TOKEN =
  import.meta.env.VITE_MAPBOX_TOKEN ||
  "pk.eyJ1IjoicmFmbnVzcyIsImEiOiIzMVE1dnc0In0.3FNMKIlQ_afYktqki-6m0g";

const markerPalette = [
  "#efa00b",
  "#d65108",
  "#591f0a",
  "#eee5e5",
  "#adb6c4",
  "#89023e",
  "#ffd9da",
  "#c7d9b7",
  "#17bebb",
];

const users = ref([]);
const checklist = ref([]);
const hoveredUser = ref(null);
const loading = ref(true);
const errorMessage = ref("");
const isMobile = ref(window.innerWidth < 980);
const sidebarVisible = ref(window.innerWidth >= 980);
const mapError = ref("");
const mapContainer = ref(null);
const map = ref(null);
const markers = ref([]);
const regionNames =
  typeof Intl !== "undefined" && typeof Intl.DisplayNames === "function"
    ? new Intl.DisplayNames(["en"], { type: "region" })
    : null;

const info = reactive({
  counterSpecies: 0,
  counterParticipants: 0,
  counterCountries: 0,
  counterChecklists: 0,
  lastUpdated: null,
});

const filteredChecklist = computed(() =>
  hoveredUser.value ? checklist.value.filter((item) => item.user === hoveredUser.value) : checklist.value,
);

function tripReportUrl(report) {
  const [tripReportId, personQuery] = String(report).split("?");
  const personId = personQuery?.replace("tripReportPersonId=", "");
  return personId ? `https://ebird.org/tripreport/${tripReportId}/${personId}` : `https://ebird.org/tripreport/${tripReportId}`;
}

function checklistUrl(subId) {
  return `https://ebird.org/checklist/${subId}`;
}

function formatDateTime(value) {
  return new Date(value).toLocaleString();
}

function countryDisplayName(countryCode) {
  return regionNames?.of(countryCode) || countryCode;
}

function createMarkerElement(color) {
  const element = document.createElement("div");
  element.className = "map-pin";
  element.innerHTML = `
    <svg viewBox="0 0 25 34" aria-hidden="true">
      <path fill="${color}" d="M12.4 33.1c-.4 0-.8-.2-1.2-.6-3-3.5-5.4-6.8-7.3-10.1C2.5 19.9 1.5 17.7.9 15.6 0 12.1.5 8.7 2.5 5.7 4.3 3 6.8 1.3 9.8.6c.6-.2 1.2-.3 1.8-.4h1.6c.6.1 1.2.2 1.8.4 3.4.8 6 2.8 7.7 5.9.9 1.5 1.4 3.2 1.5 5.1.1 2.6-.7 4.9-1.4 6.6-1.2 2.9-3 5.9-5.3 9.1-1 1.4-2.1 2.7-3.2 4l-.8 1c-.4.5-.8.7-1.2.7Z"/>
      <path fill="rgba(255,255,255,0.92)" d="M12.4 18.4a5.5 5.5 0 1 0 0-11.1 5.5 5.5 0 0 0 0 11.1Z"/>
    </svg>
  `;
  return element;
}

function createPopupMarkup(entry) {
  return `
    <article class="popup-card">
      <p class="popup-line popup-title"><strong>${entry.loc.name}</strong></p>
      <div class="popup-meta">
        <p class="popup-line popup-chip">
          <span class="popup-icon" aria-hidden="true">
            <img src="/pigeon.svg" alt="" />
          </span>
          <span>${entry.numSpecies ?? 0} species</span>
        </p>
        <p class="popup-line popup-chip">
          <span class="popup-icon popup-icon-stroke" aria-hidden="true">
            <svg viewBox="0 0 16 16">
              <path
                fill="currentColor"
                d="M8 3.5a.5.5 0 0 1 .5.5v3.7l2.4 1.4a.5.5 0 0 1-.5.86l-2.65-1.55A.5.5 0 0 1 7.5 8V4a.5.5 0 0 1 .5-.5Z"
              />
              <path
                fill="currentColor"
                d="M8 1.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13Zm-5.5 6.5a5.5 5.5 0 1 1 11 0 5.5 5.5 0 0 1-11 0Z"
              />
            </svg>
          </span>
          <span>${entry.obsDt}${entry.obsTime ? ` ${entry.obsTime}` : ""}</span>
        </p>
      </div>
      <p class="popup-line popup-link-row">
        <a href="${checklistUrl(entry.subId)}" target="_blank" rel="noopener noreferrer" class="popup-link">
          Open checklist
        </a>
      </p>
    </article>
  `;
}

function clearMarkers() {
  for (const marker of markers.value) {
    marker.remove();
  }
  markers.value = [];
}

function renderMarkers() {
  if (!map.value) return;

  clearMarkers();

  for (const entry of filteredChecklist.value) {
    const marker = new mapboxgl.Marker({
      element: createMarkerElement(entry.color),
      anchor: "bottom",
    })
      .setLngLat([entry.loc.lng, entry.loc.lat])
      .setPopup(
        new mapboxgl.Popup({
          offset: 20,
          closeButton: false,
          className: "race-popup",
        }).setHTML(createPopupMarkup(entry)),
      )
      .addTo(map.value);

    markers.value.push(marker);
  }
}

function fitMapToChecklist() {
  if (!map.value || checklist.value.length === 0) return;

  const bounds = new mapboxgl.LngLatBounds();
  for (const entry of checklist.value) {
    bounds.extend([entry.loc.lng, entry.loc.lat]);
  }

  const sidePadding = isMobile.value ? 72 : 84;

  map.value.fitBounds(bounds, {
    padding: {
      top: 72,
      right: sidePadding,
      bottom: 72,
      left: sidePadding,
    },
    maxZoom: 5.2,
    duration: 1200,
  });
}

async function loadRaceData() {
  loading.value = true;
  errorMessage.value = "";

  try {
    const [userResponse, checklistResponse, infoResponse] = await Promise.all([
      fetch(`${API_BASE_URL}/user`),
      fetch(`${API_BASE_URL}/checklist`),
      fetch(`${API_BASE_URL}/info`),
    ]);

    if (!userResponse.ok || !checklistResponse.ok || !infoResponse.ok) {
      throw new Error("Failed to load race data from the API.");
    }

    const [userData, checklistData, infoData] = await Promise.all([
      userResponse.json(),
      checklistResponse.json(),
      infoResponse.json(),
    ]);

    const decoratedUsers = userData
      .map((entry, index) => ({
        ...entry,
        color: markerPalette[index % markerPalette.length],
        num_sp: Array.isArray(entry.num_sp) ? entry.num_sp[0] : entry.num_sp,
      }))
      .sort((a, b) => Number(b.num_sp) - Number(a.num_sp));

    const userByName = new Map(decoratedUsers.map((entry) => [entry.name, entry]));

    users.value = decoratedUsers;
    checklist.value = checklistData.map((entry) => ({
      ...entry,
      color: userByName.get(entry.user)?.color || markerPalette[0],
    }));

    info.counterSpecies = infoData.counterSpecies ?? 0;
    info.counterParticipants = infoData.counterParticipants ?? 0;
    info.counterCountries = infoData.counterCountries ?? 0;
    info.counterChecklists = infoData.counterChecklists ?? 0;
    info.lastUpdated = infoData.lastUpdated ? new Date(infoData.lastUpdated) : null;

    await nextTick();
    renderMarkers();
    fitMapToChecklist();
  } catch (error) {
    console.error(error);
    errorMessage.value = "The race data could not be loaded right now.";
  } finally {
    loading.value = false;
  }
}

function handleResize() {
  const mobile = window.innerWidth < 980;
  isMobile.value = mobile;

  if (!mobile) sidebarVisible.value = true;

  map.value?.resize();
}

function initializeMap() {
  if (!MAPBOX_TOKEN) {
    mapError.value = "Missing Mapbox token.";
    return;
  }

  mapboxgl.accessToken = MAPBOX_TOKEN;

  map.value = new mapboxgl.Map({
    container: mapContainer.value,
    style: "mapbox://styles/mapbox/satellite-streets-v12",
    center: [0, 10],
    zoom: 1.55,
    projection: "globe",
    attributionControl: false,
  });

  map.value.addControl(new mapboxgl.NavigationControl(), "top-right");

  map.value.on("style.load", () => {
    map.value.setFog({
      color: "rgb(118, 145, 170)",
      "high-color": "rgb(24, 38, 58)",
      "space-color": "rgb(3, 7, 14)",
      "horizon-blend": 0.03,
      "star-intensity": 0.02,
    });
  });

  map.value.on("load", () => {
    renderMarkers();
    fitMapToChecklist();
  });

  map.value.on("error", () => {
    mapError.value = "The interactive map could not be rendered.";
  });
}

watch(filteredChecklist, () => {
  renderMarkers();
});

watch(sidebarVisible, async () => {
  await nextTick();
  map.value?.resize();
  fitMapToChecklist();
});

onMounted(async () => {
  initializeMap();
  window.addEventListener("resize", handleResize);
  await loadRaceData();
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", handleResize);
  clearMarkers();
  map.value?.remove();
});
</script>
