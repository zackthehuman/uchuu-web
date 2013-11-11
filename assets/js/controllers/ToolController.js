// TODO: Require backbone and underscore
define('controllers/ToolController', [
  'views/ToolView'
], function(
  ToolView
) {
  var ToolController = Backbone.View.extend({
    editMode: null,

    currentTool: null,

    delegate: null,

    toolView: null,

    initialize: function(options) {
      _.bindAll(this,
        'setEditMode',
        'setCurrentTool',
        '_handleEditModeChanged',
        '_handleToolChanged');

      this.setEditMode('tile');
      this.setCurrentTool('select');
      this.delegate = options.delegate;

      this.toolView = new ToolView({
        el: this.el,
        delegate: this
      });

      this.listenTo(this, 'editModeChanged', this._handleEditModeChanged);
      this.listenTo(this, 'toolChanged',     this._handleToolChanged);
    },

    setEditMode: function(mode) {
      this.editMode = mode;
      this.trigger('editModeChanged', this.editMode);
    },

    setCurrentTool: function(toolName) {
      this.currentTool = toolName;
      this.trigger('toolChanged', this.currentTool);
    },

    _handleEditModeChanged: function(mode) {
      if(mode === 'tile') {
        $('#editor').removeClass('show-attribute').addClass('show-tile');
      } else if(mode === 'attribute') {
        $('#editor').addClass('show-attribute').removeClass('show-tile');
      }
    },

    _handleToolChanged: function(tool) {
      console.log('Tool changed to ' + tool);

      if(this.toolView) {
        this.toolView.selectToolByName(tool);
      }
    }

  });

  return ToolController;
});