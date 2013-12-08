define('views/RoomView', function() {

  var TransitionRegionView = Backbone.View.extend({
    className: 'transition-region',

    events: {
      'click': '_handleClick',
      'keydown': '_handleKeydown'
    },

    initialize: function(options) {
      this.delegate = options.delegate;
      
      if(this.model) {
        this.listenTo(this.model, 'change:x', _.bind(this._updatePosition, this));
        this.listenTo(this.model, 'change:y', _.bind(this._updatePosition, this));
      }      
    },

    _updatePosition: function(transitionModel, newCoord) {
      var tileX,
        tileY,
        tileWidth,
        tileHeight,
        gridSize;

      if(transitionModel) {
        tileWidth = transitionModel.get('width');
        tileHeight = transitionModel.get('height');
        tileX = transitionModel.get('x');
        tileY = transitionModel.get('y');
        gridSize = 16;

        this.$el.css({
          width: tileWidth * gridSize,
          height: tileHeight * gridSize,
          left: tileX * gridSize,
          top: tileY * gridSize
        });
      }
    },

    _handleClick: function(evt) {
      console.log('Clicked on a transition-region!');
    },

    _handleKeydown: function(evt) {
      if(this.delegate) {
        if(this.delegate.onTransitionKeydown) {
          this.delegate.onTransitionKeydown(this, evt);
        }
      }
    },

    render: function() {
      if(this.model) {
        this.$el.css({
          width: this.model.get('width') * 16,
          height: this.model.get('height') * 16,
          left: this.model.get('x') * 16,
          top: this.model.get('y') * 16,
          position: "absolute"
        }).addClass('direction-' + this.model.get('direction'));

        this.$el.attr('tabIndex', 100);
      }

      return this;
    }
  });

  var RoomView = Backbone.View.extend({
    className: 'room',

    delegate: null, 

    model: null,

    tileCanvas: null,
    attrCanvas: null,
    cameraBounds: null,
    transitionRegions: null,

    events: {
      'click':     '_handleClick',
      'mousemove': '_handleMousemove',
      'mousedown': '_handleMousedown',
      'mouseup':   '_handleMouseup',
      'keydown':   '_handleKeydown'
    },

    initialize: function(options) {
      options = options || {};

      this.delegate = options.delegate;
      this.model = options.model;

      if(this.model) {
        this.listenTo(this.model, 'tileChanged', _.bind(this._drawTileChange, this));
        this.listenTo(this.model, 'change:x', _.bind(this._updatePosition, this));
        this.listenTo(this.model, 'change:y', _.bind(this._updatePosition, this));
      }
    },

    _updatePosition: function(roomModel, newCoord) {
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

        this.$el.css({
          width: tileWidth * gridSize,
          height: tileHeight * gridSize,
          left: tileX * gridSize,
          top: tileY * gridSize
        });
      }
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

    _handleKeydown: function(evt) {
      if(this.delegate) {
        this.delegate.onRoomKeydown(this, evt);
      }
    },

    _drawTileChange: function(evt) {
      var pixelX = evt.tileX * this.model.gridsize,
        pixelY = evt.tileY * this.model.gridsize;

      this.drawTile(evt.newValue, pixelX, pixelY);
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
        this._renderTransitionRegions();

        this.$el.empty()
          .append(this.tileCanvas)
          .append(this.attrCanvas)
          .append(this.cameraBounds)
          .append(this.transitionRegions);

        this.$el.css({
          width: tileWidth * gridSize,
          height: tileHeight * gridSize,
          left: tileX * gridSize,
          top: tileY * gridSize,
          position: 'absolute',
          zIndex: parseInt(this.model.get('id'), 10)
        });

        this.$el.attr('tabIndex', parseInt(this.model.get('id'), 10));
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
      var transitions = this.model.subModels.transitions;

      this.transitionRegions = [];

      transitions.each(function(transition) {
        this.transitionRegions.push(new TransitionRegionView({
          model: transition,
          delegate: this.delegate
        }).render().el);
      }, this);
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