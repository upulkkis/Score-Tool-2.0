def color(val):

    if val < 50:
        r = 0
        g = 255
        b = 0
        a = val / 220
    if val >= 50:
        r = ((val - 40) / 20) * 255
        g = 255
        b = 120
        a = val / 150
    if val >= 70:
        r = 255
        g = 255 - (((val - 60) / 30) * 255)
        b = 120 - (((val - 60) / 30) * 120)
        a = val / 120

    return 'rgba({},{},{},{})'.format(r, g, b, a)