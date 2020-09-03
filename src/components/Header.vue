<template>
  <div class="header column col-9">
    {{ name ? name.split(" ")[0] : "ESCOLHA UM TALHÃO" }}
    <strong>{{ name ? name.split(" ")[1] : "" }}</strong>
  </div>
</template>

<script>
import Vue from 'vue'

export default Vue.extend({
  name: 'header',
  props: {
    item: {
      type: String,
      default: null
    },
  },
  data () {
    return {
      name: null
    }
  },
  watch: {
    item: {
      immediate: true, 
        handler (val) {
          this.name = val
        }
      }
    }
})
</script>

<style lang="scss">
  .header {
    height: 60px;
    background-color: #256014;
    display: flex;
    justify-content: center;
    align-items: center;
    color: #FFF;

    strong {
      margin-left: 8px;
    }

  }
</style>