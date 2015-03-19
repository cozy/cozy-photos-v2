Modal = require 'cozy-clearance/modal'
Photo = require '../models/photo'


module.exports = class FilesBrowser extends Modal

    id: 'files-browser-modal'
    template_content: require '../templates/browser'
    title: t 'pick from files'
    content: '<p>Loading ...</p>'

    events: -> _.extend super,
        'click img': 'toggleSelected'
        'click a.next': 'displayNextPage'
        'click a.prev': 'displayPrevPage'

    toggleSelected: (e) ->
        $el = $(e.target)
        # Get the index of the selected element in the list
        index = $el.parent().index()
        # If shiftKey is pressed, then select the whole range of items
        # between the last selected element and the current one
        if @lastSelectedIndex? and e.shiftKey
            if index > @lastSelectedIndex
                first = @lastSelectedIndex
                last = index
            else if index < @lastSelectedIndex
                first = index
                last = @lastSelectedIndex
            # Filter all elements to get those in range and select it too
            @$('.thumbs li')
            .filter (index) ->
                return first <= index <= last
            .find('img').addClass 'selected'
        else
            $el.toggleClass 'selected'
        @lastSelectedIndex = index

    getRenderData: -> @options

    initialize: (options) ->
        @yes = t 'modal ok'
        @no = t 'modal cancel'

        # stores index of the last selected element for range select w/ shiftKey
        @lastSelectedIndex = null

        # Prepare option
        if not options.page?
            super {}

        if not options.page?
            options.page = 0

        if not options.selected?
            @options.selected = []

        @options.page = options.page

        # Recover files
        Photo.listFromFiles options.page, (err, body) =>
            dates = body.files if body?.files?

            if err
                return console.log err

            # If there is no photos in Cozy
            else if dates? and Object.keys(dates).length is 0
                @options.dates = "No photos found"

            else
                # Add next/prev button
                @options.hasNext = body.hasNext if body?.hasNext?
                @options.hasPrev = options.page isnt 0
                @options.dates = Object.keys dates
                @options.dates.sort (a, b) ->
                    -1 * a.localeCompare b
                @options.photos = dates

            @$('.modal-body').html @template_content @getRenderData()
            @$('.modal-body').scrollTop(0)
            # Add selected files
            if @options.selected[@options.page]?
                for img in @options.selected[@options.page]
                    @$("##{img.id}").toggleClass 'selected'


    cb: (confirmed) ->
        return unless confirmed
        @options.beforeUpload (attrs) =>
            # flatten selection of photos accross pages
            @options.selected[@options.page] = @$('.selected')
            sel = [].concat.apply [], @options.selected.map (jq) -> jq.get()

            addImageToCollection = (img) ->
                attrs.title = img.name
                # creates a tmp version with the selected image from the browser
                photo      = new Photo attrs
                photo.file = img
                # in the mean time, trigger an update to the server to get the
                # final version of the image
                Photo.makeFromFile img.id, attrs, (err, attributes) ->
                    if err
                        console.error err
                    else
                        photo.save attributes
                return photo

            # each (tmp) files processed, bulk-add them to the collection
            @collection.add (addImageToCollection img for img in sel)


    displayNextPage: ->
        # Display next page: store selected files
        @options.selected[@options.page] = @$('.selected')
        options =
            page: @options.page + 1
            selected: @options.selected
        @initialize options

    displayPrevPage: ->
        # Display prev page: store selected files
        @options.selected[@options.page] = @$('.selected')
        options =
            page: @options.page - 1
            selected: @options.selected
        @initialize options

