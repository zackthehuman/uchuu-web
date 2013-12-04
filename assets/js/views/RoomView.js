define('views/RoomView', function() {
  var RoomView = Backbone.View.extend({
    className: 'room',

    delegate: null, 

    model: null,

    tileCanvas: null,
    attrCanvas: null,
    cameraBounds: null,

    events: {
      'click':     '_handleClick',
      'mousemove': '_handleMousemove',
      'mousedown': '_handleMousedown',
      'mouseup':   '_handleMouseup'
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
      if(this.delegate) {
        this.delegate.onRoomMousemove(this, evt.offsetX, evt.offsetY);
      }
    },

    _handleMousedown: function(evt) {
      if(this.delegate) {
        this.delegate.onRoomMousedown(this, evt.offsetX, evt.offsetY);
      }
    },

    _handleMouseup: function(evt) {
      if(this.delegate) {
        this.delegate.onRoomMouseup(this, evt.offsetX, evt.offsetY);
      }
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
        this._renderCameraBounds();

        this.$el.empty()
          .append(this.tileCanvas)
          .append(this.attrCanvas)
          .append(this.cameraBounds);

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

    _renderCameraBounds: function() {
      var width = this.model.get('cameraBounds').width,
        height = this.model.get('cameraBounds').height,
        x = this.model.get('cameraBounds').x,
        y = this.model.get('cameraBounds').y;

        width *= this.model.gridsize;
        height *= this.model.gridsize;
        x *= this.model.gridsize;
        y *= this.model.gridsize;

      this.cameraBounds = $('<div class="camera-bounds"></div>')
        .css({
          width: width,
          height: height,
          position: 'absolute',
          top: y,
          left: x
        });
    },

    _renderTransitionRegions: function() {

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