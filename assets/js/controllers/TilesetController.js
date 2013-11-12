
// TODO: Require backbone and underscore
define('controllers/TilesetController', function() {
  var TilesetController = Backbone.View.extend({
    initialize: function(options) {
      this.editorModel = options.editorModel;
    },

    onTileClicked: function(sourceView, evt) {
      var tileIndex;

      if(evt) {
        tileIndex = $(evt.currentTarget).data('tile-index');

        if(sourceView && sourceView.selectTileByIndex) {
          sourceView.selectTileByIndex(tileIndex);
        }

        if(tileIndex !== this.selectedTileIndex) {
          if(this.editorModel) {
            this.editorModel.set('currentTile', tileIndex);
          }
        }
      }
    }
  });

  return TilesetController;
});