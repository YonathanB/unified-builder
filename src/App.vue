<template>
   <div id="app">
        <v-app >

 <v-container v-if="!firstConnection" class="text-xs-center"  >
   <v-flex >
    <p style="font-size: 25px"><span style="font-size: 50px; font-weight: bold">Oops!</span> Seems you're not Logged in.</p>
      <v-btn color="blue darken-1 " dark large block  @click.native="K_ControlLogin()">
        <span>Log In</span>
        <!--<span style="position: absolute; margin-left: 50px;"><v-progress-circular indeterminate :width="3" color="white" v-if="!isAppReady"/></span>-->
      </v-btn>
   </v-flex>
 </v-container>
          <!--TODO - Keep it for server errors-->
            <v-container fluid grid-list-md class="grey lighten-3 pa-0" v-loading="true">

                  <v-snackbar :timeout="timeoutSnackLogin" :top="true" v-model="isTokenExpired ">
                {{ LoginSnackBarText }}
                <v-btn flat color="pink" @click.native="K_ControlLogin()">Login</v-btn>
           </v-snackbar>

              <v-layout  row wrap fluid fill-height>
                <v-flex sm6 md3 class="pa-0" style="background-color: #f5f5f5"><kr-project-list v-resize="onProjectListResized" /></v-flex>
                <v-flex sm12 md7 order-sm3 order-md2 class="pa-0 "><kr-layouts-preview  :space-id="selectedSpace"/></v-flex>
                 <!--:style="layoutWindowSize" -->
                <v-flex sm6 md2 d-flex order-sm2 order-md3 class="pa-0"><kr-devices-list :space-id="selectedSpace"/></v-flex>
              </v-layout>
</v-container>

            <v-footer app> <v-progress-linear :indeterminate="true" v-if="appIsLoading" color="blue-grey darken-3"/></v-footer>
        </v-app>

    </div>
</template>

<script>


import * as types from './store/mutation-types'
import { auth } from './utils/authentication';
import krProjectList from './components/projectsList'
import krLayoutsPreview from './components/layoutsPreview'
import krDevicesList from './components/devicesList'
import krLayoutAnalysis from './components/layoutAnalysis'
import { mapGetters, mapActions } from 'vuex'
import { loading } from './main'

export default {
  name: 'app',
  data: () => ({
    timeoutSnackLogin: 10000000,
    LoginSnackBarText: 'Your login session has expired',
    layoutWindowSize: {
      'max-height': 0,
      'min-height': '200px',
      "background-color": "#e0e0e0"
    }
  }),
  components: {krProjectList, krLayoutsPreview, krDevicesList, krLayoutAnalysis},
  watch: {},
  computed:
    mapGetters({
      appIsLoading: 'appIsLoading',
      isTokenExpired: 'isNotLoggedIn',
      selectedSpace: 'getSelectedSpace',
      devices: 'devicesInSpace',
      firstConnection: 'getAccessToken',

      }),
  directives: { loading },
  created(){
    this.$store.dispatch('getAllProjects')
  },
  beforeMount: function () {

  },
  mounted: function () {

  },
  methods: {
    K_ControlLogin: function () {
      var _that = this;
      auth.login({
        callback: function (tokenFromPopup) {
          _that.$store.dispatch('updateToken', tokenFromPopup)
        }
        });

    },
    onProjectListResized: function(){

    }
  }
}
</script>

<style>
.vue-loading {
  position: absolute;
  top: 0px;
  left: 0px;
  z-index: 1000;
  margin: 0px;
  padding: 0px;
  width: 100%;
  height: 100%;
  border: none;
  background-color: rgba(230, 233, 236, 0.8);
  cursor: wait;
  opacity: 0;
  transition: opacity .4s;
}

.vue-loading-msg {
  box-sizing: content-box !important;
  position: absolute;
  z-index: 1001;
  margin: 0px;
  padding: 0 35px;
  height: 40px;
  top: 20%;
  left: 50%;
  text-align: center;
  font-size: 14px;
  line-height: 40px;
  cursor: wait;
  background-color: #f4f4f4;
  border-radius: 4px;
  box-shadow: 0 1px 8px rgba(0,0,0,.15);
  border: solid 1px #bbb;
  transform: translateX(-50%);
}
</style>
