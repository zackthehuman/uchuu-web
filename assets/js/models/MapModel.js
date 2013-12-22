define('models/MapModel', [
  'mixins/SubModelSerializerMixin',
  'models/RoomModel'
], function(
  SubModelSerializerMixin,
  RoomModel
) {
  var RoomCollection = Backbone.Collection.extend({
    model: RoomModel
  });

  /**
   * A model backing the entire map. Contains a collection of Rooms and other
   * attributes.
   *
   * @class MapModel
   * @extends {Backbone.Model}
   * @mixes {SubModelSerializerMixin}
   */
  var MapModel = Backbone.Model.extend({
    defaults: function() {
      return {
        "tileset": "",
        "gridsize": 16,
        "musicId": 10,
        "specialRooms": {
          "starting": 0,
          "midpoint": 0,
          "bossCorridor": 0,
          "bossChamber": 0
        },
        "rooms": []
      };
    },

    initialize: function(attributes, options) {
      if(attributes) {
        this.subModels = {
          rooms: new RoomCollection(attributes.rooms)
        };

        this.subModels.rooms.each(_.bind(function(roomModel) {
          roomModel.stage = this;
          roomModel.gridsize = this.get('gridsize');
        }, this));
      }

      if(options) {
        this.filePath = options.filePath;
      }
    }
  });

  _.extend(MapModel.prototype, SubModelSerializerMixin);

  return MapModel;
});