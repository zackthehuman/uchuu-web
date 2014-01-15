/*global console */

define('uchuu', [
  'mixins/SubModelSerializerMixin',
  'models/EditorModel',
  'models/RoomModel',
  'models/MapModel',
  'models/EnemyModel',
  'controllers/TilesetController',
  'controllers/ToolController',
  'controllers/EditorController',
  'views/TilesetView'
], function(
  SubModelSerializerMixin,
  EditorModel,
  RoomModel,
  MapModel,
  EnemyModel,
  TilesetController,
  ToolController,
  EditorController,
  TilesetView
) {
  var global = window,
    uchuu = {};

  global.uchuu = uchuu;

  var dustTest = dust.compile('Hello, {name}!', 'hello');
  dust.loadSource(dustTest);

  dust.render('hello', { name: "ZackTheHuman" }, function(err, out) {
    console.log(out);
  });

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

  uchuu.save = function(assetPath, data) {
    console.log('uchuu.save');

    return $.ajax({
      url: '/save',
      data: {
        path: assetPath,
        mapData: data
      },
      type: 'POST'
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

  uchuu.UchuuApp = Backbone.View.extend({
    tagname: 'div',

    className: 'uchuu-app',

    initialize: function(options) {
      var that = this,
        stage = options.stage;

      global.currentMap = new MapModel(stage, {
        filePath: ''
      });

      _.bindAll(this, 'recalculateLayout');
      
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

      jwerty.key('ctrl+shift+Z/cmd+shift+Z', function() {
        if(editorController && editorController.canRedo()) {
          editorController.performRedo();
        }
      });

      jwerty.key('ctrl+B/cmd+B', function() {
        if(editorController && editorController.stopUndoOperation()) {
          editorController.stopUndoOperation();
        }
        editorModel.set('currentTool', 'pencil');
      });

      jwerty.key('ctrl+G/cmd+G', function() {
        if(editorController && editorController.stopUndoOperation()) {
          editorController.stopUndoOperation();
        }
        editorModel.set('currentTool', 'floodfill');
      });

      jwerty.key('ctrl+I/cmd+I', function() {
        if(editorController && editorController.stopUndoOperation()) {
          editorController.stopUndoOperation();
        }
        editorModel.set('currentTool', 'eyedropper');
      });

      jwerty.key('ctrl+M/cmd+M', function() {
        if(editorController && editorController.stopUndoOperation()) {
          editorController.stopUndoOperation();
        }
        editorModel.set('currentTool', 'move');
      });

      jwerty.key('ctrl+S/cmd+S', function(evt) {
        uchuu.save('assets/stages/map-pearlman.json', JSON.stringify(global.currentMap.toJSON()));
        evt.preventDefault();
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
        delegate: editorController,
        editorModel: editorModel,
        el: $('#toolbar')
      });

      this.editorView = new EditorView({
        el: $('#editor-content')
      });

      editorModel.set('currentTool', 'select');
      editorModel.set('currentTile', 0);

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

  var EditorView = Backbone.View.extend({
    events: {
      'layoutChanged': '_recalculateLayout'
    },

    initialize: function() {
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