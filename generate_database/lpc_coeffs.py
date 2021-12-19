import librosa
import numpy as np
import constants
from scipy.signal import freqz

def lpc_coeffs(myData):
    MyFs = constants.fs
    MyCoeffs = 512
    Lpcs = librosa.lpc(myData, MyCoeffs)
    MyLocs, MyFreqs = freqz(1, Lpcs, worN=MyCoeffs, fs=MyFs)
    MyFreqs = 20 * np.log10(np.abs(MyFreqs))
    return MyLocs, MyFreqs
