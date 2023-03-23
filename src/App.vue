<template>
  <b-container fluid class="h-100 d-flex flex-column px-0">
    <b-row class="justify-content-center h-100 no-gutters">
      <b-col md="4" class="h-100 d-flex flex-column" v-if="sidebarshow">
        <b-row class="bg-primary text-white">
          <div class="col-12 px-4 d-flex align-items-center">
            <a class="d-block d-xl-none" href="https://johnstottbirdingday.com/en/">
              <b-img src="logo_small.svg" fluid id="nav-logo" style="width: 50px" />
            </a>
            <a class="d-none d-xl-block" href="https://johnstottbirdingday.com/en/">
              <b-img src="logo.svg" fluid id="nav-logo" style="width: 133px" />
            </a>
            <h3 class="flex-grow-1 text-center mb-0">The Bird Race</h3>
            <b-icon icon="caret-left-fill" class="h2 text-white cursor-pointer" @click="sidebarhide(true)" />
          </div>
        </b-row>
        <b-row class="mx-xl-2 mt-xl-1">
          <b-col md="6" lg="3" class="p-1">
            <div class="p-2 d-flex flex-column rounded bg-primary text-white h-100">
              <div class="d-flex align-self-center">
                <div class="counter d-flex">
                  <b-img src="pigeon.svg" class="pigeon mr-2" /> {{ info.counterSpecies }}
                </div>
              </div>
              <div class="counter-label lato align-self-center text-center">Species</div>
            </div>
          </b-col>
          <b-col class="col-md-6 col-lg-3 p-1">
            <div class="p-2 d-flex flex-column rounded bg-primary text-white h-100">
              <div class="d-flex align-self-center">
                <div class="counter"><b-icon icon="person-fill" /> {{ info.counterParticipants }}</div>
              </div>
              <div class="counter-label lato align-self-center text-center">Participants</div>
            </div>
          </b-col>
          <b-col md="6" lg="3" class="p-1">
            <div class="p-2 d-flex flex-column rounded bg-primary text-white h-100">
              <div class="d-flex align-self-center">
                <div class="counter"><b-icon icon="flag-fill" /> {{ info.counterCountries }}</div>
              </div>
              <div class="counter-label lato align-self-center text-center">Countries</div>
            </div>
          </b-col>
          <b-col md="6" lg="3" class="p-1">
            <div class="p-2 d-flex flex-column rounded bg-primary text-white h-100">
              <div class="d-flex align-self-center">
                <div class="counter"><b-icon icon="card-checklist" /> {{ info.counterChecklists }}</div>
              </div>
              <div class="counter-label lato align-self-center text-center">Checklists</div>
            </div>
          </b-col>
        </b-row>
        <b-row class="flex-grow-1" style="overflow: auto">
          <b-col class="px-4">
            <b-table
              striped
              hover
              :items="user"
              :fields="[
                { key: 'name', label: 'Name' },
                { key: 'num_sp', label: 'Number of species' },
                { key: 'num_checklist', label: 'Number of checklist' },
                { key: 'countryCode', label: 'Country' },
              ]"
              small
              responsive="sm"
              v-if="user.length > 0"
              @row-hovered="handleRowHovered"
              @row-unhovered="handleRowUnhovered"
            >
              <template #cell(name)="data">
                <template v-if="data.item.hasOwnProperty('profile')">
                  <a :href="data.item.profile" target="_blank">{{ data.value }}</a>
                </template>
                <template v-else>
                  {{ data.value }}
                </template>
              </template>
              <template #cell(countryCode)="data">
                <span v-for="f in data.value" :key="f" :class="['fi', 'fi-' + f.toLowerCase(), 'mr-1']" />
              </template>
            </b-table>
          </b-col>
        </b-row>
        <b-row>
          <b-col> Last updated: {{ info.lastUpdated.toLocaleString() }} </b-col>
        </b-row>
      </b-col>
      <b-col class="h-100">
        <l-map
          :bounds="[
            [-90, 180],
            [90, -180],
          ]"
          ref="map"
          :options="{ preferCanvas: true }"
        >
          <l-control position="topleft" v-if="!sidebarshow">
            <div
              class="leaflet-control-layers leaflet-control-layers-expanded cursor-pointer"
              @click="sidebarhide(false)"
              aria-haspopup="true"
            >
              <b-icon icon="caret-right-fill" />
            </div>
          </l-control>
          <l-tile-layer
            :url="'https://api.mapbox.com/styles/v1/mapbox/streets-v9/tiles/{z}/{x}/{y}?access_token=' + mapboxToken"
          />
          <l-marker
            v-for="c in checklist"
            :key="c.locID"
            :lat-lng="c.latLng"
            :icon="getIcon(c)"
            :visible="user_hover == null || c.user == user_hover"
          >
            <l-popup :options="{ minWidth: 200 }" class="d-flex flex-column">
              <div class="py-1"><b-icon icon="person-fill" class="mr-2" /> {{ c.user }}</div>
              <div class="py-1">
                <b-icon icon="clock-fill" class="mr-2" />
                <a target="_blank" :href="'https://ebird.org/checklist/' + c.subId">{{ c.obsDt }} {{ c.obsTime }}</a>
              </div>
              <div class="py-1">
                <b-icon icon="geo-alt-fill" class="mr-2" />
                {{ c.loc.name }}
              </div>
            </l-popup>
          </l-marker>
        </l-map>
      </b-col>
    </b-row>
  </b-container>
</template>

<script setup>
//import regionsJson from "./assets/regions.json";
</script>

