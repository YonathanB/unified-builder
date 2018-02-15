import Vue from 'vue'
import VueResource from 'vue-resource'
import {store} from '../store/index'

Vue.use(VueResource);

Vue.http.options.root = 'http://localhost:8082/'
Vue.http.headers.common['Content-Type'] = 'application/x-www-form-urlencoded;charset=UTF-8';
Vue.http.headers.post['Content-Type'] = 'application/x-www-form-urlencoded;charset=UTF-8';
Vue.http.interceptors.push(function (request, next) {
  let token = localStorage['access_token']
  if(token)
  request.headers.set('Authentication', token);

  // continue to next interceptor
  next((response) => {
    if (response.body.hasOwnProperty('error') && response.body.error === 'invalid_token') {
      store.dispatch('onTokenInValid');
      // return store.dispatch('openLoginPopup')

    }
    // else if (response.body.content === undefined)
    //   store.onServerError();
    if (request.after) {
      request.after.call(this, response);
    }
  });
});


const $projects = Vue.resource('projects');
const $spaces = Vue.resource('spaces');
const $layouts = Vue.resource('layouts');
const $devices = Vue.resource('devices');
const $events = Vue.resource('events');
const $gateways = Vue.resource('gateways');
const $macros = Vue.resource('macros');
const $drivers = Vue.resource('drivers');


const callBackFunction = function(valueToReturn){
  if (valueToReturn.body && !valueToReturn.body.hasOwnProperty('error'))
    return  valueToReturn.body.content || valueToReturn.body ;
  else
    return valueToReturn.error
}

export default {

  getAllProjects() {
    return $projects.get().then((response) => callBackFunction(response))
  },
  getSpaceByProjectId(projectId) {
    return $spaces.get({projectId: projectId}).then((response) =>  callBackFunction(response) )
  },
  getLayoutsInSpace(space) {
    return $layouts.get({projectId: space.project_id, spaceId: space.id}).then((response) =>   callBackFunction(response) )
  },
  getDevicesInSpace(space) {
    return $devices.get({projectId: space.project_id, spaceId: space.id}).then((response) => callBackFunction(response) )
  },
  getEventsInSpace(space) {
    return $events.get({projectId: space.project_id, spaceId: space.id}).then((response) => callBackFunction(response))
  },
  getGatewaysInSpace(space) {
    return $gateways.get({projectId: space.project_id, spaceId: space.id}).then((response) => callBackFunction(response))
  },
  getMacrosInSpace(space) {
    return $macros.get({projectId: space.project_id, spaceId: space.id}).then((response) => callBackFunction(response))
  },
  getDriversForDevice(device) {
    return $drivers.get({
      driverVersion: device.device_driver_version,
      driverId: device.device_driver_id
    }).then((response) => callBackFunction(response))
  }
}
