module.exports =
    limitLength: (string, length) ->
        if string? and string.length > length
        then string.substring(0, length) + '...'
        else string

    editable: (el, options) ->
        {placeholder, onChanged} = options
        el.prop 'contenteditable', true
        el.text placeholder if not el.text()
        el.focus -> el.empty() if not el.text() is placeholder
        el.blur  ->
            if not el.text()
                el.text placeholder
            else
                onChanged el.text()
