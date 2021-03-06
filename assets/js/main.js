require(['uchuu', 'models/EnemyModel'], function(uchuu, EnemyModel) {

  $(document).ready(function() {
    $.when(uchuu.load('assets/templates/enemies.json'))
      .done(function(enemiesJson) {
        var enemies = JSON.parse(enemiesJson);

        enemies = new Backbone.Collection(enemies, {
          model: EnemyModel,
          idAttribute: 'name'
        });

        window.allEnemies = enemies;

        console.log('Loaded enemies: ', enemies);

        $.when(uchuu.load('assets/templates/items.json'))
          .done(function(itemsJson) {
            var items = JSON.parse(itemsJson);

            items = new Backbone.Collection(items, {
              model: Backbone.Model.extend({
                idAttribute: 'name'
              })
            });

            window.allItems = items;

            console.log('Loaded items: ', items);

            $.when(
              uchuu.loadStage('assets/stages/map-test2.json')
            ).done(function(stage) {
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
  });

});