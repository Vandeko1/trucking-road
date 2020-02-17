import Vue from "nativescript-vue";
import Vuex from "vuex";
import store from "./store";
import DrawerContent from "./components/DrawerContent";
import RadSideDrawer from "nativescript-ui-sidedrawer/vue";
import { Gif } from "nativescript-gif";
import App from "./components/App";
import Login from "./components/Login";
Vue.use(RadSideDrawer);
Vue.use(Vuex);
Vue.config.silent = (TNS_ENV === "production");
Vue.registerElement("Gif", () => Gif);
Vue.registerElement("Mapbox", () => require("nativescript-mapbox").MapboxView);
Vue.registerElement("RadCalendar", () => require("nativescript-ui-calendar").RadCalendar);
new Vue({
      store,
    render (h) {
        return h(
          App,
          [
            h(DrawerContent, { slot: "drawerContent" }),
            h(Login, { slot: "mainContent" })
          ]
        )
      }
  }).$start();