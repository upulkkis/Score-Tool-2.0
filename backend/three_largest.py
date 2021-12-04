import numpy as np
import heapq
def nearest_index(value, list):
    index = (np.abs(list - value)).argmin()
    return index

def n_lowest(list, n): return np.partition(list, n-1)[:n]

def n_largest_idx(list, n): heapq.nlargest(n, range(len(list)), key=list.__getitem__)