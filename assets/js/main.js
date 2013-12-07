require(['uchuu'], function(uchuu) {

  $(document).ready(function() {
    $.when(uchuu.loadStage('assets/stages/map-pearlman.json')).done(function(stage) {
      var uchuuApp = new uchuu.UchuuApp({
        el: $('#editor'),
        stage: stage
      });

      $(window).on('resize', function(evt) {
        uchuuApp.recalculateLayout();
      }).trigger('resize');
    });
  });

});