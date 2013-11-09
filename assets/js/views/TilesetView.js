define('views/TilesetView', function() {
  var TilesetView = Backbone.View.extend({
    className: 'tileset-container',

    delegate: null,
    
    events: {
      'click .tile': '_handleTileClick',
      'mousedown': '_handleContainerMousedown',
      'mouseup': '_handleContainerMouseup',
      'mousemove': '_handleContainerMousemove'
    },

    tileset: null,

    tilesetImage: null,

    tileIndexMap: null,

    initialize: function(options) {
      _.bindAll(this,
        'render',
        'selectTileByIndex',
        '_handleTileClick',
        '_handleContainerMousedown',
        '_handleContainerMouseup',
        '_handleContainerMousemove');

      if(options) {
        if(options.delegate) {
          this.delegate = options.delegate;
        }

        if(options.tileset) {
          this.tileset = options.tileset;
          this.tileIndexMap = {};
        }

        if(options.tilesetImage) {
          this.tilesetImage = options.tilesetImage;
        }
      }
    },

    render: function() {
      var tileElements = [];

      if(this.tileset && this.tilesetImage) {
        this.$el.empty();
        delete this.tileIndexMap;
        this.tileIndexMap = {};

        _.each(this.tileset.tiles, _.bind(function(tileMeta, index) {
          var tileElement = $('<div />', { 'class': 'tile' });

          tileElement.css({
            'background-image': 'url(/load?path=' +this.tileset.surface + ')',
            'background-position': (-tileMeta.x) + 'px ' + (-tileMeta.y + 'px'),
            'width': this.tileset.size + 'px',
            'height': this.tileset.size + 'px',
            'float': 'left'
          });

          tileElement.data('tile-index', index);
          tileElements.push(tileElement);

          this.tileIndexMap['index-' + index] = tileElement;
        }, this));

        this.$el.append(tileElements);
      }

      return this;
    },

    selectTileByIndex: function(index) {
      var $tileElement;

      if(this.tileIndexMap) {
        $tileElement = this.tileIndexMap['index-' + index];

        if($tileElement) {
          $tileElement.addClass('selected').siblings().removeClass('selected');
        }
      }
    },

    _handleTileClick: function(evt) {
      console.log('Clicked on tile #' + $(evt.currentTarget).data('tile-index'));

      if(this.delegate && this.delegate.onTileClicked) {
        this.delegate.onTileClicked(this, evt);
      }

      evt.stopPropagation();
      evt.preventDefault();
    },

    _handleContainerMousedown: function(evt) {
      this.movingLock = true;
      this.mouseOffsetX = evt.clientX - this.el.offsetLeft;
      this.mouseOffsetY = evt.clientY - this.el.offsetTop;
    },

    _handleContainerMouseup: function(evt) {
      this.movingLock = false;
    },

    _handleContainerMousemove: function(evt) {
      var x = evt.clientX - this.mouseOffsetX,
        y = evt.clientY - this.mouseOffsetY;

      // TODO: Apply clipping/bounds checking to keep the palette on screen

      if(this.movingLock) {
        this.$el.css({
          top: y + 'px',
          left: x + 'px'
        });
      }
    }
  });

  return TilesetView;
});