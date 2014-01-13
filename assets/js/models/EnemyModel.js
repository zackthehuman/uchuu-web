define('models/EnemyModel', [], function() {
  /**
   * A model representing an enemy, the prototypical instance of an enemy. This
   * is not to be confused with an EnemySpawner, which spawns an enemy in a Room.
   *
   * @class EnemyModel
   * @extends {Backbone.Model}
   */
  var EnemyModel = Backbone.Model.extend({
    defaults: function() {
      return  {
        "name": "Enemy",
        "damageId": 0,
        "hitPoints": 1.0,
        "behavior": {
          "type": "scripted",
          "name": "EnemyBehavior",
          "config": {}
        },
        "animationSet": "assets/animations/enemy.json",
        "boundingBox": {
          "width": 16,
          "height": 16,
          "originX": 8,
          "originY": 8
        },
        "states": {
          "default": {}
        },
        "characteristics": {
          "gravitated": true,
          "phasing": false
        }
      };
    },

    initialize: function(attributes, options) {
      Backbone.Model.prototype.initialize.apply(this, arguments);
    }
  });

  return EnemyModel;
});