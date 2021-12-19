import librosa
import constants


def custom_mfcc(data):
    fs= constants.fs
    mfcc_data = librosa.feature.mfcc(y=data, sr=fs, n_mfcc=12, n_fft=len(data), hop_length=len(data)+2)[:, 0]
    centroid = librosa.feature.spectral_centroid(y=data, sr=fs, n_fft=len(data), hop_length=len(data)+2)[:, 0]
    return mfcc_data, centroid[0]