define('mixins/SubModelSerializerMixin', function() {
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

  return SubModelSerializerMixin;
});