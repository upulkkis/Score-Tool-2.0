import terhardt

def spectral_prominence(peaks):
    frequency_list = peaks[0]
    amplitude_list = peaks[1]
    # calculate A-weight corrections for the orchestration array
    hearing_threshold_adjustment = [terhardt.hear_thres(ind_freq /1000) for ind_freq in frequency_list]
    # Do the a-weighting
    adjusted_spl_values = [0 if element1 - element2 < 0 else element1 - element2 for (element1, element2) in zip(amplitude_list, hearing_threshold_adjustment)]
    # Calculate Terhardt's pitch weight array
    orchestration_pitch_weights = terhardt.pitch_weights_array(peaks)
    weighted_spl_values = [el1 * el2 for (el1, el2) in zip (adjusted_spl_values, orchestration_pitch_weights)]
    # Calculate terhardt's spectral dominance
    spectral_dominance = terhardt.dbsum(terhardt.peak_weights(frequency_list, weighted_spl_values))
    return spectral_dominance