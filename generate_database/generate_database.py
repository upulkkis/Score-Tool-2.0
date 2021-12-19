import glob
#import scipy.io.wavfile as readWav
import numpy as np
#import sounddevice as sd
import librosa
#import normalize_sound_file
import maskingCurve
import constants
#import findPeaks
import MFCC
#import lpc_coeffs
import pickle
#import matplotlib.pyplot as plt
from setDB import setDB
from collections.abc import MutableMapping

path = './'
# dynamics_list = np.loadtxt("orch_dynyt.txt", delimiter=' ', dtype='U20,int, int, int', unpack=True) #Read dynamics as string, int, int, int
fs= constants.fs
folders = [f for f in glob.glob(path + "**/**/**/**")]
print(len(folders))
print(folders)
test_range_start=4560
test_range_end=len(folders)
orchestra = dict() #Create empty dictionary for orchestra
with open('adj_orchestra.pickle', 'rb') as handle:
    orchestra = pickle.load(handle)

with open("testrun.log", "w") as file_object:
    file_object.write('Log begin!\n')
#print(orchestra)
#Cut data to 1 sec chunk and apply hanning-window

def cutSample(data):
    maxindex = np.argmax(data)
    if len(data)>44100:
        if maxindex>1000:
            data = data[maxindex-1000:maxindex-1000+44100]
        else :
            data = data[0:44100]
    fade = np.geomspace(1, 2, 1000)-1
    data[0:1000]=data[0:1000]*fade
    data[-1000:]=data[-1000:]*np.flip(fade)

    fs=44100
    if len(data)<fs:
        data=np.concatenate((data, np.zeros(fs-len(data))), axis=None)
    else:
        data=data[0:fs]
    return data

def nested_update(d, v):
    for key in v:
        if key in d and isinstance(d[key], MutableMapping) and isinstance(v[key], MutableMapping):
            nested_update(d[key], v[key])
        else:
            d[key] = v[key]

def add_to_database (parameters, noteNumber, data, orchestra, nbr):
    instrument = parameters[-4]
    tech = parameters[-3]
    dyn = parameters[-2]
    #note = parameters[5]
    #dyn_db = assignDynamics.assign_dynamics(dyn, instrument, dynamics_list)  # function parameters: dynamics, instrument name, dynamics list
    data = cutSample(data)

    lst = [f for f in glob.glob(path + instrument+"/"+tech+"/"+dyn+"/**")]
    inst_range = [int(fil.split("\\")[-1].split(".")[0]) for fil in lst]

    M = len(data) #Length of data (should be 44100)
    spectrum = np.fft.fft(data, axis=0)[:M // 2 + 1:-1] #Calculate the fft
    #print("spectrum calculated")
    S = np.abs(spectrum) #Get rid of complex numbers
    S = 20 * np.log10(S) #dB values of data
    print('maksimi ennen: '+str(np.max(S)))

    data = setDB(instrument, tech, dyn, noteNumber, inst_range, data)
    # data = normalize_sound_file.normalize_audio_file(data) #, dyn_db) #Set sound file level according to the loaded text file
    #print("data normalized")
    #mfcc_data=librosa.feature.mfcc(y=data,sr=fs,n_mfcc=12,win_length=fs)
    M = len(data) #Length of data (should be 44100)
    spectrum = np.fft.fft(data, axis=0)[:M // 2 + 1:-1] #Calculate the fft
    #print("spectrum calculated")
    S = np.abs(spectrum) #Get rid of complex numbers
    S = 20 * np.log10(S) #dB values of data
    print('maksimi jälkeen: '+str(np.max(S)))
    print("\n")
    #masking_freq, masking_threshold, peaks = maskingCurve.maskingCurve(S, noteNumber)  # Calculate the masking curve
    try:
        masking_freq, masking_threshold, peaks = maskingCurve.maskingCurve(S, noteNumber) #Calculate the masking curve
    except Exception as e:
        print("Masking calculation fail, using flat masking curve")
        print(e)
        masking_freq = constants.threshold[:, 0]
        masking_threshold = np.ones(107)
        with open("testrun.log", "a") as file_object:
            file_object.write('ERROR!\n')

            file_object.write('instrumnet: ' + str(instrument) + " " + tech+ " "+dyn + str(noteNumber))
            file_object.write('index number: ' + str(nbr))
            file_object.write('\n')
        with open("error_numbers.txt", "a") as file_object:
            file_object.write(str(nbr)+", ")
        peaks=[[0], [0]]
    #print("masking calculated")
    mfcc_data, centroid = MFCC.custom_mfcc(data) #Calculate mfcc and spectral centroid
    #print("mfcc calculated")
    # LpcLocs, LpcFreqs = lpc_coeffs.lpc_coeffs(data) #calculate LPC-frequency response
    #print("lpc calculated")
    #Add everything to database (except fft spectrum):
    #nested_update(orchestra, {instrument:{tech:{dyn:{noteNumber:{"data":data, "masking_curve":masking_threshold, "masking_locs":masking_freq, "lpc_curve":LpcFreqs, "lpc_locs":LpcLocs, "mfcc":mfcc_data, "centroid":centroid}}}}})
    nested_update(orchestra, {instrument:{tech:{dyn:{noteNumber:{"masking_curve":masking_threshold, "mfcc":mfcc_data, "centroid":centroid, "peaks":peaks}}}}})
    return orchestra

number = 127

missing =[1831, 1844, 1856, 1871, 1878, 1887, 1890, 1911, 1926, 1941, 1954, 1957, 1967, 1993, 3820, 3820, 3820, 3820, 3820, 3820, 3820, 3820, 9096, 9141]
missing=[1831, 9096, 9141]
missing=[1831]
for f in range(test_range_start, test_range_end):
    names = folders[f].split('\\')
    instrument = names[-4]
    tech = names[-3]
    dyn = names[-2]
    note = names[-1]
    number = int(note.split('.wav')[0])

    # print(len(orchestra[instrument][tech][dyn][number]['masking_curve']))
    #oldNumber = number
    print('Doing number: '+str(f)+' of '+str(test_range_end)+': '+folders[f])

    number = int(names[-1].split('.wav')[0])

    data, rate = librosa.load(folders[f], sr=44100)

    orchestra = add_to_database(names, number, data, orchestra, f)

    # data, rate = librosa.load(f, sr=44100)
    #sd.play(data, rate)
    #status = sd.wait()  # Wait until file is done playing
    # print(len(data))
    del number
    del data
    if f % 500 == 0:
        file = "orchestra%s" % f
        with open(file, 'wb') as fil:
            # Pickle the 'data' dictionary using the highest protocol available.
            pickle.dump(orchestra, fil, pickle.HIGHEST_PROTOCOL)


file = "orchestra%s" % f
file = "adj_orchestra.pickle"
with open(file, 'wb') as fil:
    # Pickle the 'data' dictionary using the highest protocol available.
    pickle.dump(orchestra, fil, pickle.HIGHEST_PROTOCOL)