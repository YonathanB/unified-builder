<template>
<v-card id="projects-list">
   <v-toolbar flat dense color="blue darken-1 " dark v-if="!displaySearch">
      <v-toolbar-title>Projects</v-toolbar-title>
      <v-flex></v-flex>
      <v-btn icon @click="toggleSearchBar()">
         <i class="material-icons">search</i>
      </v-btn>
   </v-toolbar>
   <v-toolbar color="blue darken-1" dense dark flat v-else transition="slide-y-transition">
      <v-text-field :autofocus="enableAutoFocus" color="white"  v-model="searchText" clearable style="margin-bottom: -15px"
        prepend-icon="search" label="Search project"/>
      <v-btn flat icon @click="toggleSearchBar()" class="text-xs-right">
         <v-icon>undo</v-icon>
      </v-btn>
   </v-toolbar>
  <v-card color="grey lighten-4" fill-height>
   <v-expansion-panel color="grey lighten-4" v-if="filteredProjects(searchText).length > 0" :style="ProjectsWindowSize" class="scroll-y"
     v-resize="onResize">
      <v-expansion-panel-content ripple  v-for="(project, i) in filteredProjects(searchText) " :key="i" lazy>
         <div slot="header">{{project.name}}</div>
         <v-expansion-panel class="k-space">
            <kr-spaces v-for="(space, _i) in spacesByProjectId(project.id)" :key="_i" :model="space" />
         </v-expansion-panel>
      </v-expansion-panel-content>
   </v-expansion-panel>
    </v-card>
</v-card>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import krSpaces from './spacesByProject'

export default {
  name: "krProjectList",

  data: () => ({
    displaySearch: false,
    enableAutoFocus: true,
    searchText: '',
    ProjectsWindowSize: {
      'max-height': 0,
      'min-height': '200px',
      "background-color": "#e0e0e0"
    }
  }),
  components: {krSpaces},
  computed:
    mapGetters({
      filteredProjects: 'projectsFilteredByName',
      spacesByProjectId: 'spacesByProjectId'

    }),
  methods: {
    toggleSearchBar: function () {
      this.displaySearch = !this.displaySearch;
      if (!this.displaySearch)
        this.searchText = '';
    },
    onResize() {
      this.ProjectsWindowSize['max-height'] = window.innerHeight - 90 + 'px';

    }
  },
  mounted: function () {
    this.onResize()
  }
}
</script>

<style scoped>
  #projects-list{
    box-shadow: none;
  }
li.expansion-panel__container:not(.expansion-panel__container--active){
  background-color:#f5f5f5 !important
}
.expansion-panel{
  box-shadow: none;
}
  /*.expansion-panel__body{*/
    /*background-color: white  !important;*/
  /*}*/
</style>
