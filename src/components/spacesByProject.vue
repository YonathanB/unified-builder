<template>
  <li>
  <v-flex @click="getSpaceData(model.value)" align-content-center	 justify-start :class="{'selected': isSelected}">
    <!--:class="{'selected': selectedSpace ==  model.value.id}">-->

  <v-icon v-if="isFolder">domain</v-icon>
  <span> {{ model.value.name }}</span>
  </v-flex>
  <ul  v-if="isFolder" >
  <kr-spaces  v-for="(space, index) in model.children"
  :key="index" :model="space" />
  </ul>
  </li>
</template>

<script>
export default {
  name: "krSpaces",
  props: {
    model: Object
  },
  data: function () {
    return {
      open: false
    }
  },
  computed: {
    isFolder: function () {
      return this.model.children &&
        this.model.children.length
    },
    isSelected: function () {
      console.log('sdfsdfddff')
      return this.$store.getters.getSelectedSpace === this.$props.model.value.id
    }
  },
  methods: {
    getSpaceData: function (space) {
      this.$store.dispatch('onSpaceSelected', space)
    }
  }
}
</script>

<style scoped>

.k-space .item {
  cursor: pointer;
}

.k-space .bold {
  font-weight: bold;
}

ul.k-space {
  line-height: 2.5em;
  list-style-type: dot;
  justify-content: start
}

.k-space li {
  padding-left: 1em;
  display: flex;
  flex-direction: column;
  width: 100%;
  cursor: pointer;
  /*background: #e8e8e8;*/

}

.k-space li div {
  padding-left: 2.5em;
}

.k-space li div:hover {
  color: #6db3fc;
  font-weight: bold
}
.k-space li div.selected span{
  /*color: #638590;*/
  color: #2866a3;
  background-color: #e2e2e2;
  padding: 3px 15px;
  border-radius: 50px;
}

</style>
