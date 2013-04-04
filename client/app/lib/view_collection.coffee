BaseView = require 'lib/base_view'
module.exports = class ViewCollection extends BaseView

    itemview: null

    views: {}

    template: -> ''

    initialize: ->

    itemViewOptions: ->

    afterRender: ->
        @collection.forEach @onAdd
        @listenTo @collection, "reset",   @onReset
        @listenTo @collection, "add",     @onAdd
        @listenTo @collection, "remove",  @onRemove

    onAdd: (model) =>
        options = _.extend {}, {model: model}, @itemViewOptions(model)
        view = new @itemview options
        view.render()
        @views[model.id] = view
        @appendView view

    appendView: (view) ->
        @$el.append view.el

    onRemove: (model) ->
        for id, view of @views
            if view.model is model
                view.remove()
                delete @views[id]

    onReset: (newcollection) ->
        for id, view of @views
            view.remove()
        views = {}
        newcollection.forEach @onAdd
