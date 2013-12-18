// TODO: Require backbone and underscore
define('controllers/EditorController', [
  'views/RoomView'
], function(
  RoomView
) {
  var KEY_UP = 38,
    KEY_RIGHT = 39,
    KEY_DOWN = 40,
    KEY_LEFT = 37,
    EditorController;

  EditorController = Backbone.View.extend({
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

      this._currentUndoable = null;

      this._createRoomViews(this.stageModel);

      _.each(this.roomViews, _.bind(function(view) {
        this.$el.children('div').append(view.render().el);
      }, this));
    },

    canUndo: function() {
      console.log('EditorController::canUndo');
      return this.editorModel.undoBuffer.length > 0;
    },

    canRedo: function() {
      console.log('EditorController::canRedo');
      return this.editorModel.redoBuffer.length > 0;
    },

    performUndo: function() {
      this._performUndoOrRedo(true);
    },

    performRedo: function() {
      this._performUndoOrRedo(false);
    },

    _performUndoOrRedo: function(isUndo) {
      console.log('EditorController::_performUndoOrRedo');

      var buffer = (isUndo ? this.editorModel.undoBuffer : this.editorModel.redoBuffer),
        otherBuffer = (isUndo ? this.editorModel.redoBuffer : this.editorModel.undoBuffer),
        doable = buffer.pop();

      if(doable) {
        doable = doable.toJSON();

        switch(doable.type) {
          case 'pencil':
          case 'floodfill':
            _.each(doable.changes, function(change, index, changes) {
              var roomView = change.roomView,
                roomModel;

              if(roomView) {
                roomModel = roomView.model;

                if(roomModel) {
                  if(change.type === 'tile' || change.type === 'attribute') {
                    this._performTileChange(change, isUndo);
                  }
                }
              }
            }, this);

            otherBuffer.add(doable);
          break;

          default:
          break;
        }
      }
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
      // console.log('Mouse down in a room', roomView);

      if(this._currentUndoable) {
        this._commitUndoOperation();
      }

      this._startUndoOperation();
      this._performToolOperation(roomView, pX, pY, 'start');
    },

    onRoomMouseup: function(roomView, pX, pY) {
      // console.log('Mouse up in a room', roomView);
      // TODO: Depending on tool selected, complete an edit
      this._commitUndoOperation();
      this._stopUndoOperation();
    },

    onRoomMousemove: function(roomView, pX, pY) {
      // console.log('Mouse moved in a room', roomView);
      this._performToolOperation(roomView, pX, pY, 'step');
    },

    onRoomKeydown: function(roomView, evt) {
      var killEvent = false;

      if(roomView && evt) {
        if(this.editorModel.get('currentTool') === 'move') {
          switch(evt.which) {
            case KEY_UP:
            roomView.model.set('y', roomView.model.get('y') - 1);
            killEvent = true;
            break;
            case KEY_RIGHT:
            roomView.model.set('x', roomView.model.get('x') + 1);
            killEvent = true;
            break;
            case KEY_DOWN:
            roomView.model.set('y', roomView.model.get('y') + 1);
            killEvent = true;
            break;
            case KEY_LEFT:
            roomView.model.set('x', roomView.model.get('x') - 1);
            killEvent = true;
            break;
          }
        }
      }

      if(killEvent) {
        evt.preventDefault();
        evt.stopPropagation();
      }
    },

    onTransitionKeydown: function(transitionView, evt) {
      var killEvent = false;
      
      if(transitionView && evt) {
        if(this.editorModel.get('currentTool') === 'move') {
          switch(evt.which) {
            case KEY_UP:
            transitionView.model.set('y', transitionView.model.get('y') - 1);
            killEvent = true;
            break;
            case KEY_RIGHT:
            transitionView.model.set('x', transitionView.model.get('x') + 1);
            killEvent = true;
            break;
            case KEY_DOWN:
            transitionView.model.set('y', transitionView.model.get('y') + 1);
            killEvent = true;
            break;
            case KEY_LEFT:
            transitionView.model.set('x', transitionView.model.get('x') - 1);
            killEvent = true;
            break;
          }
        }
      }

      if(killEvent) {
        evt.preventDefault();
        evt.stopPropagation();
      }
    },

    _performToolOperation: function(roomView, pX, pY, eventType) {
      if(this.editorModel) {
        switch(this.editorModel.get('currentTool')) {
          case 'unset':
          case 'select':
          case 'move':
            break;
          case 'eyedropper':
            if(this._currentUndoable) {
              this._doEyedropperTool(roomView, pX, pY);
            }
            break;
          case 'pencil':
            if(this._currentUndoable) {
              this._currentUndoable.changes.push(
                this._doPencilTool(roomView, pX, pY));
              this._currentUndoable.type = 'pencil';
            }
            break;
          case 'floodfill':
            if(eventType && eventType === 'start') {
              console.log('Floodfill action being taken at ' + pX + ', ' + pY);

              if(this._currentUndoable) {
                this._currentUndoable.changes = this._doFloodfillTool(roomView, pX, pY);
                this._currentUndoable.type = 'floodfill';
              }
            }
            break;
          default: 
            break;
        }
      }
    },

    _doEyedropperTool: function(roomView, pX, pY) {
      var tX,
        tY,
        tileOffset,
        tiles;

      if(roomView && roomView.model && this.editorModel) {
        tX = Math.floor(pX / roomView.model.gridsize);
        tY = Math.floor(pY / roomView.model.gridsize);
        tileOffset = (tY * roomView.model.get('width')) + tX;
        tiles = roomView.model.get('tile');

        this.editorModel.set('currentTile', tiles[tileOffset]);
      }
    },

    _doPencilTool: function(roomView, pX, pY) {
      var tX,
        tY,
        newTileValue,
        tileIndexAtXY,
        tileOffset,
        tiles,
        attrs,
        change = null;

      if(roomView && roomView.model && this.editorModel) {
        tX = Math.floor(pX / roomView.model.gridsize);
        tY = Math.floor(pY / roomView.model.gridsize);
        tileOffset = (tY * roomView.model.get('width')) + tX;
        tiles = roomView.model.get('tile');
        attrs = roomView.model.get('attr');

        // If the editing location is outside of the map then bail
        if(tX < 0 || tX >= roomView.model.get('width')) {
          if(tY < 0 || tY >= roomView.model.get('height')) {
            return null;
          }
        }

        switch(this.editorModel.get('editingMode')) {
          case 'tile':
            tileIndexAtXY = tiles[tileOffset];
            newTileValue = this.editorModel.get('currentTile');

            if(tileIndexAtXY !== newTileValue) {
              change = {
                type: 'tile', // TODO: Support "attribute" types here too
                oldValue: tileIndexAtXY,
                newValue: newTileValue,
                tileX: tX,
                tileY: tY,
                roomView: roomView
              };

              this._performTileChange(change, false);
            }
          break;
          case 'attribute':
          break;
          default:
          break;
        }
      }

      return change;
    },

    _doFloodfillTool: function(roomView, pX, pY, fromValue, toValue, changes) {
      var width,
        height,
        tileOffset,
        oldTileValue,
        tX,
        tY,
        change;

      changes = changes || [];
      width = roomView.model.get('width');
      height = roomView.model.get('height');
      tX = Math.floor(pX / roomView.model.gridsize);
      tY = Math.floor(pY / roomView.model.gridsize);

      if(tX < 0 || tY < 0 || tX >= width || tY >= height) {
        return;
      }

      oldTileValue = roomView.model.getTileAtXY(tX, tY);

      if(fromValue === undefined) {
        fromValue = oldTileValue;
      }

      if(toValue === undefined) {
        toValue = this.editorModel.get('currentTile');
      }

      if(oldTileValue === fromValue && oldTileValue !== toValue) {
        change = {
          type: 'tile', // TODO: Support "attribute" types here too
          oldValue: fromValue,
          newValue: toValue,
          tileX: tX,
          tileY: tY,
          roomView: roomView
        };

        this._performTileChange(change, false);

        changes.push(change);

        // Top
        this._doFloodfillTool(roomView, pX, pY - 16, fromValue, toValue, changes);
        // Right
        this._doFloodfillTool(roomView, pX + 16, pY, fromValue, toValue, changes);
        // Bottom
        this._doFloodfillTool(roomView, pX, pY + 16, fromValue, toValue, changes);
        // Left
        this._doFloodfillTool(roomView, pX - 16, pY, fromValue, toValue, changes);
      }

      return changes;
    },

    _startUndoOperation: function() {
      this.editorModel.redoBuffer.reset();
      // this.editorModel.set('redoBuffer', this._redoBuffer);
      this._currentUndoable = { changes: [] };
    },

    _commitUndoOperation: function() {
      if(this._currentUndoable) {
        this._currentUndoable.changes = _.compact(this._currentUndoable.changes);

        if(this._currentUndoable.changes.length) {
          this.editorModel.undoBuffer.add(this._currentUndoable);
          // this.editorModel.set('undoBuffer', this._undoBuffer);

          console.log('Committed undoable with ' + this._currentUndoable.changes.length + ' change(s).', this._currentUndoable.changes);
        }
      }
    },

    _stopUndoOperation: function() {
      this._currentUndoable = null;
    },

    /**
     * Takes a 'tile change' object and performs the change. Is also capable of
     * reversing the change (undo).
     *
     * @param  {Object}  change - a tile change encoded in an object
     * @param  {Boolean} isUndo - a flag indicating whether the operation should
     *                            be performed in reverse
     * @return {Void}
     */
    _performTileChange: function(change, isUndo) {
      var roomModel;

      if(change) {
        if(change.roomView) {
          roomModel = change.roomView.model;

          if(roomModel) {
            if(change.type === 'tile') {
              roomModel.setTileAtXY(
                isUndo ? change.oldValue : change.newValue,
                change.tileX,
                change.tileY
              );
            } else if(change.type === 'attribute') {
              // TODO: Implement this
              //
              // roomModel.setAttributeAtXY(
              //   isUndo ? change.oldValue : change.newValue,
              //   change.tileX,
              //   change.tileY
              // );
            }
          }
        }
      }
    }

  });

  return EditorController;
});