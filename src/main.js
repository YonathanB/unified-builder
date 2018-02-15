if (window.location.search || window.location.hash) {
  var token;
  if (window.location.search)
    token = window.location.search.split("=")[1].split("&")[0];
  else
    token = window.location.hash.split("=")[1].split("&")[0];

  localStorage.setItem('access_token', token);
  if (window.opener) {
    //send token to parent window (device's web or Iframe)
    // TODO - test with origin
    window.opener.postMessage(token, location.origin);
    window.opener.postMessage(token, 'http://' + location.hostname + ':8082');
    window.close();
  }
}




import Vue from 'vue'
import App from './App.vue'
import Vuetify from 'vuetify'
import 'vuetify/dist/vuetify.css'
import Vuex from 'vuex/dist/vuex'
import {store} from './store'


Vue.use(Vuex);
Vue.use(Vuetify);


const loading = Vue.directive('loading',{
  params: ['loadingOptions'],
  handleShow () {
    let position = window.getComputedStyle(this.el).position;

    if (position === 'static' || position === '') {
      this.static = true;
      this.el.style.position = 'relative';
    }

    let box = document.createElement('div');
    box.className = 'vue-loading';
    box.style.backgroundColor = this.options.bg;
    this.el.appendChild(box);

    let msg = document.createElement('div');
    msg.className = 'vue-loading-msg';
    msg.textContent = this.options.text;
    box.appendChild(msg);

    window.requestAnimationFrame(() => {
      box.style.opacity = 1;
    });

    this.loadingBox = box;
  },
  handleHide () {
    this.loadingBox.addEventListener('transitionend', () => {
      this.loadingBox.remove();

      if (this.static) {
        this.el.style.removeProperty('position');
      }
    });

    this.loadingBox.style.opacity = 0.01;
  },
  bind () {
    // // is static
    // this.static = false;
    // // vue-loading dom
    // this.loadingBox = null;
    // // is first call update
    // this.first = true;
    // // default options
    // this.options = {
    //   text: 'Loading ...',
    //   bg: 'rgba(230, 233, 236, 0.8)'
    // };
    //
    // if (this.params.loadingOptions) {
    //   Object.assign(this.options, this.params.loadingOptions);
    // }
  },
  update (value) {
    if (value) {
      this.first = false;
      this.handleShow();
    } else {
      if (this.first) {
        this.first = false;
        return;
      }
      this.handleHide();
    }
  }
})

window.app = new Vue({
  el: '#app',
  store,
  render: h => h(App),
  created(){
    if(localStorage["access_token"])
      this.$store.dispatch('updateToken', localStorage["access_token"])
  },
})

export {
  loading
};


