define('views/RoomView', function() {
  var RoomView = Backbone.View.extend({
    className: 'room',

    delegate: null, 

    model: null,

    tileCanvas: null,
    attrCanvas: null,

    events: {
      'click': '_handleClick',
      'mousemove': '_handleMousemove'
    },

    initialize: function(options) {
      options = options || {};

      this.delegate = options.delegate;
      this.model = options.model;
    },

    _handleClick: function(evt) {
      var localX = evt.offsetX,
        localY   = evt.offsetY,
        tileX    = Math.floor(localX / this.model.gridsize),
        tileY    = Math.floor(localY / this.model.gridsize);
      
      console.log('Clicked room.', this.model, tileX, tileY);
    },

    _handleMousemove: function(evt) {
      console.log('Mouse is moving.');
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
      var $canvas = this.attrCanvas,
        pixelWidth,
        pixelHeight,
        attrWidth,
        attrHeight,
        gridSize,
        attrs,
        attrX,
        attrY,
        attrIndex,
        attrPositionX,
        attrPositionY;

      if(!$canvas) {
        $canvas = this.attrCanvas = $('<canvas />');
      }

      gridSize    = this.model.gridsize;
      attrWidth   = this.model.get('width');
      attrHeight  = this.model.get('height');
      pixelWidth  = attrWidth * gridSize;
      pixelHeight = attrHeight * gridSize;

      $canvas
        .attr('width', pixelWidth)
        .attr('height', pixelHeight)
        .addClass('layer-attribute');

      attrs = this.model.get('attr');

      for(attrY = 0; attrY < attrHeight; ++attrY) {
        for(attrX = 0; attrX < attrWidth; ++attrX) {
          attrIndex = attrY * attrWidth + attrX;
          attrPositionX = attrX * gridSize;
          attrPositionY = attrY * gridSize;
          this.drawAttribute(attrs[attrIndex], attrPositionX, attrPositionY);
        }
      }
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

    drawAttribute: function(attrValue, x, y) {
      var graphics,
        gridSize;

      gridSize = this.model.gridsize;

      if(this.tileCanvas) {
        graphics = this.attrCanvas[0].getContext('2d');

        if(attrValue === 0) {
          graphics.setFillColor('#000');
        } else if(attrValue === 1) {
          graphics.setFillColor('#FFF');
        }

        graphics.fillRect(x, y, gridSize, gridSize);
      }
    }
  });

  return RoomView;
});