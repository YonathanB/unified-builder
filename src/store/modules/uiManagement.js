




import * as types from '../mutation-types'

const state = {
  selectedProject: null,
  selectedSpace: null,
  selectedLayout: null
};

// getters
const getters = {
  // getSelectedProject: state => state.selectedProject,getSelectedSpace
  // getSelectedSpace: state => state.selectedSpace,
  getSelectedLayout: state => state.selectedLayout
};


// actions
const actions = {
//   onSpaceSelected ({ commit }, space) {
//     commit(types.SET_ACTIVE_PROJECT, space.project_id)
//     commit(types.SET_ACTIVE_SPACE, space.id)
//   },
//   updateToken ({ commit }, token) {
//     commit(types.UPDATE_AUTHENTICATE, token)
//   },
//
}

// mutations
const mutations = {
  [types.SET_ACTIVE_PROJECT] (state, projectId ) {
    state.selectedProject = projectId
  },
  [types.SET_ACTIVE_SPACE] (state, spaceId) {
    state.selectedSpace = spaceId
  },
  [types.SET_ACTIVE_LAYOUT] (state, layoutId) {
    state.selectedLayout = layoutId
  }
}

export default {
  state,
  getters,
  actions,
  mutations
}

