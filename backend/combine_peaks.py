import numpy as np

def combine_peaks(peaklist1, peaklist2):
    if np.shape(peaklist1)[0] == 0:
        return peaklist2
    if np.shape(peaklist2)[0] == 0:
        return peaklist1
    peaklist1 = np.transpose(peaklist1)
    peaklist2 = np.transpose(peaklist2)
    if len(np.shape(peaklist1)) == 1:
        peaklist1=[peaklist1]
    if len(np.shape(peaklist2)) == 1:
        peaklist2=[peaklist2]
    catenated = np.append(peaklist1, peaklist2, axis=0)
    sort_tuple = sorted(dict(catenated).items())
    list_of_lists = [list(elem) for elem in sort_tuple]
    list_of_lists = np.array(list_of_lists)
    return np.transpose(list_of_lists)