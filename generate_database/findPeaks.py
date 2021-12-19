from scipy.signal import find_peaks
import math
import numpy as np

min_peaks_to_find=15

def note2Freq(note):
    a = 440 #frequency of A (coomon value is 440Hz)
    distFromA=note-69 #distance from a1
    return a * (2 ** (distFromA / 12.))

def peaks(fftX, noteNumber):
    noteFreq = note2Freq(noteNumber)
    thresA = np.linspace(20,20,num=len(fftX[0:math.floor(noteFreq)]))
    thresB = np.linspace(20, -20, num=len(fftX[math.floor(noteFreq):6000]))
    thresC = np.linspace(-20, 60, num=len(fftX[6000:]))
    thres = np.concatenate((thresA, thresB, thresC), axis=None)
    peakIdx=[]
    while len(peakIdx)<=min_peaks_to_find:
        noteNumber = noteNumber-1
        noteFreq = note2Freq(noteNumber)
        peakIdx, _ = find_peaks(fftX, distance=noteFreq, prominence=math.floor(noteFreq/4), height=thres)
        p=len(peakIdx)
        if noteNumber<10:
            break
    return peakIdx, np.round(fftX[peakIdx], 2)