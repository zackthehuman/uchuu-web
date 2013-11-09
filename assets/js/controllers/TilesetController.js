
// TODO: Require backbone and underscore
define('controllers/TilesetController', function() {
  var TilesetController = Backbone.View.extend({
    selectedTileIndex: null,

    onTileClicked: function(sourceView, evt) {
      var tileIndex;

      if(evt) {
        tileIndex = $(evt.currentTarget).data('tile-index');

        if(sourceView && sourceView.selectTileByIndex) {
          sourceView.selectTileByIndex(tileIndex);
        }

        if(tileIndex !== this.selectedTileIndex) {
          this.selectedTileIndex = tileIndex;
          this.trigger('selectedTileChanged', this.selectedTileIndex);
        }
      }
    }
  });

  return TilesetController;
});