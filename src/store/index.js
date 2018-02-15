
import VueResource from 'vue-resource/dist/vue-resource'



import projects from './modules/projects'
import authentication from './modules/authentication'
import uiState from './modules/uiManagement'

const debug = process.env.NODE_ENV !== 'production'
import Vue from 'vue'
import Vuex from 'vuex';
import * as actions from './actions'

Vue.use(Vuex);
export const store = new Vuex.Store({
  actions,
  modules: { projects, authentication, uiState },
  strict: debug,
});
