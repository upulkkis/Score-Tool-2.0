import numpy as np
from scipy.fftpack import dct

def cutSample(data):
    if len(np.shape(data))==2:
        data=data[:,0]
    fadeamount = 300
    maxindex = np.argmax(data > 0.01)
    startpos = 1000
    if len(data) > 44100:
        if maxindex > 44100:
            if len(data) > maxindex + (44100):
                data = data[maxindex - startpos:maxindex - startpos + (44100)]
            else:
                data = data[maxindex - startpos:]
        else:
            data = data[0:44100]
    else:
        if maxindex > 44100:
            data = data[maxindex - startpos:]
    # print('data len :'+str(len(data)))
    fade = np.geomspace(1, 2, fadeamount) - 1
    data[0:fadeamount] = data[0:fadeamount] * fade
    data[-fadeamount:] = data[-fadeamount:] * np.flip(fade)
    data = np.concatenate((np.zeros(startpos), data), axis=None)
    return data

def alternate_mfcc(signal, sr=44100):
    def normalize_audio(audio):
        audio = audio / np.max(np.abs(audio))
        return audio


    def freq_to_mel(freq):
        return 2595.0 * np.log10(1.0 + freq / 700.0)

    def met_to_freq(mels):
        return 700.0 * (10.0 ** (mels / 2595.0) - 1.0)

    def get_filter_points(fmin, fmax, mel_filter_num, FFT_size, sample_rate=44100):
        fmin_mel = freq_to_mel(fmin)
        fmax_mel = freq_to_mel(fmax)

        mels = np.linspace(fmin_mel, fmax_mel, num=mel_filter_num + 2)
        freqs = met_to_freq(mels)

        return np.floor((FFT_size + 1) / sample_rate * freqs).astype(int), freqs

    def get_filters(filter_points, FFT_size):
        #filter_length = int(FFT_size / 2 + 1)
        filter_length= int(FFT_size)
        filters = np.zeros((len(filter_points) - 2, filter_length))

        for n in range(len(filter_points) - 2):
            filters[n, filter_points[n]: filter_points[n + 1]] = np.linspace(0, 1,
                                                                             filter_points[n + 1] - filter_points[n])
            filters[n, filter_points[n + 1]: filter_points[n + 2]] = np.linspace(1, 0,
                                                                                 filter_points[n + 2] - filter_points[
                                                                                     n + 1])

        return filters

    #signal = normalize_audio(signal)
    signal = cutSample(signal)
    M=len(signal)
    complexSpectrum = np.fft.fft(signal)[:M // 2 + 1:-1]
    audio_power = np.square(np.abs(complexSpectrum))

    FFT_size = len(audio_power)
    freq_min = 60
    freq_high = 14000# sr / 2
    mel_filter_num = 40

    filter_points, mel_freqs = get_filter_points(freq_min, freq_high, mel_filter_num, FFT_size, sample_rate=44100)

    filters = get_filters(filter_points, FFT_size)

    enorm = 2.0 / (mel_freqs[2:mel_filter_num + 2] - mel_freqs[:mel_filter_num])
    filters *= enorm[:, np.newaxis]

    audio_filtered = np.dot(filters, np.transpose(audio_power))
    audio_log = 10.0 * np.log10(audio_filtered)

    dctSpectrum = dct(audio_log, type=2)

    # Lifter, comment out if not needed
    L = 22  # Lifter coeff
    ncoeff = len(dctSpectrum)
    n = np.arange(ncoeff)
    lift = 1 + (L / 2.) * np.sin(np.pi * n / L)
    dctSpectrum = lift * dctSpectrum

    return dctSpectrum[:12]