/*global console */

define('uchuu', [
  'mixins/SubModelSerializerMixin',
  'models/EditorModel',
  'models/RoomModel',
  'controllers/TilesetController',
  'controllers/ToolController',
  'controllers/EditorController',
  'views/TilesetView'
], function(
  SubModelSerializerMixin,
  EditorModel,
  RoomModel,
  TilesetController,
  ToolController,
  EditorController,
  TilesetView
) {
  var global = window,
    uchuu = {};

  global.uchuu = uchuu;

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

      global.currentMap = new MapModel(stage);

      _.bindAll(this, 'recalculateLayout');

      // this.$el
      //   .find('#editor-content')
      //   .empty()
      //   .append(uchuu.constructStageElement(stage));
      
      var editorModel = new EditorModel();
      var editorController = new EditorController({
        delegate: this,
        editorModel: editorModel,
        stageModel: global.currentMap,
        el: $('#editor-content')
      });

      // Add in makeshift undo stuff
      jwerty.key('ctrl+Z/cmd+Z', function() {
        if(editorController && editorController.canUndo()) {
          editorController.performUndo();
        }
      });

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

      this.editorView = new EditorView({
        el: $('#editor-content')
      }); 

      // this.$el.find('#editor-content>div').append(new RoomView({
      //   model: roomModel
      // }).render().el);

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

        this.subModels.rooms.each(_.bind(function(roomModel) {
          roomModel.stage = this;
          roomModel.gridsize = this.get('gridsize');
        }, this));
      }
    }
  });

  _.extend(MapModel.prototype, SubModelSerializerMixin);

  var RoomCollection = Backbone.Collection.extend({
    model: RoomModel
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
      var roomElements = this.$el.find('.room'),
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