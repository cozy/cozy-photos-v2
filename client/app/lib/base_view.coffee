module.exports = class BaseView extends Backbone.View
  initialize: (options) ->
    @options = options

  template: ->

  getRenderData: ->

  render: =>
    data = _.extend {}, @options, @getRenderData()
    @$el.html @template(data)
    @afterRender()
    this

  afterRender: ->