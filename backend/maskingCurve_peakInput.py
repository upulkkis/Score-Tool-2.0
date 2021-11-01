import numpy as np
import helpers.constants as constants
import findPeaks
import math
from scipy.signal import find_peaks

def maskingCurve (fftX, peaklist):
    INDEX = 0
    SPL = 1
    MIN_POWER = -200
    TH = constants.threshold #106 Masking bands
    N = len(TH[:,0])-1
    LTq = TH[:, 2]

    #locs, peaks = findPeaks.peaks(fftX, noteNumber)
    locs = peaklist[0]
    peaks = peaklist[1]

    first_divider = len(fftX) #Set to 22050
    divider = 22048/first_divider
    #frequencies to sample indecies
    #print(TH[:, INDEX])
    for i in range(N):
        TH[i, INDEX] = round(TH[i, INDEX]) # / (divider) #ADD THIS TO ALLOW DIFFERENT SIZE FFT's
    #print(TH[:, INDEX])

    #print(TH[N-1,INDEX])
    Map=np.ones(len(fftX))
    for j in range(int(TH[0,INDEX])): # CHANGE 1 to 0
        Map[j]=0
    for j in range(int(TH[N, INDEX]), len(fftX)): #Change N-1 to N
        Map[j]=N
    for i in range(1,N-2): #Change N-2 to N-1
        for j in range(int(TH[i, INDEX])-1,int(TH[i+1, INDEX])-2):
            #print(i)
            if j<len(Map):
                Map[j]=i
    #print(Map)
    BARK=1
    Peak_list = np.array([locs,peaks])
    Peak_list = np.transpose(Peak_list)
    LTt = np.zeros([len(Peak_list[:,0]), len(TH[:,0])]) + MIN_POWER
    for i in range (len(TH[:,0])):
        zi = TH[i, BARK] #Critical band rate of the frequency considered
        for k in range (len(Peak_list[:,INDEX])):
            j = Peak_list[k, INDEX]  # // int(22048/len(fftX)) #ADD THIS TO ALLOW CONVERSION OF DIFFERENT SIZE  FFT's
            zj = TH[int(Map[int(j)]), BARK] #Critical band rate of the masker #Tässä error crotaleksen kanssa 1218 IndexError: index 106 is out of bounds for axis 0 with size 106
            dz = zi-zj #Distance in Bark to the masker
            #print(int(Map[int(j)]))
            #print(TH[105, BARK])
            if dz>=-3 and dz<8:
                avtm = -1.525 - 0.275 * zj -4.5 #Masking index
                #Masking function:
                if dz>=-3 and dz<-1:
                    vf = 17 * (dz + 1) - (0.4 * int(fftX[int(j)]) + 6)
                elif dz>=-1 and dz<0:
                    vf = (0.4 * int(fftX[int(j)]) + 6) * dz
                elif dz>=0 and dz<1:
                    vf = -17 * dz
                elif dz>=1 and dz<8:
                    vf = - (dz - 1) * (17 - 0.15 * int(fftX[int(j)])) - 17
                LTt[k, i] = Peak_list[k, SPL] + avtm + vf

    L = len(LTt[0,:])

    LTq=np.zeros(len(TH[:,0]))-20

    for i in range(L):
        temp = 10**(LTq[i]/10.) #Threshold in quiet

        if LTt.size != 0:
            for j in range(len(LTt[:,0])):
                temp = temp + 10**(LTt[j, i] / 10.)

        LTq[i] = 10 * math.log10(temp)

    masking_freq = TH[:,INDEX]
    masking_threshold = LTq
    #print(masking_threshold)
    #masking_threshold=np.vstack([[0, masking_threshold[0,1]], masking_threshold])
    return np.round(masking_threshold, 2)





