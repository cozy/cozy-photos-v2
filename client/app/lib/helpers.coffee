module.exports =

    # Simple shortener to display of a long text
    # used for album descriptions on AlbumList page
    # @TODO: make this HTML resistant
    limitLength: (string, length) ->
        if string? and string.length > length
        then string.substring(0, length) + '...'
        else string

    # Make a $-element editable
    # options :
    #   placeholder : a place holder for the editable element
    #   onChanged   : a callback(text), fired when the text change
    editable: (el, options) ->
        {placeholder, onChanged} = options
        el.prop 'contenteditable', true
        el.text placeholder if not el.text()
        el.click ->
            el.empty() if el.text() is placeholder
            module.exports.forceFocus el
        el.focus -> el.empty() if el.text() is placeholder
        el.blur  ->
            if not el.text()
                el.text placeholder
            else
                onChanged el.html()

    forceFocus: (el) ->
        range = document.createRange()
        range.selectNodeContents el[0]
        sel = document.getSelection()
        sel.removeAllRanges()
        sel.addRange(range)
        el.focus()
