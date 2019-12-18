import Vue from 'vue';
import Vuex from 'vuex';
import axios from 'axios';
const httpModule = require("tns-core-modules/http");
Vue.use(Vuex);
export default new Vuex.Store({
    state: {
        notes: ''
    },
    
    actions: {
        addNote: async({ commit }, note) => {
            await httpModule.request({
                url: "http://192.168.1.1:555/services/hs/empty",
                method: "POST",
                headers: { 
                    "Content-Type": "application/json", 
                    "Authorization": "Basic " + note
                },
                content: JSON.stringify({
                })
            }).then((response) => {
                  commit('ADD_NOTE', note);
            }, (e) => {
                commit('ADD_NOTE', 'помилка');
            });
        }
        
    },
    
    mutations: {
        ADD_NOTE(state, note) {
            state.notes = note;
        }
    },
    
    getters: {
        notes(state) {
            return state.notes;
        }
    }
    
});
