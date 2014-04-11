define('UchuuDataStore', [], function() {
  var TextureModel = Backbone.Model.extend({
    idAttribute: 'fileName'
  });

  var TextureCollection = Backbone.Collection.extend({
    model: TextureModel
  });

  var GenericCollection = Backbone.Collection.extend({
    model: Backbone.Model
  });

  function DataStore() {
    this._animations = new TextureCollection();
    this._textures = new TextureCollection();
    this._tilesets = new GenericCollection();
    this._enemyPrototypes = new GenericCollection();
    this._itemPrototypes = new GenericCollection();
    this._mapModel = null;
  }

  DataStore.prototype.constructor = DataStore;

  /**
   * Generic function for loading asset files and returning a promise, which
   * when resolved, yields the asset file's contents.
   *
   * @param  {String} assetPath - the path to the asset to load
   * @param  {String} [type] - the type of asset to load, either "JSON" or "PNG"
   * @return {jQuery.Deferred} a deffered object representing the load operation
   */
  DataStore.prototype.loadAsset = function(assetPath, type) {
    var deferral,
      image;

    if(!type) {
      if(assetPath.indexOf('.png') !== -1) {
        type = 'PNG';
      }
    }

    type = type || 'JSON';

    switch(type) {
      case 'PNG':
        deferral = new $.Deferred();

        if(this._textures.get(assetPath)) {
          deferral.resolve(this._textures.get(assetPath));
        } else {
          image = new Image();

          image.onload = _.bind(function() {
            deferral.resolve(this._textures.add({
              fileName: assetPath,
              image: image
            }));
          }, this);

          image.onerror = _.bind(function() {
            deferral.reject('Unable to load "' + assetPath + '"');
          });

          image.src = '/load?path=' + assetPath;
        }
        break;
      default:
        deferral = $.ajax({
          url: '/load',
          data: {
            path: assetPath
          },
          dataType: 'JSON'
        });
        break;
    }

    return deferral.promise();
  };

  DataStore.prototype.loadTileset = function(assetPath) {
    return this.loadAsset(assetPath, 'JSON').then(_.bind(function(json) {
      return this.loadAsset(json.surface, 'PNG').then(_.bind(function() {
        return this._tilesets.add(json);
      }, this));
    }, this));
  };

  return DataStore;
});