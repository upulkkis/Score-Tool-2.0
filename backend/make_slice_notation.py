import sort_for_vexflow
import pretty_midi

def notation(orchestra, inst, tech, dyn, note, tgt, onoff, masking_order_idx):
    annotations=[]
    orchestration_slice=[]
    tgts=[]
    for i in range(len(inst)):
        # Check that you input proper values:
        if tech[i] in list(orchestra[inst[i]].keys()):
            if dyn[i] in list(orchestra[inst[i]][tech[i]].keys()):
                if int(note[i]) in list(orchestra[inst[i]][tech[i]][dyn[i]].keys()):
                    orchestration_slice.append(
                        [inst[i], tech[i], dyn[i], int(note[i]), tgt[i], onoff[i]])  # Note comes as string, convert to int
                    # Do annotations
                    annotations.append(inst[i] + " " + dyn[i] + " " + tech[i])
                    # If marked as target, add to target list
                    if tgt[i]:
                        tgts.append(i)

    highlights = []
    for i in range(len(orchestration_slice)):
        highlights.append('')
    for i in range(len(masking_order_idx)):
        try:
            if i == 0:
                highlights[masking_order_idx[i]] = 'red'
                outer_style[masking_order_idx[i]]['backgroundColor'] = 'red'
            if i == 1:
                highlights[masking_order_idx[i]] = 'magenta'
                outer_style[masking_order_idx[i]]['backgroundColor'] = 'magenta'
            if i == 2:
                highlights[masking_order_idx[i]] = 'yellow'
                outer_style[masking_order_idx[i]]['backgroundColor'] = 'yellow'
        except:
            pass

    note, annotations, tgts, highlights, srt_idx = sort_for_vexflow.sort_notes(note, annotations, tgts, highlights)
    notes = [pretty_midi.note_number_to_name(int(i)) for i in note]  # Change to note names
    notes = [i.lower() for i in notes]
    return {"notes":notes, "instruments":annotations, "target":tgts, "highlights":highlights}