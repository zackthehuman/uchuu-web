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
  var EnemyModel = Backbone.Model.extend({});
  var ItemModel = Backbone.Model.extend({});

  var TransitionRegionCollection = Backbone.Collection.extend({
    model: TransitionRegionModel
  });

  var EnemyCollection = Backbone.Collection.extend({
    model: EnemyModel
  });

  var ItemCollection = Backbone.Collection.extend({
    model: ItemModel
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
    defaults: {
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
    }
  });

  _.extend(RoomModel.prototype, SubModelSerializerMixin);

  return RoomModel;
});