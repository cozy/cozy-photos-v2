

# Orientation strings generated by GM lib when performing EXIF data extraction.
codes =
    TopLeft: 1
    TopRight: 2
    BottomRight: 3
    BottomLeft: 4
    LeftTop: 5
    RightTop: 6
    RightBottom: 7
    LeftBottom: 8


# Helpers to make photo metadata handling easy.
module.exports = photoHelpers =


    # Turn given orientation in an integer code.
    getOrientation: (orientation) ->
        result = 1
        if typeof orientation is 'number' and orientation > 0 and orientation < 9
            result = orientation
        else if codes[orientation]?
            result = codes[orientation]
        result