define('models/EditorModel', function() {
  var EditorModel = Backbone.Model.extend({
    defaults: {
      currentTool: 'unset',
      currentTile: -1,
      editingMode: 'tile',
      attributeMask: 0
    },

    initialize: function() {
      this.undoBuffer = new Backbone.Collection();
      this.redoBuffer = new Backbone.Collection();

      // Consider using 'reset' and 'add' and 'remove' events
      this.listenTo(this.undoBuffer, 'all', _.bind(function() {
        this.trigger('change:undoBuffer', this.undoBuffer);
      }, this));

      this.listenTo(this.redoBuffer, 'all', _.bind(function() {
        this.trigger('change:redoBuffer', this.redoBuffer);
      }, this));
    }
  });

  return EditorModel;
});