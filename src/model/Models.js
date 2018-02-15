// import Vue from 'vue/dist/vue'
// import VueResource from 'vue-resource/dist/vue-resource'
// Vue.use(VueResource);
// var GET_TOKEN_URL = "https://auth.nebula-gamma.iruleav.com/auth/oauth/authorize?response_type=token&client_id=nebula-client&state=mJhE7hHXIuOoBVuMFotVtymLnvvphoehAsWuaYoJ&redirect_uri=" + window.location.origin + "/vue.html&scope=";
//
// var BUILDER_URL = "https://nebula-gamma.iruleav.com/builder";
var IMAGES_API_BASE = "https://nebula-gamma-images.s3.amazonaws.com/"


import Service from './../services/ajax'



function SplitRGBA(rgba) {
  var tmp = rgba.split("(")[1].split(")")[0].split(",");
  if (tmp.length <= 3) {
    tmp.push(1);
  }
  return tmp;
}
var AnalyzeActions = function (layer, prefix, actions, allElements) {
  var result = [];
  for (var j in actions) {
    var action = actions[j];
    if (action.type == "update_property") {
      if (action.property_name != "backgroundColor") {
        result.push(new AnalysisObject(1, layer, prefix + ": May only change background Color"));
      } else {
        var rgba = SplitRGBA(action.value);
        if (rgba[3] != 0 && rgba[3] != 1) {
          result.push(new AnalysisObject(3, layer, prefix + ": Property change to background with Alpha Channel"));
        }
      }

      if (action.view_id.length > 0) {
        for (var k in allElements) {
          var tmpElement = allElements[k];
          if (tmpElement.id == action.view_id) {
            if (tmpElement.type != "button") {
              result.push(new AnalysisObject(1, layer, prefix + ": Cannot change properties for non-buttons"));
            }
          }
        }
      }
    } else if (action.type == "conditional") {
      if (action.conditional_expression.hasOwnProperty("def_result")) {
        result = result.concat(AnalyzeActions(prefix, layer, action.conditional_expression.def_result.actions, allElements));
      }
      for (var c in action.conditional_expression.conds) {
        var cond = action.conditional_expression.conds[c];
        result = result.concat(AnalyzeActions(prefix, layer, cond.result.actions, allElements));
      }
    }
  }
  return result;
}





class AnalysisObject {
  constructor(level, layer, message) {
    this.level = level;
    this.layer = layer;
    this.message = message;
  }
}

class K_device {
  constructor(data, space_id) {
    this.space_id = space_id;
    for (var prop in data) {
      this[prop] = data[prop];
    }
    this.__driver = null;
  }




  getDrivers() {
    if(!this.__driver) {
      return Service.getDriversForDevice(this)
        .then((response) => {
          this.__driver = response || null;
        }, (error) => {
          console.log('error', error);
        })
    }
  }
}

class K_layout {
  constructor(data, project_id) {
    this.project_id = project_id;
    for (var prop in data) {
      this[prop] = data[prop];
    }

    this.__analysis = [];

    this.display = {
      imgPrvw: null,
      imgOverlay: null,
      imgContent: null
    };


    this.__events = [];
    this.__macros = [];
    this._uiAnalysis()
    this.computeLayoutDisplay();

  }

