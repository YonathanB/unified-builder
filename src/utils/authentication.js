// const API_URL = 'http://localhost:8082/'
 const LOGIN_URL = "https://auth.nebula-gamma.iruleav.com/auth/oauth/authorize?response_type=token&client_id=nebula-client&state=mJhE7hHXIuOoBVuMFotVtymLnvvphoehAsWuaYoJ&redirect_uri=" + encodeURIComponent(window.location.href) + "&scope="
// const SIGNUP_URL = API_URL + 'users/'


class authentication{
  constructor(){

    this.token = null;
    this.authenticated = false;
  }

  onTokenInvalid(){
    this.token = null;
    this.authenticated = false;
  }

  login(options){
    var that = this;
    that._oauthWindow = window.open( LOGIN_URL, 'ConnectWithOAuth', "location=0,status=0,width=500,height=500,left=" + (screen.width / 2 - (500 / 2)) + ",top=" + (screen.height / 2 - (500 / 2)));
    if (that._oauthWindow) { // there is a bug in chrome to get blocked popup
      that._oauthInterval = window.setInterval(function () {
        if (that._oauthInterval && that._oauthWindow && that._oauthWindow.closed) {
          window.clearInterval(that._oauthInterval);
          that._oauthInterval = undefined;
          options.callback(localStorage.getItem('access_token'));
        }
      }, 1000);
    }
  }
}


export const auth = new authentication();
