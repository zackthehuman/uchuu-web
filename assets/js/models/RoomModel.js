define('models/RoomModel', [
  'mixins/SubModelSerializerMixin'
], function(
  SubModelSerializerMixin
) {

  var DEFAULT_ROOM_PADDING      = 2,
    DEFAULT_ROOM_WIDTH          = 16 + DEFAULT_ROOM_PADDING,
    DEFAULT_ROOM_HEIGHT         = 15 + DEFAULT_ROOM_PADDING,
    DEFAULT_CAMERA_BOUND_WIDTH  = DEFAULT_ROOM_WIDTH - DEFAULT_ROOM_PADDING,
    DEFAULT_CAMERA_BOUND_HEIGHT = DEFAULT_ROOM_HEIGHT - DEFAULT_ROOM_PADDING,
    DEFAULT_CAMERA_BOUND_X      = 1,
    DEFAULT_CAMERA_BOUND_Y      = 1;

  var TransitionRegionModel = Backbone.Model.extend({});
  var EnemySpawnerModel = Backbone.Model.extend({});
  var ItemSpawnerModel = Backbone.Model.extend({});

  var TransitionRegionCollection = Backbone.Collection.extend({
    model: TransitionRegionModel
  });

  var EnemyCollection = Backbone.Collection.extend({
    model: EnemySpawnerModel
  });

  var ItemCollection = Backbone.Collection.extend({
    model: ItemSpawnerModel
  });

  /**
   * Model for an individual room. Contains collections of enemies, items, and
   * transitions. Also contains all of the tile and collision information.
   * 
   * @class RoomModel
   * @extends {Backbone.Model}
   * @mixes {SubModelSerializerMixin}
   */
  var RoomModel = Backbone.Model.extend({
    stage: {},
    gridsize: 16,
    defaults: function() {
      return {
        "id": 0,
        "x": 0,
        "y": 0,
        "width": DEFAULT_ROOM_WIDTH,
        "height": DEFAULT_ROOM_HEIGHT,
        "tile": [
          1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
          1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
          1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
          1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
          1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
          1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
          1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
          1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
          1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
          1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
          1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1
        ],
        "attr": [
          1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
          1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
          1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
          1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
          1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
          1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
          1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
          1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
          1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
          1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
          1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
          1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
          1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
          1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
          1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1
        ],
        "cameraBounds": {
          "x": DEFAULT_CAMERA_BOUND_X,
          "y": DEFAULT_CAMERA_BOUND_Y,
          "width": DEFAULT_CAMERA_BOUND_WIDTH,
          "height": DEFAULT_CAMERA_BOUND_HEIGHT
        },
        "enemies": [],
        "items": [],
        "transitions": [],
        "doors": {}
      };
    },

    initialize: function(attributes, options) {
      if(options){
        if(options.gridsize) {
          this.gridsize = options.gridsize;
        }

        if(options.stage) {
          this.stage = options.stage;          
        }
      }

      if(attributes) {
        this.subModels = {
          enemies: new EnemyCollection(attributes.enemies),
          items: new ItemCollection(attributes.items),
          transitions: new TransitionRegionCollection(attributes.transitions)
        };
      }
    },

    setTileAtXY: function(newValue, tX, tY) {
      var tiles = this.get('tile');

      tiles[(tY * this.get('width')) + tX] = newValue;

      this.trigger('tileChanged', { 
        newValue: newValue,
        tileX: tX,
        tileY: tY
      });
    },

    getTileAtXY: function(tX, tY) {
      var tiles = this.get('tile');

      return tiles[(tY * this.get('width')) + tX];
    },

    setAttributeAtXY: function(newValue, tX, tY) {
      var attrs = this.get('attr');

      attrs[(tY * this.get('width')) + tX] = newValue;

      this.trigger('attrChanged', { 
        newValue: newValue,
        tileX: tX,
        tileY: tY
      });
    },

    getAttributeAtXY: function(tX, tY) {
      var attrs = this.get('attr');

      return attrs[(tY * this.get('width')) + tX];
    },

    resize: function(newWidth, newHeight) {
      var smallestWidth = Math.min(newWidth, this.get('width')),
        smallestHeight = Math.min(newHeight, this.get('height')),
        oldWidth = this.get('width'),
        oldHeight = this.get('height'),
        tiles = this.get('tile'),
        attrs = this.get('attr'),
        newTiles = [],
        newAttrs = [],
        index = 0,
        newIndex = 0,
        x,
        y;

      // This is a bit wasteful, but first fill the whole thing with 0 tiles,
      // and then copy over the tile data safely.
      for(y = 0; y < newHeight; ++y) {
        for(x = 0; x < newWidth; ++x) {
          index = (y * newWidth) + x;
          newTiles[index] = 0;
          newAttrs[index] = 0;
        }
      }

      for(y = 0; y < oldHeight; ++y) {
        for(x = 0; x < oldWidth; ++x) {
          // Make sure we respect the clipping between the two arrays.
          if(y < newHeight && x < newWidth) {
            index = (y * oldWidth) + x;
            newIndex = (y * newWidth) + x;
            newTiles[newIndex] = tiles[index];
            newAttrs[newIndex] = attrs[index];
          }
        }
      }

      this.set('width', newWidth);
      this.set('height', newHeight);
      this.set('tile', newTiles);
      this.set('attr', newAttrs);
      this.trigger('resize', newWidth, newHeight);
    }
  });

  _.extend(RoomModel.prototype, SubModelSerializerMixin);

  return RoomModel;
});