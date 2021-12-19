import constants
import math
import statistics


def normalize_audio_file(x, set_dB=110):
    Pref = constants.Pref  # load reference sound pressure
    amp_value = Pref * 10 ** (set_dB / 20)  # calculate amp value with reference from db
    # root_mean_square = math.sqrt(statistics.mean(x ** 2.))  # RMS of the signal
    # normalization = amp_value / root_mean_square  # normalization coefficient
    return x * amp_value  # return normalized input
