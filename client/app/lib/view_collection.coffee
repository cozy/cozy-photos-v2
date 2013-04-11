BaseView = require 'lib/base_view'

# View that display a collection of subitems
# used to DRY views
# Usage : new ViewCollection(collection:collection)
# Automatically populate itself by creating a itemView for each item
# in its collection

# can use a template that will be displayed alongside the itemViews

# itemViews       : the Backbone.View to be used for items
# itemViewOptions : the options that will be passed to itemViews

module.exports = class ViewCollection extends BaseView

    itemview: null

    views: {}

    template: -> ''

    itemViewOptions: ->

    afterRender: ->
        @onReset @collection
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
