<template>
  <div 
    style="width: 100%; height: 100%;" 
    v-bind:style=" loading ? 'visibility: hidden;' : 'visibility: visible;' "
  >
    <form class="row">
      <div class="col-3 col-sm-12">
        <div class="form-group">
          <label class="form-label" for="name">Nome</label>
          <input 
            class="form-input" 
            type="text" id="name" 
            :value="fieldItem.name" 
            @input="inputValue($event)" 
            v-bind:class="{ 'disabled': !editMode }"
          >
        </div>
      </div>
      <div class="col-2 col-sm-12">
        <div class="form-group">
          <label class="form-label" for="size">Tamanho</label>
          <input 
            class="form-input" 
            type="number" 
            id="size" 
            :value="fieldItem.size" 
            @input="inputValue($event)" 
            :class="{ 'disabled': !editMode }"
          >
        </div>
      </div>
      <div class="col-3 col-sm-12">
        <div class="form-group">
          <label class="form-label" for="unity">Medida</label>
          <select 
            class="form-select" 
            id="unity" 
            @input="inputValue($event)" 
            :class="{ 'disabled': !editMode }"
          >
            <option>Escolha uma opção</option>
            <option 
              v-bind:selected="{ 'selected': fieldItem.unity = 'hectares' }" 
              value="hectares">HECTARES
            </option>
          </select>
        </div>
      </div>
      <div class="col-1 col-sm-12">
        <div class="form-group">
          <label class="form-label" for="latitude">Latitude</label>
          <input 
            class="form-input" 
            type="text" 
            id="latitude" 
            :value="lat" 
            @input="inputValue($event)" 
            :class="{ 'disabled': !editMode }"
          >
        </div>
      </div>
      <div class="col-1 col-sm-12">
        <div class="form-group">
          <label class="form-label" for="longitude">Longitude</label>
          <input 
            class="form-input" 
            type="text" 
            id="longitude" 
            :value="lng" 
            @input="inputValue($event)" 
            :class="{ 'disabled': !editMode }"
          >
        </div>
      </div>
      <!-- form structure -->
    </form>
    <l-map ref="map" style="width: 100%; height: 500px" :zoom="zoom" :center="{lat, lng}">
      <l-control-layers
        :position="layersPosition"
        :collapsed="false"
        :sort-layers="true"
      />
      <l-tile-layer
        v-for="tileProvider in tileProviders"
        :key="tileProvider.name"
        :name="tileProvider.name"
        :visible="tileProvider.visible"
        :url="tileProvider.url"
        :attribution="tileProvider.attribution"
        layer-type="base"
      />
       <l-polygon
        :lat-lngs="polygon.latlngs"
        :color="polygon.color"
      />
    </l-map>
    <div class="save">
      <button 
        v-on:click="create ? createNewField() : updateField()" 
        class="btn btn-success" 
        :class="{ 'disabled': !editMode }"
      >
        {{ create ? "Salvar" : "Salvar Alterações" }}
      </button>
    </div>
  </div>
</template>

<script>
  import L from "leaflet";
  import axios from 'axios'
  import 'leaflet-draw';

  const tileProviders = [
    {
      name: 'google',
      visible: true,
      url:'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      attribution:'google',
    },
    {
      name: 'osm',
      visible: false,
      url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      attribution:'OpenStreetMap',
    },
  ]

  export default {
    name: 'map',
    props: {
      item: {
        type: String,
        default: null
      },
      editMode: {
        type: Boolean,
        default: null
      },
      createMode: {
        type: Boolean,
        default: null
      },
    },
    data() {
      return {
        zoom:12,
        layersPosition: 'topleft',
        tileProviders: tileProviders,
        
        fieldItem: {
          "id_field": "",
          name: "",
          size: 0,
          unity: "",
          coordinates: {
            latitude: 0,
            longitude: 0
          },
          polygons: []
        },
        
        edit: false,
        create: false,

        lat: null,
        lng: null,

        loading: true,

        polygon: {
          latlngs: [],
          color: "#745dc7"
        },
      };
    },
    watch: {
      item: {
        immediate: true, 
        handler (val) {
          if (val.length > 0) {
            this.zoom =12
            axios
              .get(`https://agrointeli-api.herokuapp.com/fields/${val}`)
              .then(response => {
                this.fieldItem = response.data
                this.lat = response.data.coordinates.latitude
                this.lng = response.data.coordinates.longitude
                this.polygon.latlngs = response.data.polygons
                this.loading = false
              })
          } else {
            this.loading = true
          }
        }
      },
      editMode: function (val) {
        this.edit = val
      },
      createMode: function (val) {
        this.create = val
        if (val) {
          this.fieldItem = {
            "id_field": "",
            name: "",
            size: 0,
            unity: "",
            coordinates: {
              latitude: 0,
              longitude: 0
            },
            polygons: []
          },

          this.zoom = 2,

          this.lat = 0
          this.lng = 0

          this.edit = true
          this.loading = false
        }
      }
    },
    mounted() {
      window.addEventListener('resize', () => {
          this.windowHeight = window.innerHeight;
      });

      this.$nextTick(() => {
        const map = this.$refs.map.mapObject;

        const drawnItems = new L.FeatureGroup()
        map.addLayer(drawnItems)
        const drawControl = new L.Control.Draw({
          edit: {
            featureGroup: drawnItems
          }
        });

        map.addControl(drawControl);
      
        map.on(L.Draw.Event.CREATED, (e) => {
          const layer = e.layer;
          drawnItems.addLayer(layer);

          this.fieldItem.polygons = []

          layer._latlngs[0].map(coord => {
            this.fieldItem.polygons = [...this.fieldItem.polygons,[coord.lat, coord.lng]]
          })
        });

        map.on(L.Draw.Event.DELETED, () => {
          this.fieldItem.polygons = []
        });

        map.on(L.Draw.Event.EDITED, () => {
            // Evento editar
        });

      });
    },
    methods:{
      inputValue(event){
        switch(event.target.id) {
          case 'name':
            this.fieldItem.name = event.target.value
            break
          case 'size':
            this.fieldItem.size = event.target.value
            break
          case 'unity':
            this.fieldItem.unity = event.target.value
            break
          case 'latitude':
            this.lat = event.target.value
            this.fieldItem.coordinates.latitude = event.target.value
            break
          case 'longitude':
            this.lng = event.target.value
            this.fieldItem.coordinates.longitude = event.target.value
            break
        }
      },
      updateField() {
        if (this.editMode)
          axios.put(`https://agrointeli-api.herokuapp.com/fields/${this.fieldItem.id_field}`, this.fieldItem)
            .then(() => {
              this.$toast(`${this.fieldItem.name} editado com sucesso`);
              window.location.reload()
            }).catch(() => {
              this.$toast.error(`Não foi possivel salvar as alterações`);
            })
      },
      createNewField() {
        axios.post(`https://agrointeli-api.herokuapp.com/fields`, this.fieldItem)
          .then(() => {
            this.$toast(`${this.fieldItem.name} criado com sucesso`);
            window.location.reload()
          }).catch(() => {
            this.$toast.error(`Não foi possivel criar o ${this.fieldItem.name}`);
          })
      }
    }
  }
</script>

<style>
.row {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  margin-bottom: 20px;
}
.save {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.btn-success {
  background-color: #256014 !important;
  border-radius: 10px !important;
  height: 50px !important;
  width: 20% !important;
}

</style>