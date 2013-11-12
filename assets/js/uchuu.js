/*global console */

define('uchuu', [
  'models/EditorModel',
  'controllers/TilesetController',
  'controllers/ToolController',
  'views/TilesetView'
], function(
  EditorModel,
  TilesetController,
  ToolController,
  TilesetView
) {
  var global = window,
    uchuu = {};

  uchuu.textures = {};
  uchuu.tilesets = {};

  /**
   * Loads an asset file from the content directory.
   *
   * @param  {[type]} assetPath [description]
   * @return {[type]}           [description]
   */
  uchuu.load = function(assetPath) {
    console.log('uchuu.load');

    return $.ajax({
      url: '/load',
      data: {
        path: assetPath
      }
    });
  };

  /**
   * Loads a texture by path name and caches it.
   *
   * @param  {[type]} textureFilePath [description]
   * @return {[type]}                 [description]
   */
  uchuu.loadTexture = function(textureFilePath) {
    console.log('uchuu.loadTexture');

    var context = this,
      dfd = $.Deferred();

    if(context.textures[textureFilePath]) {
      return context.textures[textureFilePath];
    }

    $.when(context.load(textureFilePath)).done(function(textureResponse) {
      var image = new Image();

      image.onload = function() {
        context.textures[textureFilePath] = image;
        // console.log('loadTexture done.');
        dfd.resolve(image);
      };

      image.src = '/load?path=' + textureFilePath;
    });

    return dfd.promise();
  };

  /**
   * Loads a tileset by path name and caches it.
   *
   * @param  {[type]} tilesetFilePath [description]
   * @return {[type]}                 [description]
   */
  uchuu.loadTileset = function(tilesetFilePath) {
    console.log('uchuu.loadTileset');

    var context = this,
      tileset = null,
      dfd = $.Deferred();

    if(context.tilesets[tilesetFilePath]) {
      return context.tilesets[tilesetFilePath];
    }

    $.when(context.load(tilesetFilePath)).done(function(response) {
      tileset = JSON.parse(response);
      context.tilesets[tilesetFilePath] = tileset;

      if(tileset.surface) {
        console.log('Tile surface found, loading...');
        context.loadTexture(tileset.surface).done(function() {
          dfd.resolve(tileset);
        });
      } else {
        console.log('No tile surface; loadTileset done.');
        dfd.resolve(tileset);
      }
    });

    return dfd.promise();
  };

  /**
   * Loads a stage asynchronously and return a promise.
   *
   * @param  {[type]} stageFilePath [description]
   * @return {[type]}               [description]
   */
  uchuu.loadStage = function(stageFilePath) {
    var context = this,
      stage = null,
      dfd = $.Deferred();

    $.when(context.load(stageFilePath)).done(function(response) {
      stage = JSON.parse(response);

      if(stage.tileset) {
        context.loadTileset(stage.tileset).done(function() {
          dfd.resolve(stage);
        });
      }
    });

    return dfd.promise();
  };

  uchuu.constructStageElement = function(stageModel) {
    var context = this,
      element = document.createElement('div'),
      roomElement = null,
      roomIndex = 0;

    if(stageModel) {
      for(roomIndex = 0; roomIndex < stageModel.rooms.length; ++roomIndex) {
        roomElement = context._constructRoomElement(stageModel, roomIndex);

        $(roomElement).data('room', stageModel.rooms[roomIndex]);

        element.appendChild(roomElement);
      }
    }

    // $(element).on('click', '.room', function(evt) {
    //   var localX = evt.offsetX,
    //     localY = evt.offsetY,
    //     tileX = Math.floor(localX / stageModel.gridsize),
    //     tileY = Math.floor(localY / stageModel.gridsize),
    //     roomModel = $(evt.target).find('canvas').data('room');
      
    //   console.log(roomModel, tileX, tileY);
    // });

    element.style.position = 'relative';

    // var context = this,
    //   element = null,
    //   tileset = null,
    //   texture = null,
    //   ctx = null,
    //   tX = 0,
    //   tY = 0,
    //   tileOffset = 0,
    //   tileIndex = 0,
    //   tile = null;

    // if(stageModel) {
    //   tileset = context.tilesets[stageModel.tileset];
    //   texture = context.textures[tileset.surface];

    //   element = document.createElement('canvas');
    //   element.width = stageModel.rooms[0].width * stageModel.gridsize;
    //   element.height = stageModel.rooms[0].height * stageModel.gridsize;

    //   ctx = element.getContext('2d');

    //   for(tY = 0; tY < stageModel.rooms[0].height; ++tY) {
    //     for(tX = 0; tX < stageModel.rooms[0].width; ++tX) {
    //       // drawImage(image, sx, sy, sw, sh, dx, dy, dw, dh);
    //       tileOffset = tY * stageModel.rooms[0].width + tX;
    //       tileIndex = stageModel.rooms[0].tile[tileOffset];
    //       tile = tileset.tiles[tileIndex];

    //       ctx.drawImage(
    //         texture,
    //         tile.x,
    //         tile.y,
    //         tileset.size,
    //         tileset.size,
    //         tX * stageModel.gridsize,
    //         tY * stageModel.gridsize,
    //         stageModel.gridsize,
    //         stageModel.gridsize);
    //     }
    //   }
    // }

    return element;
  };

  uchuu._constructRoomElement = function(stageModel, roomIndex) {
    var context = this,
      element = null,
      tileset = null,
      texture = null,
      ctx = null,
      tX = 0,
      tY = 0,
      tileOffset = 0,
      tileIndex = 0,
      tile = null,
      room = null,
      gridsize = 0;

    if(stageModel) {
      tileset = context.tilesets[stageModel.tileset];
      texture = context.textures[tileset.surface];
      room = stageModel.rooms[roomIndex];
      gridsize = stageModel.gridsize;

      element = document.createElement('canvas');
      element.width = room.width * gridsize;
      element.height = room.height * gridsize;

      ctx = element.getContext('2d');

      for(tY = 0; tY < room.height; ++tY) {
        for(tX = 0; tX < room.width; ++tX) {
          tileOffset = tY * room.width + tX;
          tileIndex = room.tile[tileOffset];
          tile = tileset.tiles[tileIndex];

          ctx.drawImage(
            texture,
            tile.x,
            tile.y,
            tileset.size,
            tileset.size,
            tX * gridsize,
            tY * gridsize,
            gridsize,
            gridsize);
        }
      }
    }

    element.style.position = 'absolute';
    element.style.display  = 'block';
    element.style.left     = (room.x * gridsize) + 'px';
    element.style.top      = (room.y * gridsize) + 'px';
    element.style.zIndex   = roomIndex;
    element.className      = 'tile-layer';

    return element;
  };

  uchuu.UchuuApp = Backbone.View.extend({
    tagname: 'div',

    className: 'uchuu-app',

    initialize: function(options) {
      var that = this,
        stage = options.stage;

      _.bindAll(this, 'recalculateLayout');

      this.$el
        .find('#editor-content')
        .empty()
        .append(uchuu.constructStageElement(stage));
      
      var editorModel = new EditorModel();

      var tilesetController = new TilesetController({
        delegate: this,
        editorModel: editorModel
      });

      var tilesetView = new TilesetView({
        delegate: tilesetController,
        tileset: uchuu.tilesets[stage.tileset],
        tilesetImage: uchuu.textures[uchuu.tilesets[stage.tileset].surface]
      });

      this.$el.append(tilesetView.render().el);

      var roomModel = new RoomModel(stage.rooms[0], {
        stage: stage
      });

      var toolController = new ToolController({
        delegate: this,
        editorModel: editorModel,
        el: $('#toolbar')
      });

      global.currentMap = new MapModel(stage);

      this.editorView = new EditorView({
        el: $('#editor-content')
      }); 

      this.$el.find('#editor-content>div').append(new RoomView({
        model: roomModel
      }).render().el);

      editorModel.set('currentTool', 'select');

      this.listenTo(editorModel, 'change:currentTile', function(model) {
        console.log('Selected tile changed to ' + model.get('currentTile'));
      });

      this.trigger('layoutChanged');
    },

    recalculateLayout: function() {
      var windowHeight = $(document.body).height(),
        headerHeight = $('#toolbar').outerHeight(),
        footerHeight = $('#status').outerHeight(),
        targetHeight = windowHeight - headerHeight - footerHeight;

      $('#editor').height(targetHeight);

      console.log('resize', targetHeight, windowHeight, headerHeight, footerHeight);

      if(this.editorView) {
        this.editorView._recalculateLayout();
      }
    }
  });

  /**
   * Forces any keys in the subModel property to be serialized and override
   * keys with the same name in the JSON output. Useful for when subobjects
   * are managed in collections but need to be part of the JSON output of a
   * parent model.
   * 
   * @mixin {SubModelSerializerMixin}
   */
  var SubModelSerializerMixin = {
    toJSON: function() {
      var json = Backbone.Model.prototype.toJSON.apply(this),
        subModels;

      if(this.subModels) {
        subModels = _.clone(this.subModels);

        // Serialize the submodels
        _.each(subModels, function(value, key, list) {
          list[key] = value.toJSON();
        });

        json = _.omit(json, _.keys(this.subModels));
        json = _.extend(json, subModels);
      }

      return json;
    }
  };

  /**
   * A model backing the entire map. Contains a collection of Rooms and other
   * attributes.
   *
   * @class MapModel
   * @extends {Backbone.Model}
   * @mixes {SubModelSerializerMixin}
   */
  var MapModel = Backbone.Model.extend({
    defaults: {
      "tileset": "",
      "gridsize": 16,
      "musicId": 10,
      "specialRooms": {
        "starting": 0,
        "midpoint": 0,
        "bossCorridor": 0,
        "bossChamber": 0
      },
      "rooms": []
    },

    initialize: function(attributes, options) {
      if(attributes) {
        this.subModels = {
          rooms: new RoomCollection(attributes.rooms)
        };
      }
    }
  });

  _.extend(MapModel.prototype, SubModelSerializerMixin);

  var TransitionRegionModel = Backbone.Model.extend({});
  var EnemyModel = Backbone.Model.extend({});
  var ItemModel = Backbone.Model.extend({});

  var TransitionRegionCollection = Backbone.Collection.extend({
    model: TransitionRegionModel
  });

  var EnemyCollection = Backbone.Collection.extend({
    model: EnemyModel
  });

  var ItemCollection = Backbone.Collection.extend({
    model: ItemModel
  });

  var DEFAULT_ROOM_PADDING      = 2,
    DEFAULT_ROOM_WIDTH          = 16 + DEFAULT_ROOM_PADDING,
    DEFAULT_ROOM_HEIGHT         = 15 + DEFAULT_ROOM_PADDING,
    DEFAULT_CAMERA_BOUND_WIDTH  = DEFAULT_ROOM_WIDTH - DEFAULT_ROOM_PADDING,
    DEFAULT_CAMERA_BOUND_HEIGHT = DEFAULT_ROOM_HEIGHT - DEFAULT_ROOM_PADDING,
    DEFAULT_CAMERA_BOUND_X      = 1,
    DEFAULT_CAMERA_BOUND_Y      = 1;

  /**
   * Model for an individual room. Contains collections of enemies, items, and
   * transitions. Also contains all of the tile and collision information.
   * 
   * @class RoomModel
   * @extends {Backbone.Model}
   * @mixes {SubModelSerializerMixin}
   */
  var RoomModel = Backbone.Model.extend({
    stage: {},
    gridsize: 16,
    defaults: {
      "id": 0,
      "x": 0,
      "y": 0,
      "width": DEFAULT_ROOM_WIDTH,
      "height": DEFAULT_ROOM_HEIGHT,
      "tile": [
        1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
        1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
        1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
        1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
        1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
        1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
        1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
        1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
        1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
        1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
        1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1
      ],
      "attr": [
        1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
        1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
        1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
        1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
        1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
        1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
        1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
        1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
        1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
        1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
        1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
        1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
        1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
        1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
        1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1
      ],
      "cameraBounds": {
        "x": DEFAULT_CAMERA_BOUND_X,
        "y": DEFAULT_CAMERA_BOUND_Y,
        "width": DEFAULT_CAMERA_BOUND_WIDTH,
        "height": DEFAULT_CAMERA_BOUND_HEIGHT
      },
      "enemies": [],
      "items": [],
      "transitions": [],
      "doors": {}
    },

    initialize: function(attributes, options) {
      if(options){
        if(options.gridsize) {
          this.gridsize = options.gridsize;
        }

        if(options.stage) {
          this.stage = options.stage;          
        }
      }

      if(attributes) {
        this.subModels = {
          enemies: new EnemyCollection(attributes.enemies),
          items: new ItemCollection(attributes.items),
          transitions: new TransitionRegionCollection(attributes.transitions)
        };
      }
    }
  });

  _.extend(RoomModel.prototype, SubModelSerializerMixin);
  
  var RoomCollection = Backbone.Collection.extend({
    model: RoomModel
  });

  var RoomView = Backbone.View.extend({
    tagname: 'div',

    className: 'room',

    events: {
      'click': '_handleClick',
      'mousemove': '_handleMousemove'
    },

    model: RoomModel,

    subViews: null,

    initialize: function() {
      _.bindAll(this,
        '_handleClick',
        '_handleMousemove');
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
      var stage, room, cssProps, attrLayer;

      this.$el.empty();

      if(this.model) {
        stage = this.model.stage;

        this.$el.append(uchuu._constructRoomElement(stage, 0));
        cssProps = this.$el.find('canvas').css(['position', 'top', 'left', 'zIndex']);
        this.$el.find('canvas').css({
          'position': 'static',
        });

        this.$el.css(_.extend(cssProps, {
          width: this.model.get('width') * stage.gridsize,
          height: this.model.get('height') * stage.gridsize
        }));

        attrLayer = $('<canvas />');
        attrLayer.css(_.extend(cssProps, {
          width: this.model.get('width') * stage.gridsize,
          height: this.model.get('height') * stage.gridsize
        }));
        attrLayer.addClass('layer-attribute');
        attrLayer.attr('width', this.model.get('width') * stage.gridsize);
        attrLayer.attr('height', this.model.get('height') * stage.gridsize);

        this.$el.append(attrLayer);

        this._drawAttributeLayer();

        this.$el.append('<div class="camera-bounds"></div>')
          .find('.camera-bounds')
            .css({
              width: this.model.get('cameraBounds').width * stage.gridsize,
              height: this.model.get('cameraBounds').height * stage.gridsize,
              position: 'absolute',
              top: this.model.get('cameraBounds').y * stage.gridsize,
              left: this.model.get('cameraBounds').x * stage.gridsize
            });

        this._renderSubViews();
      }

      this.$el.trigger('layoutChanged');

      return this;
    },

    _drawAttributeLayer: function() {
      var context = this,
        element = null,
        tileset = null,
        texture = null,
        ctx = null,
        tX = 0,
        tY = 0,
        tileOffset = 0,
        tileIndex = 0,
        tile = null,
        room = null,
        gridsize = 0,
        stageModel = this.model.stage;

      element = this.$el.find('.layer-attribute').get(0);

      if(stageModel) {
        //tileset = context.tilesets[stageModel.tileset];
        //texture = context.textures[tileset.surface];
        room = this.model.toJSON();
        gridsize = stageModel.gridsize;

        ctx = element.getContext('2d');

        for(tY = 0; tY < room.height; ++tY) {
          for(tX = 0; tX < room.width; ++tX) {
            tileOffset = tY * room.width + tX;
            tileIndex = room.tile[tileOffset];
            // tile = tileset.tiles[tileIndex];

            // ctx.drawImage(
            //   texture,
            //   tile.x,
            //   tile.y,
            //   tileset.size,
            //   tileset.size,
            //   tX * gridsize,
            //   tY * gridsize,
            //   gridsize,
            //   gridsize);
            if(tileIndex === 0) {
              ctx.setFillColor('#000');
            } else if(tileIndex === 1) {
              ctx.setFillColor('#fff');
            }
            ctx.fillRect(tX * gridsize, tY * gridsize, gridsize, gridsize);
          }
        }
      }
    },

    _renderSubViews: function() {
      var transitions; // TODO: More for enemies, items, etc.

      if(this.model && this.model.subModels) {
        this.subViews = {
          transitions: []
        };

        transitions = this.model.subModels.transitions;
        transitions.each(_.bind(function(transition) {
          console.log('Creating subview for transition', transition);
          this.subViews.transitions.push(
            new TransitionRegionView({
              model: transition
            })
          );
        }, this));

        // Render the new views and append them
        _.each(this.subViews.transitions, _.bind(function(element, index, list) {
          this.$el.append(element.render().el);
        }, this));
      }
    },

    _renderEntireRoom: function() {

    }
  });

  var TransitionRegionView = Backbone.View.extend({
    className: 'transition-region',

    render: function() {
      if(this.model) {
        this.$el.css({
          width: this.model.get('width') * 16,
          height: this.model.get('height') * 16,
          left: this.model.get('x') * 16,
          top: this.model.get('y') * 16,
          position: "absolute"
        }).addClass('direction-' + this.model.get('direction'));
      }

      return this;
    }
  });

  var EditorView = Backbone.View.extend({
    events: {
      'layoutChanged': '_recalculateLayout'
    },

    initialize: function() {
      console.log('CREATED IT');
      _.bindAll(this, '_recalculateLayout');
    },

    _recalculateLayout: function() {
      var roomElements = this.$el.find('canvas'),
        rights = [],
        bottoms = [],
        $parentContainer = this.$el.parent();

      _.each(roomElements, function(element, index, list) {
        var $element = $(element),
          position = $element.position();
          
        rights.push(position.left + $element.width());
        bottoms.push(position.top + $element.height());
      });

      rights.push($parentContainer.width());
      bottoms.push($parentContainer.height());

      console.log('Width: ', _.max(rights), 'Height: ', _.max(bottoms));

      this.$el
        .height(_.max(bottoms))
        .width(_.max(rights));
    }
  });

  return uchuu;
});