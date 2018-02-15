




import * as types from '../mutation-types'
import service from '../../services/ajax'

import {auth} from '../../utils/authentication'

const state = {
  token: null,
  authenticated: false
};

// getters
const getters = {
  getToken: state => state.token,
  isNotLoggedIn: state => !state.authenticated
  };


// actions
const actions = {
  onTokenInValid ({ commit, dispatch }) {
    console.log('invalid token')
      commit(types.USER_AUTHENTICATED, false)
    commit(types.SET_TOKEN, null)
    // dispatch('openLoginPopup')
  },
  updateToken ({ commit, dispatch }, token) {
    commit(types.SET_TOKEN, token)
    commit(types.USER_AUTHENTICATED, true)
    dispatch('onTokenUpdated')
  },
  openLoginPopup({dispatch}){
    auth.login({
      callback: function (tokenFromPopup) {
        if(tokenFromPopup)
          dispatch('updateToken', tokenFromPopup)
        else    dispatch('onTokenInValid')
      }
    });
  }

}

// mutations
const mutations = {
  [types.SET_TOKEN] (state, token ) {
    if(!token)
      localStorage.removeItem('access_token');
    state.token = token;
  },
  [types.INVALID_TOKEN] (state) {
    state.authenticated = false
  },
  [types.USER_AUTHENTICATED] (state, value) {
    state.authenticated = value
  }
}

export default {
  state,
  getters,
  actions,
  mutations
}

