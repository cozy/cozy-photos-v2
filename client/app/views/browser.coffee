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
        $(e.target).toggleClass 'selected'

    getRenderData: -> @options

    initialize: (options) ->
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

            # If server create thumb : doesn't display files.
            if body.percent?
                @options.dates = "Thumb creation"
                @options.percent = JSON.parse(err.responseText).percent
                pathToSocketIO = \
                    "#{window.location.pathname.substring(1)}socket.io"
                socket = io.connect window.location.origin,
                    resource: pathToSocketIO
                socket.on 'progress', (e) =>
                    @options.percent = e.percent
                    if @options.percent is 100
                        @initialize(options)
                    else
                        template = @template_content @getRenderData()
                        @$('.modal-body').html template
            else if err
                return console.log err

            # If there is no photos in Cozy
            else if dates? and Object.keys(dates).length is 0
                @options.dates = "No photos found"

            else
                # Add next/prev button
                @options.hasNext = body.hasNext if body?.hasNext?
                @options.hasPrev = options.page isnt 0
                @options.dates = Object.keys(dates)
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

