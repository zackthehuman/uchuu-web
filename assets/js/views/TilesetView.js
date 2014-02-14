define('views/TilesetView', function() {
  var TilesetView = Backbone.View.extend({
    className: 'tileset-container',

    delegate: null,
    
    events: {
      'click .tile': '_handleTileClick',
      'click input:checkbox': '_updateAttributeMask',
      'mousedown': '_handleContainerMousedown',
      'mouseup': '_handleContainerMouseup',
      'mousemove': '_handleContainerMousemove'
    },

    editorModel: null,

    tileset: null,

    tilesetImage: null,

    tileIndexMap: null,

    attributeMask: 0,

    initialize: function(options) {
      _.bindAll(this,
        'render',
        'selectTileByIndex',
        '_updateAttributeMask',
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

        if(options.editorModel) {
          this.editorModel = options.editorModel;

          this.listenTo(this.editorModel, 'change:editingMode', _.bind(function(source, mode) {
            console.log('I heard the editing mode changed. ', arguments);
            this.setMode(mode);
          }, this));

          this.setMode(this.editorModel.get('editingMode'));
        }
      }
    },

    render: function() {
      var tileElements = [],
        tileContainer,
        attrContainer;

      if(this.tileset && this.tilesetImage) {
        this.$el.html('<div class="tiles"></div><div class="attributes"></div>');
        tileContainer = this.$el.find('.tiles');
        attrContainer = this.$el.find('.attributes');
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

        tileContainer.append(tileElements);
      }

      if(dust) {
        dust.render('attribute_editor', {}, function(err, out) {
          if(err) {
            console.log(err);
          } else {
            attrContainer.html(out);
          }
        });
      }

      this.setMode(this.editorModel.get('editingMode'));

      return this;
    },

    /**
     * Switches between different tile modes (Tile & Attribute, for example).
     * @param {String} mode - the mode to switch to.
     */
    setMode: function(mode) {
      if('tile' === mode) {
        this.$el.children('div').hide().filter('.tiles').show();
      } else if('attribute' === mode) {
        this.$el.children('div').hide().filter('.attributes').show();
      }
    },

    _updateAttributeMask: function() {
      var radioButtons = this.$el.find('.attributes input:checked'),
        maskValue = 0;

      radioButtons.each(function() {
        var button = $(this),
          value = parseInt(button.val(), 10);


        maskValue |= value;
      });

      this.attributeMask = maskValue;
      this.editorModel.set('attributeMask', this.attributeMask);

      console.log('_updateAttributeMask: ' + this.attributeMask);

      return this.attributeMask;
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