  computeLayoutDisplay() {
    var targetWidth = this.content.target_width;
    var targetHeight = this.content.target_height;

    var customRatio = 640.0 / targetWidth;

    var canvasWidth = targetWidth * customRatio;
    var canvasHeight = targetHeight * customRatio;
    if (this.content.elements.length === 0) return;
    var tmpElements = this.content.elements[0].elements;
    try {
      if (tmpElements.length <= 1 && tmpElements[0].elements.length > 0) {
        tmpElements = tmpElements[0].elements;
      }
    } catch (err) {
      console.log("New style of elements " + err);
    }


    var imgPrvw = {
      width: canvasWidth + 'px',
      height: canvasHeight + 'px',
      position: 'relative',
      float: 'left'
    };


    var imgOverlay = {
      width: canvasWidth + 'px',
      height: canvasHeight + 'px',
      position: 'absolute',
      left: '0',
      top: '0',
      'background-color': 'rgba(0,0,0,1)'
    };

    var imgContent = [];

    for (var elementId in tmpElements) {
      var currentElement = tmpElements[elementId];
      if (currentElement.hidden) {
        continue;
      }

      if ((currentElement.type != "button")
        && (currentElement.type != "background")) {
        continue;
      }

      var tmpElement = {
        styles: {
          "width": canvasWidth * currentElement.width + 'px',
          "height": canvasHeight * currentElement.height + 'px',
          "position": "absolute",
          "left": canvasWidth * currentElement.x + 'px',
          "top": canvasHeight * currentElement.y + 'px',
          "background-color": currentElement.backgroundColor
        }
      };

      if (currentElement.imageId && currentElement.imageId.length > 0) {
        tmpElement.styles["background-image"] = "url('" + IMAGES_API_BASE + currentElement.imageId + "')";
        var imageSize = currentElement.imageSize;
        if (imageSize == "stretch") {
          imageSize = "100% 100%";
        }
        if (imageSize == "normal") {
          imageSize = "initial";
        }
        tmpElement.styles["background-size"] = imageSize;
        tmpElement.styles["background-repeat"] = "no-repeat";
        tmpElement.styles["background-position"] = "center";

      }

      if (currentElement.text && currentElement.text.length > 0) {
        tmpElement.styles["font-size"] = currentElement.fontSize * customRatio + 'px';
        tmpElement.styles["font-family"] = currentElement.font;
        tmpElement.styles["font-weight"] = currentElement.fontBold ? "bold" : "normal";
        tmpElement.styles["color"] = currentElement.fontColor;
        tmpElement.styles["display"] = "table";

        tmpElement.text = {'text': currentElement.text};
        var textH = currentElement.textAlignment.split("-")[0];
        var textV = currentElement.textAlignment.split("-")[1];
        if (textV == "center") {
          textV = "middle";
        }
        tmpElement.text.styles = {
          "text-align": textH,
          'vertical-align': textV,
          'display': 'table-cell'
        }
      }
      imgContent.push(tmpElement);
    }
    this.display = {
      imgPrvw,
      imgOverlay,
      imgContent
    };
  }

  _uiAnalysis() {
    if (this.content.elements[0]) {
      var tmpElements = this.content.elements[0].elements;
      try {
        if (tmpElements.length <= 1 && tmpElements[0].elements.length > 0) {
          tmpElements = tmpElements[0].elements;
        }
      } catch (err) {
        console.log("New style of elements " + err);
      }
      var sectionOK = true;
      for (var elementId in tmpElements) {
        var currentElement = tmpElements[elementId];

        if ((currentElement.type != "button")
          && (currentElement.type != "background")) {
          this.__analysis.push(new AnalysisObject(1, 'UI', currentElement.name + ": type '" + currentElement.type + "' is not allowed"));
          if (sectionOK)
            sectionOK = false;
          continue;
        }
        var rgba = SplitRGBA(currentElement.backgroundColor);
        if (rgba.length == 4 && rgba[3] != 0 && rgba[3] != 1) {
          this.__analysis.push(new AnalysisObject(3, 'UI', currentElement.name + ": Background color has alpha channel"));
          if (sectionOK)
            sectionOK = false;
        }

        for (var i in currentElement.functions) {
          var func = currentElement.functions[i];
          this.__analysis = this.__analysis.concat(AnalyzeActions('UI', currentElement.name, func.actions, tmpElements));
          if (!sectionOK)
            sectionOK = false;
        }
        for (var i in currentElement.watched_events) {
          var ev = currentElement.watched_events[i];
          this.__analysis = this.__analysis.concat(AnalyzeActions('UI', currentElement.name, ev.actions, tmpElements));
          if (sectionOK)
            sectionOK = false;
        }
      }
      if (sectionOK) {
        this.__analysis.push(new AnalysisObject(0, "UI", "OK"));
      }
    }
  }
  _eventsAnalysis() {
    var sectionOK = true;
    for (var i in this.__events) {
      var tmpEvent = this.__events[i];
      this.__analysis = this.__analysis.concat(AnalyzeActions("Event", tmpEvent.name, tmpEvent.actions, this.content.elements[0].elements));
      sectionOK = false;
    }
    if (sectionOK) {
      this.__analysis.push(new AnalysisObject(0, "Events" ,"OK"));
    }
  }
  _macrosAnalysis() {
    var sectionOK = true;
    for (var i in this.__macros) {
      var tmpMacro = this.__macros[i];
      var tmp = AnalyzeActions("Macro", tmpMacro.name, tmpMacro.actions, this.content.elements[0].elements);
      if (tmp.length > 0) {
        sectionOK = false;
        this.__analysis = this.__analysis.concat(tmp);
      }
    }

    if (sectionOK) {
      this.__analysis.push(new AnalysisObject(0, "Macros", "OK"));
    }
  };




  getMacros() {
    if(!this.__macros) {
      this.__macros = []
      return Service.getMacrosInSpace(this)
        .then((response) => {
          this.__macros = response;
          this._macrosAnalysis();
          return this;
        }, (error) => {
          console.log('error', error);
        })
    }
    else return Promise.resolve(this.__macros)
  }
  getEvents() {
    if(!this.__events) {
      this.__events = []
      return Service.getEventsInSpace(this)
        .then((response) => {
          this.__events = response;
          this._eventsAnalysis();
          return this;
        }, (error) => {
          console.log('error', error);
        })
    }
    else return Promise.resolve(this.__events)
  }
}


