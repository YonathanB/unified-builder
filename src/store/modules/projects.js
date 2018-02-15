import * as types from '../mutation-types'
import service from '../../services/ajax'

import {K_layout, K_project} from "../../model/Models";

var buildHierarchy = function (arry) {

  var roots = [], children = {};

  // find the top level nodes and hash the children based on parent
  for (var i = 0, len = arry.length; i < len; ++i) {
    var item = arry[i],
      p = item.parent_id,
      target = !p ? roots : (children[p] || (children[p] = []));

    target.push({value: item});
  }

  // function to recursively build the tree
  var findChildren = function (parent) {
    if (children[parent.value.id]) {
      parent.children = children[parent.value.id];
      for (var i = 0, len = parent.children.length; i < len; ++i) {
        findChildren(parent.children[i]);
      }
    }
  };

  // enumerate through to handle the case where there are multiple roots
  for (var i = 0, len = roots.length; i < len; ++i) {
    findChildren(roots[i]);
  }

  return roots;
}


const state = {
  appIsLoading : false,
  loadingLayouts: false,
  activeProject: null,
  activeSpace: null,
  activeLayout: null,
  computingLayoutPreview: false,
  computingLayoutAnalysis: false,
  projects: {
    byId: {},
    all: []
  },
  spaces: {
    byId: {},
    all: [],
  },
  layouts: {
    byId: {},
    all: []
  },
  devices: {
    byId: {},
    all: []
  },
  events: {
    byId: {},
    all: []
  },
  macros: {
    byId: {},
    all: []
  },
  gateways: {
    byId: {},
    all: []
  },
}

// getters
const getters = {
  getAccessToken: () =>localStorage['access_token'],
  isComputingLayoutAnalysis: state => state.computingLayoutAnalysis,
  appIsLoading: state => state.appIsLoading,
  allProjects: state => state.projects.all.map(projectId => state.projects.byId[projectId]),
  projectsFilteredByName: (state, getters) => {
    return (str) => {
      if (!str) return getters.allProjects;
      return getters.allProjects.filter(function (project) {
        return project.name.toUpperCase().indexOf(str.toUpperCase()) !== -1;
      })
    }
  },
  allSpaces: state => state.spaces.all.map(spaceId => state.spaces.byId[spaceId]),
  spacesByProjectId: (state, getters) => {
    return (projectId) => {
      return buildHierarchy(getters.allSpaces.filter(space => space.project_id === projectId))
    }
      //
  },


 getSelectedSpace: state => state.activeSpace,

  allLayouts: state => state.layouts.all.map(layoutId => state.layouts.byId[layoutId]),
  layoutsInSpace: (state, getters) => {
    return (spaceId) => getters.allLayouts.filter(layout => layout.space_id === spaceId)
  },
  allDevices: state => state.devices.all.map(deviceId => state.devices.byId[deviceId]),
  devicesInSpace: (state, getters) => {
    return (spaceId) => getters.allDevices.filter(device => device.space_id === spaceId)
  },
  allEvents: state => state.events.all.map(eventId => state.events.byId[eventId]),
  eventsInSpace: (state, getters) => {
    return (spaceId) => getters.allEvents.filter(event => event.space_id === spaceId)
  },
  allMacros: state => state.macros.all.map(macroId => state.macros.byId[macroId]),
  macrosInSpace: (state, getters) => {
    return (spaceId) => getters.allMacros.filter(macro => macro.space_id === spaceId)
  },

  allGateways: state => state.gateways.all.map(gatewayId => state.gateways.byId[gatewayId]),
  gatewaysInSpace: (state, getters) => {
    return (spaceId) => getters.allGateways.filter(gateway => gateway.space_id === spaceId)
  },

  mergeAnalysis: (state, getters) => {
    return (spaceId, layoutId) => {
       let sp = getters.allSpaces.filter(space => space.id === spaceId)[0];
       let lay = getters.allLayouts.filter(layout => layout.id === layoutId)[0];
      //  return sp.__analysis.concat(lay.__analysis)
       return state.spaces.byId[spaceId].__analysis.concat( state.layouts.byId[layoutId].__analysis)
      }

}
}


