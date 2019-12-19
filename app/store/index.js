import Vue from 'vue';
import Vuex from 'vuex';
Vue.use(Vuex);
export default new Vuex.Store({
    state: {
        hash: ''
    },    
    actions: {
        addHash: async({ commit }, hash) => {
            commit('ADD_HASH', hash);            
        }        
    },    
    mutations: {
        ADD_HASH(state, hash) {
            state.hash = hash;
        }
    },    
    getters: {
        hash(state) {
            return state.hash;
        }
    }    
});
