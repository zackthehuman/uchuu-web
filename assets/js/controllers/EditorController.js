// TODO: Require backbone and underscore
define('controllers/EditorController', [
  'views/RoomView'
], function(
  RoomView
) {
  var EditorController = Backbone.View.extend({
    delegate: null,

    editorModel: null,

    roomViews: null,

    stageModel: null,

    initialize: function(options) {
      _.bindAll(this,
        '_createRoomViews');

      if(options) {
        if(options.delegate) {
          this.delegate = options.delegate;
        }

        if(options.editorModel) {
          this.editorModel = options.editorModel;
        }

        if(options.stageModel) {
          this.stageModel = options.stageModel;
        }
      }

      this._createRoomViews(this.stageModel);

      _.each(this.roomViews, _.bind(function(view) {
        this.$el.children('div').append(view.render().el);
      }, this));
    },

    _createRoomViews: function(stageModel) {
      if(stageModel) {
        this.roomViews = [];

        stageModel.subModels.rooms.each(_.bind(function(roomModel, index) {
          console.log('Creating sub view for room ' + index);

          var roomView = new RoomView({
            delegate: this,
            model: roomModel
          });

          this.roomViews.push(roomView);
        }, this));
      }
    },

    onRoomMousedown: function(roomView) {
      console.log('Mouse down in a room', roomView);
      // TODO: Depending on tool selected, begin an edit
    },

    onRoomMouseup: function(roomView) {
      console.log('Mouse up in a room', roomView);
      // TODO: Depending on tool selected, complete an edit

    },

    onRoomMousemove: function(roomView) {
      console.log('Mouse moved in a room', roomView);
      // TODO: Depending on tool selected, record the edits tile by tile

    }

  });

  return EditorController;
});