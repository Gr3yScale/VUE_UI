import Vue from 'vue'
import PortalVue from 'portal-vue'
import App from './App.vue'
import './assets/main.css'

Vue.use(PortalVue)

new Vue({ render: h => h(App) }).$mount('#app')
