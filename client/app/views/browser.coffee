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

            # If server create thumb : doesn't display files.
            else if body.percent?
                @options.dates = "Thumb creation"
                @options.percent = body.percent
                pathToSocketIO = \
                    "#{window.location.pathname.substring(1)}socket.io"
                socket = io.connect window.location.origin,
                    resource: pathToSocketIO
                socket.on 'progress', (event) =>
                    @options.percent = event.percent
                    if @options.percent is 100
                        @initialize options
                    else
                        template = @template_content @getRenderData()
                        @$('.modal-body').html template

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
            tmp = []
            @options.selected[@options.page] = @$('.selected')
            for page in @options.selected
                for img in page
                    fileid = img.id

                    # Create a temporary photo
                    attrs.title = img.name
                    phototmp = new Photo attrs
                    phototmp.file = img
                    tmp.push phototmp
                    @collection.add phototmp

                    Photo.makeFromFile fileid, attrs, (err, photo) =>
                        return console.log err if err
                        # Replace temporary photo
                        phototmp = tmp.pop()
                        @collection.remove phototmp, parse: true
                        @collection.add photo, parse: true

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

