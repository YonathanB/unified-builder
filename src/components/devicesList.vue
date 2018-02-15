<template>

<v-card class="pa-0" color="grey lighten-4"  v-if="spaceId">
   <v-toolbar flat dense color="blue lighten-1 " dark>
      <v-toolbar-title >Devices</v-toolbar-title>
   </v-toolbar>
  <!-- TODO v-resize="onResize"-->
   <v-card  color="grey lighten-4" flat class="scroll-y" style="max-height: calc(100vh - 85px)">
      <v-list class="pa-0 devices-list" color="grey lighten-4" style=" background-color: transparent" dense>
         <template v-for="(device, i) in devices">
            <v-list-tile v-bind:key="i" @click="" >
               <v-list-tile-content class="custom-list-height">
                  <v-list-tile-title style="font-size:13px">
                     <span :class="device.class">{{device.name}}</span>
                  </v-list-tile-title>
               </v-list-tile-content>
            </v-list-tile>
         </template>
      </v-list>
   </v-card>
</v-card>
</template>

<script>
export default {
    name: "krDevicesList",
  props: ['spaceId'],
  computed:{
      devices: function(){
        return this.$store.getters.devicesInSpace(this.spaceId)
      }
  }
}
</script>

<style scoped>
.devices-list li a.list__tile{
  height: auto;
}

</style>