// Classes

class K_space {
  constructor(data) {
    for (var prop in data) {
      this[prop] = data[prop];
    }
    this.__analysis = [];

    this.__layouts = null;
    this.__devices = null;
    this.__gateways = null;

  }


  _gatewaysAnalysis() {
    var sectionOK = true;
    for (var i in this.__gateways) {
      for (var j in this.__gateways[i].connections) {
        for (var k in this.__gateways[i].connections[j].paths) {
          var path = this.__gateways[i].connections[j].paths[k];
          if (path.output_type == "HTTP") {
            sectionOK = false;
            this.__analysis.push(new AnalysisObject(2, 'Gateway', this.__gateways[i].name + ": HTTP protocol only partially supported"));
          }
        }
      }
    }
    if (sectionOK) {
      this.__analysis.push(new AnalysisObject(0, "Gateways", "OK"));
    }
  }
  _devicesAnalysis() {
    var sectionOK = true;
    for (var i in this.__devices) {
      var driver = this.__devices[i].__driver;
      // Check if requires login
      if(driver) {
        try {
          for (var j in driver.device_interface) {
            var iface = driver.device_interface[j];
            if (iface.hasOwnProperty("login") && iface.login.requires_login) {
              sectionOK = false;
              this.__analysis.push(new AnalysisObject(2, "Driver", driver.device_models + ": Requires login, work with caution"));
            }
          }
        } catch (err) {
          console.error(err);
        }

        // Check for Lua Code
        try {
          for (var catId in driver.categories) {
            var category = driver.categories[catId];
            for (var capId in category.capabilities) {
              var capability = category.capabilities[capId];
              for (var cmdId in capability.commands) {
                var command = capability.commands[cmdId];
                for (var codeId in command.codes) {
                  var code = command.codes[codeId];
                  if (code.hasOwnProperty("lua_code") && code.lua_code.length > 0) {
                    this.__analysis.push(new AnalysisObject(3, "Driver-Command", driver.device_models + ": " +
                      category.name + "/" + capability.name + "/" + command.name + " Uses Lua"));
                  }
                }
              }
              for (var feedbackId in capability.feedbacks) {
                var feedback = capability.feedbacks[feedbackId];
                for (var codeId in feedback.codes) {
                  var code = feedback.codes[codeId];
                  if (code.hasOwnProperty("lua_code") && code.lua_code.length > 0) {
                    this.__analysis.push(new AnalysisObject(3, "Driver-Feedback", +driver.device_models + ": " +
                      category.name + "/" + capability.name + "/" + feedback.name + " Uses Lua"));
                  }
                }
              }
            }
          }
        } catch (err) {
          console.error(err);
        }
      }
    }
    if (sectionOK) {
      this.__analysis.push(new AnalysisObject(0, "Drivers", "OK"));
    }
  }



  getLayouts() {
    if (!this.__layouts) {
      this.__layouts = []
      const _self = this
      return Service.getLayoutsInSpace(this)
        .then((response) => {
          for (let i = 0; i < response.length; i++) {
            let layout = new K_layout(response[i], _self.project_id);
            _self.__layouts.push(layout);
          }
          return _self.__layouts;
        })
    } else
      return Promise.resolve(this.__layouts)
  }
  getGateways() {
    if (!this.__gateways) {
      this.__gateways = []
      return Service.getGatewaysInSpace(this)
        .then((response) => {
          this.__gateways = response;
          this._gatewaysAnalysis();
        }, (error) => {
          console.log('error', error);
        })
    } else
      Promise.resolve(this.__gateways)
  }
  getDevices() {
    if(!this.__devices) {
      this.__devices = []
      return Service.getDevicesInSpace(this)
        .then((response) => {
          return response.map(deviceData => {
            let device = new K_device(deviceData, this.id)
            this.__devices.push(device)
            return device
          });

        }, (error) => {
          console.log('error', error);
        })
    }
    else
     return Promise.resolve(this.__devices)
  }
}


class K_project {
  constructor(data) {
    for (var prop in data) {
      this[prop] = data[prop];
    }
    this.__spaces = [];
  }

  getSpaces() {
    var _self = this;
    if (this.__spaces.length === 0) {
      return Service.getSpaceByProjectId(_self.id)
        .then((response) => {
          return response.map(spaceData =>{
          return new K_space(spaceData)
          })

        }, (error) => {
          console.log('Failed loading projects ', error);
        })
    }
  }
}
export {
  K_project,
  K_space,
  K_layout,
  K_device
}

