import Vue from 'vue'
import App from './App.vue'

import 'spectre.css/dist/spectre.min.css'

import { LMap, LTileLayer, LMarker, LTooltip, LPopup, LPolygon, LControlLayers } from 'vue2-leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css'

import Toast from "vue-toastification";
import "vue-toastification/dist/index.css";

import VueSimpleAlert from "vue-simple-alert";

const options = {};

Vue.use(Toast, options);
Vue.use(VueSimpleAlert, { reverseButtons: true })

Vue.component('l-map', LMap);
Vue.component('l-tile-layer', LTileLayer);
Vue.component('l-polygon', LPolygon);
Vue.component('l-marker', LMarker);
Vue.component('l-tooltip', LTooltip);
Vue.component('l-popup', LPopup);
Vue.component('l-control-layers', LControlLayers);

Vue.config.productionTip = false

new Vue({
  render: h => h(App),
}).$mount('#app')
