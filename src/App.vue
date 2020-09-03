<template>
  <div id="app">
    <div class="container">
      <div class="columns">
        <div class="brand column col-3">
          <img width="45" height="45" :src="require('./assets/logo-icon.png')" alt="brand">
        </div>
        <header-component :item="name" />
      </div>
      <div class="columns">
        <div class="left-menu column col-3">
          <ul class="nav" v-if="fields && fields.length">

            <li class="nav-item" 
              v-bind:class="{ 'loading': loading }" 
              v-bind:style=" loading ? 'display:block' : 'display:none' "
            >
              <div class="name"></div>
              <div class="button"></div>
            </li>

            <li class="nav-item" 
              v-for="field of fields" 
              @click="selected = field.field_id" 
              v-bind:class="{'loading': loading, select:selected == field.field_id}" 
              :key="field.field_id"
            >
              <div class="name" v-on:click="setFieldID(field.field_id, field.name)">
                {{ field.name }}<br>{{ field.size }} {{ field.unity }}
              </div>
              
              <div class="button">
                <a v-on:click="setEditMode(field.field_id, field.name)">
                  <svg-icon 
                    class="svg-icon" 
                    v-bind:class="{'svg-icon-select':selected == field.field_id}" 
                    icon="edit" 
                    :hasFill="false">
                  </svg-icon>
                </a>
                <a v-on:click="deleteField(field.field_id, field.name)">
                  <svg-icon 
                    class="svg-icon" 
                    v-bind:class="{'svg-icon-select':selected == field.field_id}" 
                    icon="delete" :hasFill="false">
                  </svg-icon>
                </a>
              </div>
            </li>

          </ul>
          <div class="add column col-3">
            <a v-on:click="setCreateField">
              <svg-icon class="svg-icon" icon="plus" :hasFill="false"></svg-icon>
            </a>
          </div>
        </div>
        <div class="main column col-9">
          <mapas :item="id" :editMode="edit" :createMode="createField" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import SvgIcon  from './components/Svg-icon.vue';
import Maps  from './components/Map.vue';
import Header  from './components/Header.vue';

export default {
  name: 'App',
  components: {
    'svg-icon': SvgIcon,
    'mapas': Maps,
    'header-component': Header
  },
  data() {
    return {
      fields: [],
      id: "",
      name: "",
      loading: false,
      selected: undefined,
      edit: false,
      createField: false,
    }
  },
  async created() {
    this.loading = true
    await axios
      .get("https://agrointeli-api.herokuapp.com/fields")
      .then(response => {
        this.fields = response.data
        this.loading = false
      })
  },
  methods: {
    setFieldID: function(event, name) {
      this.id = event
      this.name = name
      this.edit = false
      this.createField = false;
    },
    setEditMode: function(event, name) {
      this.id = event
      this.name = name
      this.edit = true
      this.createField = false;
    },
    deleteField: function(id, name) {
      this.$fire({
        title: 'Você tem certeza?',
        text: "Você não será capaz de reverter isso!",
        type: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sim, remover!'
      }).then( async (result) => {
        if (result.value) {
          await axios
            .delete(`https://agrointeli-api.herokuapp.com/fields/${id}`)
            .then(() => {
              const i = this.fields.map(item => item.id).indexOf(id)
              this.fields.splice(i, 1)
              this.id = "",
              this.name = ""
              this.$toast(`${name} removido com sucesso`, {  });
          }).catch(() => {
            this.$toast.error(`Não foi possivel remover o ${name}`);
          })
        }
      })
    },
    setCreateField: function() {
      this.id = "",
      this.name = ""
      this.edit = true;
      this.createField = true;
      this.selected = undefined
    }
  }
};

</script>

<style lang="scss">
body {
  overflow: hidden;
}

.left-menu {
  height: 100vh;
  border-right: 1.5px solid #f2f2f2;
  padding: 0px !important;
}

.brand {
  height: 60px;
  background-color: #235314;
  display: flex;
  justify-content: center;
  align-items: center;
}

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

.nav {
  margin: 0px !important;
  max-height: 80%;
  overflow: auto;
}

.nav .nav-item {
  height: 100px;
  display: flex;
  flex-direction: row;
  align-items: center;
  padding-top: 25px;
  padding-bottom: 25px;
  border-bottom: 1.5px solid #f2f2f2;
  margin: 0px;
}

.select{
  background-color: #7db56b;
  color: #fff;
  fill: #fff;
}

.nav .nav-item:not(.select):hover {
    background-color: #f2f2f2;
}

.nav .nav-item .name + .button {
  margin-left: 40px;
}

.nav .nav-item .name {
  width: 70%;
  overflow-wrap: break-word;
  padding-left: 25px;
  cursor: pointer;
}
.nav .nav-item .button {
  width: 30%;
  display: flex;
  justify-content: center;
}

.nav .nav-item .button .svg-icon {
  fill:#c7cac5;

  cursor: pointer;
  z-index: 9999999;

  &:hover {
   fill:#000; 
  }
}

.nav .nav-item .button .svg-icon-select {
  fill:#fff;

  cursor: pointer;
  z-index: 9999999;

  &:hover {
   fill:#000; 
  }
}

.nav .nav-item .button .svg-icon + .svg-icon {
  margin-left: 10px;
}

.add {
  position: absolute;
  bottom: 0;
  text-align: center;
  font-size: 50px;

  .svg-icon {
    fill:#c7cac5;
    cursor: pointer;
    &:hover {
    fill:#000; 
    }
  }
}

.main {
  padding-left: 40px !important;
  padding-right: 40px !important;
  padding-top: 10px;
}

</style>
