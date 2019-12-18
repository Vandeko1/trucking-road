import Vue from "nativescript-vue";
import App from "./components/App";
import Login from "./components/Login";
import Vuex from 'vuex';
import store from './store';
import DrawerContent from "./components/DrawerContent";
import RadSideDrawer from "nativescript-ui-sidedrawer/vue";
Vue.use(RadSideDrawer);
Vue.use(Vuex);
Vue.config.silent = (TNS_ENV === 'production');
new Vue({
      store,
    render (h) {
        return h(
          App,
          [
            h(DrawerContent, { slot: 'drawerContent' }),
            h(Login, { slot: 'mainContent' })
          ]
        )
      }
  }).$start();