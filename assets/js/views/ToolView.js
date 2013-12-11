define('views/ToolView', function() {
  var ToolView = Backbone.View.extend({
    delegate: null, 

    events: {
      'click .toggle-transitions,.toggle-camera': '_handleClickToggler',
      'click input[name=mode]': '_handleClickMode',
      'click input[name=tool]': '_handleChangedTool',
      'click .action-undo': '_handleUndoClick',
      'click .action-redo': '_handleRedoClick'
    },

    togglerMap: {
      'toggle-transitions': 'show-transitions',
      'toggle-camera': 'show-camera-bounds'
    },

    initialize: function(options) {
      options = options || {};

      _.bindAll(this,
        '_handleClickToggler',
        '_handleChangedTool');

      this.delegate = options.delegate;
    },

    _handleClickToggler: function(evt) {
      var $toggler = $(evt.currentTarget),
        appliedClass = '';

      if($toggler.hasClass('toggle-transitions')) {
        appliedClass = this.togglerMap['toggle-transitions'];
      } else if($toggler.hasClass('toggle-camera')) {
        appliedClass = this.togglerMap['toggle-camera'];
      }

      if($toggler.is(':checked')) {
        $('#editor').addClass(appliedClass);
      } else {
        $('#editor').removeClass(appliedClass);
      }

      if(this.delegate) {

      }
    },

    _handleClickMode: function(evt) {
      var mode = $(evt.currentTarget).val();

      if(this.delegate) {
        this.delegate.setEditMode(mode);
      }
    },

    _handleChangedTool: function(evt) {
      var tool = $(evt.currentTarget).val();

      if(this.delegate) {
        this.delegate.setCurrentTool(tool);
      }

      evt.stopPropagation();
    },

    selectToolByName: function(toolName) {
      this.$el
        .find('input:radio[name=tool][value=' + toolName + ']')
          .prop('checked', true);
    },

    enableUndoButton: function() {
      this.$el
        .find('#action-undo').prop('disabled', false);
    },

    disableUndoButton: function() {
      this.$el
        .find('#action-undo').prop('disabled', true);
    },
    
    enableRedoButton: function() {
      this.$el
        .find('#action-redo').prop('disabled', false);
    },
    
    disableRedoButton: function() {
      this.$el
        .find('#action-redo').prop('disabled', true);
    },

    _handleUndoClick: function(evt) {
      console.log('_handleUndoClick');
      if(this.delegate && this.delegate.requestUndo) {
        this.delegate.requestUndo();
        // evt.preventDefault();
        evt.stopPropagation();
      }
    },

    _handleRedoClick: function(evt) {
      console.log('_handleRedoClick');
      if(this.delegate && this.delegate.requestRedo) {
        this.delegate.requestRedo();
         //evt.preventDefault();
        evt.stopPropagation();
      }
    }
  });

  return ToolView;
});