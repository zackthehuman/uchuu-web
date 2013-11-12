define('models/EditorModel', function() {
  var EditorModel = Backbone.Model.extend({
    defaults: {
      currentTool: 'unset',
      currentTile: -1,
      editingMode: 'tile'
    }
  });

  return EditorModel;
});