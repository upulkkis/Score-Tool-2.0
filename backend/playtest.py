import soundfile as sf
import sounddevice as sd
import resampy
from scipy.signal import resample_poly
import time
instrument_data_path = 'c:/sample_database'
data, sr = sf.read(instrument_data_path + '/{}/{}/{}/{}.wav'.format("piano", "normal", "mf", 60))

def transpose(sample, semitones):
    trans = 2 ** (semitones / 12)
    newdata = resample_poly(sample, sr / 100, int(sr * trans / 100))
    return newdata

def play(nbr):
    sd.play(transpose(data, nbr), sr)
    sd.sleep(500)

play(0)
play(4)
play(7)
play(4)

play(0)
play(4.2)
play(7.2)
play(4.1)