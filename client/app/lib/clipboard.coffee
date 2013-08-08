module.exports = class Clipboard

    constructor: ->
        @value = ""

        $(document).keydown (e) =>
            # Check if value exist and if user wants to copy
            if not @value or not(e.ctrlKey or e.metaKey)
                return

            _.defer =>
                $clipboardContainer = $("#clipboard-container")
                $clipboardContainer.empty().show()
                $("<textarea id='clipboard'></textarea>")
                .val(@value)
                .appendTo($clipboardContainer)
                .focus()
                .select()

        $(document).keyup (e) =>
            if $(e.target).is("#clipboard")
                $("<textarea id='clipboard'></textarea>").val("")
                $("#clipboard-container").empty().hide()

    set: (value) =>
        @value = value