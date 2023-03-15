import Vue from 'vue'
import App from './App.vue'

import { BootstrapVue, BootstrapVueIcons } from "bootstrap-vue";

import "./main.scss";
import "leaflet/dist/leaflet.css";
import "leaflet/dist/images/marker-shadow.png";

Vue.use(BootstrapVue);
Vue.use(BootstrapVueIcons);

new Vue({
    render: (h) => h(App),
}).$mount("#app");