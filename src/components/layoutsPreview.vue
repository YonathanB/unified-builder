<template>
<v-card color="grey lighten-3" class="layouts-content pa-0" v-if="spaceId">
  <div v-if="layoutsInSpace(spaceId)">
  <v-toolbar color="blue lighten-1 " dark dense flat tabs>
  <v-toolbar-title>Layouts</v-toolbar-title>
      <v-tabs v-if="layoutsInSpace(spaceId)" slot="extension" grow light v-model="activeTab" style="border-bottom: 1px solid #dadada">
         <v-tabs-slider color="blue darken-1"></v-tabs-slider>
         <v-tab
           v-for="(layout, i) in layoutsInSpace(spaceId)"
           :key="i"
           :href="'#'+i" >
            {{ layout.name }}
         </v-tab>
      </v-tabs>
     </v-toolbar>

   <v-container  v-if="layoutsInSpace(spaceId) && layoutsInSpace(spaceId).length == 0 && !appIsLoading"
     class="text-xs-center" style="height: 300px" fill-height justify-center>
     <h2  style="text-align: center">No Layout for this space</h2>
   </v-container>

      <v-tabs-items v-model="activeTab" >
         <v-tab-item
           v-for="(layout, i) in layoutsInSpace(spaceId)"
           :key="i"
           :id="''+i"  >

           <v-container v-resize="onResize" :style="layoutSize" class="scroll-y pa-0 ma-0">
            <v-container class="layout scroll-y" justify-center  v-if="layout.display.imgPrvw">
               <div id="#preview"  :style="layout.display.imgPrvw">
                  <div class="content" :style="layout.display.imgOverlay">
                     <div v-for="(content, i) in layout.display.imgContent" :key="i" :style="content.styles">
                        <span v-if="content.text" :style="content.text.styles">{{content.text.text}}</span>
                     </div>
                  </div>
               </div>
            </v-container>
           <v-container v-else  class="text-xs-center" fill-height justify-center>
              <h2  style="text-align: center">No preview for this layout</h2>
           </v-container>
              <v-divider  />
           <kr-layout-analysis :layout-id="layout.id" :space-id="spaceId"/>
             </v-container>
         </v-tab-item>
      </v-tabs-items>
  </div>

</v-card>

</template>

<script>
  import {mapGetters, mapActions} from 'vuex'
  import krLayoutAnalysis from './layoutAnalysis'

  export default {
    name: "krLayoutsPreview",
    props: ['spaceId'],
    computed: {
      ...mapGetters([
        'layoutsInSpace', 'appIsLoading',
      ])
    },
    mounted() {
      this.onResize()
    },
    watch: {
      spaceId: function (newSpaceId, oldSpaceId) {
        this.$store.dispatch('getSpaceData', newSpaceId);
        this.activeTab = "0"
      }
    },
    components: {krLayoutAnalysis},
    data: () => ({
      activeTab: "0",
      layoutSize: {height: window.innerHeight}
    }),
    methods:{
      onResize(){
        this.layoutSize = {  height: window.innerHeight - 135 +'px' }
      }
    }
  }
</script>

<style scoped>


</style>
