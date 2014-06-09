app = require 'application'
BaseView = require 'lib/base_view'
Galery = require 'views/galery'
{editable} = require 'lib/helpers'
Clipboard = require 'lib/clipboard'
thProcessor = require 'models/thumbprocessor'
contactModel = require 'models/contact'

Contact = new contactModel()
clipboard = new Clipboard()

module.exports = class AlbumView extends BaseView
    template: require 'templates/album'

    id: 'album'
    className: 'container-fluid'

    events: =>
        'click a.delete': @destroyModel
        'click a.changeclearance': @changeClearance
        'click a.addcontact': @addcontact
        'click a.sendmail': @sendMail
        'click a.add': @prepareContact
        'click a#rebuild-th-btn': @rebuildThumbs
        'keyup #mails': @onKeyUpMails

    getRenderData: ->
        clearance = @model.get 'clearance'
        clearance = 'private' unless clearance?
        clearanceHelpers = @clearanceHelpers clearance
        res = _.extend
            clearanceHelpers: clearanceHelpers
            photosNumber: @model.photos.length
        , @model.attributes
        res

    afterRender: ->
        @galery = new Galery
            el: @$ '#photos'
            editable: @options.editable
            collection: @model.photos
            beforeUpload: @beforePhotoUpload

        @galery.album = @model
        @galery.render()

        @makeEditable() if @options.editable

    # save album before photos are uploaded to it
    # store albumid in the photo
    beforePhotoUpload: (callback) =>
        @saveModel().then =>
            callback albumid: @model.id

    # make the divs editable
    makeEditable: =>
        @$el.addClass 'editing'

        @refreshPopOver @model.get 'clearance'

        editable @$('#title'),
            placeholder: t 'Title ...'
            onChanged: (text) => @saveModel title: text.trim()

        editable @$('#description'),
            placeholder: t 'Write some more ...'
            onChanged: (text) => @saveModel description: text.trim()

    destroyModel: ->
        if @model.isNew()
            return app.router.navigate 'albums', true

        if confirm t 'Are you sure ?'
            @model.destroy().then ->
                app.router.navigate 'albums', true

    changeClearance: (event) ->
        newclearance = event.target.id.replace 'change', ''
        id = event.target.id

        @$("##{id}").spin 'tiny'
        @$("##{id}").css 'color', 'transparent'
        @saveModel(clearance: newclearance).then =>
            @$("##{id}").spin()
            @$("##{id}").css 'color', 'white'
            @refreshPopOver newclearance

    refreshPopOver: (clearance) ->
        help =  @clearanceHelpers clearance
        modal = @$('#clearance-modal')

        @$('.clearance').find('span').text clearance
        modal.find('h3').text help?.title
        modal.find('.modal-body').html help?.content
        modal.find('.changeclearance').removeClass 'active'
        modal.find('#change' + clearance).addClass 'active'
        if clearance is "hidden"
            modal.find('.share').show()
            clipboard.set @getPublicUrl()
        else
            modal.find('.share').hide()
            clipboard.set ""

    addcontact: () ->
        # Initialize user's contacts
        modal = @$('#add-contact-modal')
        @options.contacts = []
        Contact.list
            success: (body) =>
                for contact in body
                    for item in contact.datapoints
                        if item.name is "email"
                            # Contact.index is used to identify checkbox
                            contact.index = (contact.fn).split(' ').join('_')
                            contact.index = (contact.index).split("'").join('_')
                            contact.index = (contact.index).split("/").join('_')
                            contact.index = (contact.index).split("*").join('_')
                            # Sort contacts alphabetically
                            n = 0
                            while @options.contacts[n]? and @options.contacts[n].fn < contact.fn
                                n++
                            @options.contacts.splice(n, 0, contact)
                            break
                if @options.contacts.length is 0
                    @options.contacts = "No contacts found"
                @$('#add-contact-modal').modal('hide')
                @render modal
                @$('#add-contact-modal').modal('show')
            error: (err) ->
                console.log err

    prepareContact: (event) ->
        # Recover mails of selected contacts
        modal = @$('#add-contact-modal')
        mails = []
        for contact in @options.contacts
            if @$("##{contact.index}").is(':checked')
                for item in contact.datapoints
                    if item.name is "email"
                        mails.push ' ' + item.value
                        break
        @$('#mails').val(mails)

    # Temporary tool to allow people to rebuild the thumbnails with size
    # set recently. New size is larger, so older thumbs looks blurry.
    # This function recalculate them with the right size
    rebuildThumbs: (event) ->
        for model in @model.photos.models
            console.log model
            thProcessor.process model

    onKeyUpMails: (event) ->
        if event.which is 13 or event.keyCode is 13
            @sendMail()

    sendMail: (event) ->
        mails = @$('#mails').val()
        if mails.length is 0
            alert "Please enter an email."
        else
            @$("a.sendmail").spin 'tiny'
            @$("a.sendmail").css 'color', 'transparent'
            @model.sendMail @getPublicUrl(), mails,
                success: =>
                    @$("a.sendmail").spin()
                    @$("a.sendmail").css 'color', 'white'
                    msg = "Mail was successfully sent to : \n"
                    mails = mails.split(',')
                    for mail in mails
                        msg = msg + "\n" + mail
                    alert msg
                error: (err) =>
                    @$("a.sendmail").spin()
                    @$("a.sendmail").css 'color', 'white'
                    alert JSON.parse(err.responseText).error

    saveModel: (hash) ->
        promise = @model.save(hash)
        if @model.isNew()
            promise = promise.then =>
                app.albums.add @model
                app.router.navigate "albums/#{@model.id}/edit"

        return promise

    getPublicUrl: ->
        origin = window.location.origin
        path = window.location.pathname.replace 'apps', 'public'
        path = '/public/' if path is '/'
        hash = window.location.hash.replace '/edit', ''
        return origin + path + hash

    clearanceHelpers: (clearance) ->
        if clearance is 'public'
            title: t 'This album is public'
            content: t 'It will appears on your homepage.'
        else if clearance is 'hidden'
            title: t 'This album is hidden'
            content: t("hidden-description") + " #{@getPublicUrl()}" +
                        "<p>If you want to copy url in your clipboard: "+
                        "just press Ctrl+C </p>"
        else if clearance is 'private'
            title: t 'This album is private'
            content: t 'It cannot be accessed from the public side'
