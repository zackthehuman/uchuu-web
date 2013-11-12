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

    editorModel: null,

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
      this.editorModel = options.editorModel;

      this.toolView = new ToolView({
        el: this.el,
        delegate: this
      });

      this.listenTo(this, 'editModeChanged', this._handleEditModeChanged);
      this.listenTo(this, 'toolChanged',     this._handleToolChanged);

      if(this.editorModel) {
        this.listenTo(this.editorModel, 'change:currentTool', this._handleToolChanged);
        this.listenTo(this.editorModel, 'change:editingMode', this._handleEditModeChanged);
      }
    },

    setEditMode: function(mode) {
      if(this.editorModel) {
        this.editorModel.set('editingMode', mode);
      }
    },

    setCurrentTool: function(toolName) {
      if(this.editorModel) {
        this.editorModel.set('currentTool', toolName);
      }
    },

    _handleEditModeChanged: function(model) {
      var mode = model.get('editingMode');

      console.log('Editing mode changed to ' + mode);

      if(mode === 'tile') {
        $('#editor').removeClass('show-attribute').addClass('show-tile');
      } else if(mode === 'attribute') {
        $('#editor').addClass('show-attribute').removeClass('show-tile');
      }
    },

    _handleToolChanged: function(model) {
      console.log('Tool changed to ' + model.changed.currentTool);

      if(this.toolView) {
        this.toolView.selectToolByName(model.changed.currentTool);
      }
    }

  });

  return ToolController;
});