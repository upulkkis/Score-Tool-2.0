import numpy as np

def sort_notes(notes, annotations, tgts, highlights=[]):
    # print('sortattavat:')
    # print(notes)
    if annotations:
        for i in range (len(notes)):
            notes[i]=[notes[i]]
            notes[i].append(annotations[i])
            notes[i].append(0)
            notes[i].append('')
    if tgts:
        for i in range(len(tgts)):
            notes[tgts[i]][2]=1
    if highlights:
        for i in range(len(highlights)):
            notes[i][3] = highlights[i]
    srt = sorted(notes, key=lambda x: x[0])
    #srt_idx = sorted(range(len(notes[0])), key=notes[0].__getitem__)

    #Get indexes of the sort for interaction
    srt_idx = np.argsort([i[0] for i in notes])

    n = [i[0] for i in srt]
    a = [i[1] for i in srt]
    t = [i[2] for i in srt]
    h = [i[3] for i in srt]
    tgt = [i for i in range(len(t)) if t[i] == 1]
    return n, a, tgt, h, srt_idx.tolist()