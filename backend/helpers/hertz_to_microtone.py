import pretty_midi

def convert(val):
    nbr=pretty_midi.hz_to_note_number(val)
    frac=nbr%1
    base_note=int(nbr)
    # print(frac)
    # print(base_note)
    notename = pretty_midi.note_number_to_name(base_note)
    if frac>0.25 and frac<0.75:
        if len(notename)==2:
            symb='+'

        if len(notename)==3:
            notename = pretty_midi.note_number_to_name(base_note+1)
            symb='d'
        notename = notename[0] + symb + notename[1]
    elif frac>=0.75:
        notename = pretty_midi.note_number_to_name(base_note+1)
    return notename