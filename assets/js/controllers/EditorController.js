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

      this._redoBuffer = [];
      this._undoBuffer = [];
      this._currentUndoable = null;

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

    onRoomMousedown: function(roomView, pX, pY) {
      console.log('Mouse down in a room', roomView);
      // TODO: Depending on tool selected, begin an edit
      this._startUndoOperation();
      this._performToolOperation(roomView, pX, pY, 'mousedown');
    },

    onRoomMouseup: function(roomView, pX, pY) {
      console.log('Mouse up in a room', roomView);
      // TODO: Depending on tool selected, complete an edit
      this._commitUndoOperation();
    },

    onRoomMousemove: function(roomView, pX, pY) {
      console.log('Mouse moved in a room', roomView);
      // TODO: Depending on tool selected, record the edits tile by tile
      this._performToolOperation(roomView, pX, pY, 'mousemove');
    },

    _performToolOperation: function(roomView, pX, pY, eventType) {
      if(this.editorModel) {
        switch(this.editorModel.get('currentTool')) {
          case 'unset':
          case 'select':
          case 'move':
          case 'eyedropper':
            break;
          case 'pencil':
            console.log('Pencil action being taken at ' + pX + ', ' + pY);
            break;
          case 'floodfill':
            if(eventType && eventType === 'mousedown') {
              console.log('Floodfill action being taken at ' + pX + ', ' + pY);
            }
            break;
          default: 
            break;
        }
      }
    },

    _startUndoOperation: function() {
      this._redoBuffer.length = 0;
    },

    _commitUndoOperation: function() {
      if(this._currentUndoable) {
        this._undoBuffer.push(this._currentUndoable);
      }
    }

  });

  return EditorController;
});