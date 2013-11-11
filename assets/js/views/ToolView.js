define('views/ToolView', function() {
  var ToolView = Backbone.View.extend({
    delegate: null, 

    events: {
      'click .toggle-transitions,.toggle-camera': '_handleClickToggler',
      'click input[name=mode]': '_handleClickMode',
      'click input[name=tool]': '_handleChangedTool'
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
    }
  });

  return ToolView;
});