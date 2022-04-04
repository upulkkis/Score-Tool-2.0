import virtual_pitch
import pickle
import numpy as np

with open('../no_data_orchestra.pickle', 'rb') as handle:
    orchestra = pickle.load(handle)

test_peaks1 = orchestra['oboe']['normal']['p'][64]['peaks']
test_peaks2 = orchestra['trumpet']['normal']['p'][65]['peaks']
test_peaks3 = orchestra['clarinet']['normal']['p'][66]['peaks']
test_peaks = [ test_peaks1[0]+test_peaks2[0]+test_peaks3[0], np.concatenate([test_peaks1[1], test_peaks2[1], test_peaks3[1]]) ]
#print(test_peaks)

#print(virtual_pitch.ptp2svp(test_peaks[0], test_peaks[1]))

#print(virtual_pitch.ptp2svp([454, 563, 765], [65, 74, 68]))
print(virtual_pitch.ptp2svp([150,300,450,600],[70,70,70,70]))