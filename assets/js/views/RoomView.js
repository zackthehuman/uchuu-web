define('views/RoomView', function() {
  var RoomView = Backbone.View.extend({
    className: 'room',

    delegate: null, 

    model: null,

    tileCanvas: null,
    attrCanvas: null,

    initialize: function(options) {
      options = options || {};

      this.delegate = options.delegate;
      this.model = options.model;
    },

    render: function() {
      var tileX,
        tileY,
        tileWidth,
        tileHeight,
        gridSize;

      if(this.model) {
        tileWidth = this.model.get('width');
        tileHeight = this.model.get('height');
        tileX = this.model.get('x');
        tileY = this.model.get('y');
        gridSize = this.model.gridsize;

        this._renderTileLayer();
        this._renderAttrLayer();

        this.$el.empty()
          .append(this.tileCanvas)
          .append(this.attrCanvas);

        this.$el.css({
          width: tileWidth * gridSize,
          height: tileHeight * gridSize,
          left: tileX * gridSize,
          top: tileY * gridSize,
          position: 'absolute',
          zIndex: parseInt(this.model.get('id'), 10)
        });
      }

      return this;
    },

    _renderTileLayer: function() {
      var $canvas = this.tileCanvas,
        pixelWidth,
        pixelHeight,
        tileWidth,
        tileHeight,
        gridSize,
        tileX,
        tileY,
        tiles,
        tileIndex,
        tilePositionX,
        tilePositionY;

      if(!$canvas) {
        $canvas = this.tileCanvas = $('<canvas />');
      }

      gridSize    = this.model.gridsize;
      tileWidth   = this.model.get('width');
      tileHeight  = this.model.get('height');
      pixelWidth  = tileWidth * gridSize;
      pixelHeight = tileHeight * gridSize;

      $canvas
        .attr('width', pixelWidth)
        .attr('height', pixelHeight)
        .addClass('layer-tile');

      tiles = this.model.get('tile');

      for(tileY = 0; tileY < tileHeight; ++tileY) {
        for(tileX = 0; tileX < tileWidth; ++tileX) {
          tileIndex = tileY * tileWidth + tileX;
          tilePositionX = tileX * gridSize;
          tilePositionY = tileY * gridSize;
          this.drawTile(tiles[tileIndex], tilePositionX, tilePositionY);
        }
      }
    },

    _renderAttrLayer: function() {

    },

    drawTile: function(tileIndex, x, y) {
      var graphics,
        tileset,
        texture,
        gridSize,
        tile;

      gridSize = this.model.gridsize;
      tileset = uchuu.tilesets[this.model.stage.get('tileset')];
      texture = uchuu.textures[tileset.surface];
      tile = tileset.tiles[tileIndex];

      if(this.tileCanvas) {
        graphics = this.tileCanvas[0].getContext('2d');

        graphics.drawImage(
          texture,
          tile.x,
          tile.y,
          tileset.size,
          tileset.size,
          x,
          y,
          gridSize,
          gridSize);
      }
    },

    drawAttribute: function(attr, x, y) {

    }
  });

  return RoomView;
});