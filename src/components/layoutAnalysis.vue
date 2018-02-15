<template>
 <v-container  class="layout-analysis" id="layout-analysis" >
               <span id="analysis-title">Analysis</span>
   <!--TODO v-resize="onResize" :style="AnalysisWindowSize"-->
               <v-card class="scroll-y" style="max-height: 350px"  >
                  <v-card-text v-if="!computingLayoutAnalysis">
                     <div v-for="(analyse, i) in layoutAnalysis" :key="i">
                        <v-flex>
                           <v-icon v-if=" analyse.level !== 0" :class="{
                                   'danger-analyse': analyse.level === 1,
                                   'critical-analyse': analyse.level === 2,
                                   'warning-analyse': analyse.level === 3,
                                   'success-analyse': analyse.level === 0
                           }">warning</v-icon>
                          <v-icon v-if=" analyse.level === 0" class="success-analyse">check_circle</v-icon>
                           <span class="analysis-layer">{{analyse.layer}}</span><span>{{analyse.message}}</span>
                        </v-flex>
                     </div>
                  </v-card-text>
                 <v-card-text v-else>
                   <v-flex><v-progress-circular indeterminate color="green" />ComputingAnalysis</v-flex></v-card-text>
               </v-card>
            </v-container>
</template>

<script>
import {mapGetters, mapActions} from "vuex";

export default {
  name: "krLayoutAnalysis",
  props: ["layoutId", "spaceId"],
  computed: {
    computingLayoutAnalysis: function () {
      return this.$store.getters.isComputingLayoutAnalysis
    },
    layoutAnalysis: function () {
      return this.$store.getters.mergeAnalysis(this.spaceId, this.layoutId)
    }
  }
  // mounted() {
  //   this.onResize()
  // },
  // methods:{
  //   onResize(){
  //     // this.analysisCardSize = {  height: window.innerHeight - 130 +'px' }
  //   }
  // }
};
</script>

<style scoped>
.icon.warning-analyse {
  color: #ffbb22;
}

.icon.critical-analyse {
  color: #ff5722cf;
}

.icon.danger-analyse {
  color: #f44336;
}

.icon.success-analyse {
  color: #0cc146;
}

.analysis-layer {
  background: gray;
  color: white;
  margin: 0px 10px;
  border-radius: 50px;
  padding: 3px 4px;
  font-size: 11px;
}
</style>
