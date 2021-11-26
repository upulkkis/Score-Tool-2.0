import numpy as np

def fake_spec(peaks):
    map = np.ones(22048)
    map[peaks1[0]] = peaks1[1]
    map[peaks1[0]-1] = peaks1[1]/1.5
    map[peaks1[0]-2] = peaks1[1]/2
    map[peaks1[0]-3] = peaks1[1]/4
    map[peaks1[0]+1] = peaks1[1]/1.5
    map[peaks1[0]+2] = peaks1[1]/2
    map[peaks1[0]+3] = peaks1[1]/4
    return map