<script>
const color_pin = ["#efa00b", "#d65108", "#591f0a", "#eee5e5", "#adb6c4", "#89023e", "#ffd9da", "#c7d9b7", "#17bebb"];
import { LMap, LTileLayer, LPopup, LMarker, LIcon, LControl } from "vue2-leaflet";
import { latLng } from "leaflet";
import "/node_modules/flag-icons/css/flag-icons.min.css";

export default {
  components: {
    LMap,
    LTileLayer,
    LMarker,
    LIcon,
    LPopup,
    LControl,
  },
  data() {
    return {
      mapboxToken: "pk.eyJ1IjoicmFmbnVzcyIsImEiOiIzMVE1dnc0In0.3FNMKIlQ_afYktqki-6m0g",
      lastUpdated: new Date(),
      user: [],
      info: {
        counterSpecies: 0,
        counterParticipants: 0,
        counterCountries: 0,
        counterChecklists: 0,
        lastUpdated: new Date(),
      },
      checklist: [],
      sidebarshow: true,
      map: null,
      user_hover: null,
    };
  },
  methods: {
    handleRowHovered(rowInfo) {
      this.user_hover = rowInfo.name;
    },
    handleRowUnhovered(rowInfo) {
      this.user_hover = null;
    },
    sidebarhide(tf) {
      if (tf) {
        this.sidebarshow = false;
      } else {
        this.sidebarshow = true;
      }
      setTimeout(() => {
        this.map.invalidateSize();
      }, 100);
    },
    getIcon(c) {
      return L.divIcon({
        className: "my-custom-icon",
        popupAnchor: [0, -34],
        iconAnchor: [12.5, 34],
        iconSize: [25, 34],
        html: `
        <?xml version="1.0" encoding="UTF-8"?><svg id="Layer_1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24.66 33.31"><defs><style>.cls-1,.cls-2{fill:#fff;}#cls-${c.locId}{fill:${c.color};}.cls-2{font-family:ArialMT, Arial;font-size:14.2px; fill:#fff;}</style></defs><g><path id="cls-${c.locId}" d="M12.35,32.81c-.32,0-.8-.11-1.27-.66-2.97-3.44-5.33-6.7-7.21-9.96-1.43-2.49-2.36-4.61-2.91-6.66C.01,12.01,.54,8.71,2.52,5.74,4.22,3.21,6.6,1.55,9.6,.83c.42-.1,.86-.17,1.29-.23,.19-.03,.38-.06,.57-.09h1.67c.27,.03,.46,.06,.65,.09,.43,.06,.87,.13,1.29,.23,3.35,.83,5.92,2.79,7.64,5.83,.84,1.5,1.33,3.18,1.43,5.01,.15,2.57-.65,4.85-1.36,6.55-1.22,2.91-2.94,5.85-5.26,8.98-1.01,1.36-2.09,2.69-3.14,3.98l-.78,.97c-.45,.56-.93,.68-1.25,.68Z"/><path class="cls-1" d="M13.13,1c.61,.1,1.23,.17,1.83,.32,3.25,.8,5.69,2.69,7.32,5.59,.83,1.48,1.27,3.09,1.37,4.79,.13,2.23-.48,4.31-1.32,6.33-1.33,3.19-3.15,6.11-5.2,8.87-1.25,1.68-2.59,3.3-3.91,4.93-.27,.33-.57,.49-.87,.49s-.61-.16-.89-.49c-2.67-3.09-5.11-6.34-7.15-9.88-1.19-2.07-2.24-4.22-2.86-6.54-.9-3.35-.43-6.5,1.5-9.38,1.63-2.44,3.91-4.01,6.78-4.7,.6-.14,1.22-.21,1.83-.32h1.59m.08-1h-1.84c-.19,.05-.37,.07-.56,.1-.43,.07-.88,.13-1.33,.24C6.35,1.1,3.87,2.82,2.11,5.46,.04,8.56-.51,11.99,.48,15.66c.56,2.09,1.5,4.25,2.96,6.78,1.89,3.29,4.27,6.57,7.26,10.03,.6,.69,1.23,.84,1.65,.84,.61,0,1.19-.31,1.64-.86l.79-.97c1.05-1.29,2.13-2.62,3.15-3.99,2.35-3.16,4.09-6.13,5.32-9.08,.73-1.75,1.55-4.1,1.4-6.77-.11-1.9-.61-3.66-1.5-5.22-1.78-3.16-4.46-5.21-7.95-6.07-.45-.11-.9-.18-1.34-.24-.19-.03-.37-.06-.56-.09h-.08Z"/></g></svg>`,
      });
    },
  },
  computed: {},
  created: function () {
    fetch("https://api.johnstottbirdingday.com/user")
      .then((response) => response.json())
      .then((data) => {
        const user = data
          .map((d, id) => {
            d.color = color_pin[id % color_pin.length];
            d.num_sp = d.num_sp[0];
            return d;
          })
          .sort(function (a, b) {
            return b.num_sp - a.num_sp;
          });
        fetch("https://api.johnstottbirdingday.com/checklist")
          .then((response) => response.json())
          .then((data) => {
            const checklist = data.map((d) => {
              const useri = user.find((u) => u.name == d.user);
              d.color = useri.color;
              d.latLng = latLng([d.loc.lat, d.loc.lng]);
              return d;
            });
            this.map.fitBounds(checklist.map((c) => c.latLng));
            this.user = user;
            this.checklist = checklist;
          })
          .catch((error) => console.error(error));
      })
      .catch((error) => console.error(error));

    fetch("https://api.johnstottbirdingday.com/info")
      .then((response) => response.json())
      .then((data) => {
        data.lastUpdated = new Date(data.lastUpdated);
        this.info = data;
      })
      .catch((error) => console.error(error));
  },
  mounted() {
    this.$nextTick(() => {
      this.map = this.$refs.map.mapObject;
    });
  },
};
</script>
