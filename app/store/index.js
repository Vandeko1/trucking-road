import Vue from 'vue';
import Vuex from 'vuex';
const Sqlite = require("nativescript-sqlite");

Vue.use(Vuex);
export default new Vuex.Store({
    state: {
        hash: '',
        resp: {},
        database: null,
        data: []
    },
    
    actions: {
        addHash: async ({ commit }, hash) => { commit('ADD_HASH', hash); },
        addResp: async ({ commit }, resp) => { commit('ADD_RESP', resp); },
        updateResp: async ({ commit }) => { commit('UPDATE_RESP'); },
        init(context) {
            (new Sqlite("my.db")).then(db => {
                db.execSQL("CREATE TABLE IF NOT EXISTS records (id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, latitude TEXT, longitude TEXT, noteText TEXT, mode TEXT, time TEXT, hash TEXT, photo TEXT)").then(id => {
                    context.commit("init", {
                        database: db
                    });
                }, error => {
                    console.log("CREATE TABLE records ERROR", error);
                });
            }, error => {
                console.log("OPEN DB ERROR", error);
            });
        },
        insert(context, data) {
            context.state.database.execSQL("INSERT INTO records (latitude, longitude, noteText, mode, time, hash, photo) VALUES (?, ?, ?, ?, ?, ?, ?)", [data.latitude, data.longitude, data.noteText, data.mode, data.time, data.hash, data.photo]).then(id => {
                context.commit("save", {
                    data: data
                });
            }, error => {
                console.log("INSERT ERROR", error);
            });
        },
        query(context) {
            context.state.database.all("SELECT * FROM records", []).then(result => {
                context.commit("loadRecords", {
                    data: result
                });
            }, error => {
                console.log("SELECT ERROR", error);
            });
        },
        delete(context, time) {
            context.state.database.execSQL("DELETE FROM records WHERE time=?", time).then(count => {
                context.commit("delete", time);
            }, error => {
                console.log("SELECT ERROR", error);
            });
        }
    },
    
    mutations: {
        ADD_HASH(state, hash) {
            state.hash = hash;
        },
        ADD_RESP(state, resp) {
            state.resp = resp;
        },
        UPDATE_RESP(state) {
            state.resp.status = !state.resp.status;
        },
        init(state, data) {
            state.database = data.database;
        },
        loadRecords(state, data) {
            state.data = [];
            for (var i = 0; i < data.data.length; i++) {
                state.data.push({
                    latitude: data.data[i][0],
                    longitude: data.data[i][1],
                    noteText: data.data[i][2],
                    mode: data.data[i][3],
                    time: data.data[i][4],
                    hash: data.data[i][5],
                    photo: data.data[i][6]
                });
            }
        },
        save(state, data) {
            state.data.push({
                latitude: data.data.latitude,
                longitude: data.data.longitude,
                noteText: data.data.noteText,
                mode: data.data.mode,
                time: data.data.time,
                hash: data.data.hash,
                photo: data.data.photo
            });
        },
        delete(state, time) {
            let other = state.data.filter(function (e) {
                return e.time !== time;
            });
            state.data = other;
        }
    },
    
    getters: {
        hash(state) {
            return state.hash;
        },
        resp(state) {
            return state.resp;
        },
        loadRecords(state) {
            return state.data;
        }
    }
    
});