// actions
const actions = {
  getSpacesInProject(store, project){
   return project.getSpaces()
   },
  getAllProjects(store) {
    store.commit(types.LOADING_APP, true)
    service.getAllProjects().then((projectsData) => {
      var promises = []
      let projects = projectsData.map(singleProjectData => {
           var proj = new K_project(singleProjectData)
           let prom =  store.dispatch('getSpacesInProject', proj)
           .then((spacesData) => {
             store.commit(types.SPACES_LOADED, spacesData)
           })

           promises.push( prom )
           return proj
        } )
        store.commit(types.PROJECTS_LOADED, projects)

        Promise.all(promises).then((response) =>
          store.commit(types.LOADING_APP, false)
        )
      })
    },

    onSpaceSelected(store, space){
      store.commit(types.SET_ACTIVE_PROJECT, space.project_id)
      store.commit(types.SET_ACTIVE_SPACE, space.id)
    },

    getSpaceData(store, spaceId) {
      // if(!state.spaces.byId[spaceId].__layouts.length) {
        store.commit(types.SET_ACTIVE_SPACE, spaceId)
        store.commit(types.LOADING_APP, true)
        let space = store.state.spaces.byId[spaceId]
        const promises = [];

        space.getLayouts().then((layouts) => {
          store.commit(types.LAYOUTS_LOADED, layouts)
          store.commit(types.COMPUTING_LAYOUT_ANALYSIS, true)
          store.commit(types.LOADING_APP, false)

          layouts.map(layout => {
            promises.push(layout.getMacros())
            promises.push(layout.getEvents())
          })
        })
        promises.push(space.getGateways());
        promises.push(space.getDevices().then((devices) => {
          store.commit(types.DEVICES_LOADED, devices)

          return Promise.all(
            devices.map(device => device.getDrivers())
          ).then(
            (response) => {
              space._devicesAnalysis()
            })
        }))


        Promise.all(promises).then((response) => store.commit(types.COMPUTING_LAYOUT_ANALYSIS, false))
      // }
  },
  onTokenUpdated(store){
    console.log('Token updated')
    if(store.getters.allProjects.length === 0)
      store.dispatch('getAllProjects');
  },

  getLayoutDataForAnalysis(store, space) {
    let promises = [];
    promises.push(service.getDevicesInSpace(space, (devices, error) => {
      if (devices) {
        store.commit(types.DEVICES_LOADED, {devices, space})
       let promises = store.getters.devicesInSpace(space.id).map(device =>
          service.getDriversForDevice(device, (drivers) => {
            if(drivers)
              store.commit(types.DRIVERS_LOADED, {drivers, device})
          })
        )
        Promise.all(promises).then((response) =>{
          store.getters.layoutsInSpace(space.id).map(layout => layout._devicesAnalysis(store.getters.devicesInSpace(space.id)))
        })
      }
    }))
    promises.push(service.getEventsInSpace(space, (events, error) => {
      if (events)
        store.commit(types.EVENTS_LOADED, {events, space})
    }))
    promises.push(service.getGatewaysInSpace(space, (gateways, error) => {
      if (gateways) {
        gateways.map(gatewayData => gatewayData.space_id = space.id)
        store.commit(types.GATEWAYS_LOADED, {gateways, space})
      }
    }))
    promises.push(service.getMacrosInSpace(space, (macros, error) => {
      if (macros)
        store.commit(types.MACROS_LOADED, {macros, space})
    }))

    Promise.all(promises).then((response) => {


      store.getters.layoutsInSpace(space.id).map(
        layout => {
          layout._gatewaysAnalysis(store.getters.gatewaysInSpace(space.id));
          layout._eventsAnalysis(store.getters.eventsInSpace(space.id));
          layout._macrosAnalysis(store.getters.macrosInSpace(space.id));
        })
    })
  },
}


var insertSpacesInStore = function (spaces) {
  for(var i = 0; i < spaces.length; i++){
    if(spaces[i].hasOwnProperty('value'))
      insertInStore('spaces', spaces[i].value)
    if(spaces[i].hasOwnProperty('children'))
      insertSpacesInStore(spaces[i].children)
  }
}
  var insertInStore = function (storeProperty, data) {
    data.map(dataToInsert => {
    state[storeProperty].byId[dataToInsert.id] = dataToInsert;
    if (state[storeProperty].all.indexOf(dataToInsert.id) === -1)
      state[storeProperty].all.push(dataToInsert.id)
  })

}


// mutations
const mutations = {
  [types.LOADING_APP](state, value) {
    state.appIsLoading = value
  },
  [types.PROJECTS_LOADED](state, projectsArr) {
    insertInStore('projects', projectsArr)
  },
  [types.SPACES_LOADED](state, spacesArr) {
    insertInStore('spaces', spacesArr)
  },



  [types.SET_ACTIVE_PROJECT](state, projectId) {
    state.activeProject = projectId;
  },
  [types.SET_ACTIVE_SPACE](state, spaceId) {
    state.activeSpace = spaceId;
  },
  [types.SET_ACTIVE_LAYOUT](state, layoutId) {
    state.activeLayout = layoutId;
  },
  [types.LOADING_LAYOUT](state, value) {
    state.loadingLayouts = value
  },
  [types.LAYOUTS_LOADED](state, layoutsArr) {
    insertInStore('layouts', layoutsArr)
  },
  [types.EVENTS_LOADED](state, eventsArr) {
    insertInStore('events', eventsArr)
  },
  [types.DEVICES_LOADED](state, devicesArr) {
    insertInStore('devices', devicesArr)
  },
  [types.DRIVERS_LOADED](state, driversArr) {
    insertInStore('drivers', driversArr)
  },
  [types.GATEWAYS_LOADED](state, gatewaysArr) {
    insertInStore('gateways', gatewaysArr)
  },
  [types.MACROS_LOADED](state, macrosArr) {
    insertInStore('macros', macrosArr)
  },

  [types.COMPUTING_LAYOUT_ANALYSIS](state, value) {
    state.computingLayoutAnalysis = value
  },

  [types.COMPUTING_LAYOUT_PREVIEW](state, value) {
    state.computingLayoutPreview = value
  },

}

export default {
  state,
  getters,
  actions,
  mutations
}
