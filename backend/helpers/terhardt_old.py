from math import log10, exp, atan
from constants import threshold
import pickle
import numpy as np

with open('../no_data_orchestra.pickle', 'rb') as handle:
    orchestra = pickle.load(handle)

# print(orchestra['flute']['normal']['mf'][60]['peaks'])

pks = orchestra['horn']['normal']['p'][60]['peaks']
pks = orchestra['double_bass']['normal']['f'][38]['peaks']
#pks = orchestra['flute']['normal']['p'][85]['peaks']

# tonal_components = [54, 56, 45, 27, 13, 21, 10, 5, 3]
# component_frequencies = [200, 400, 600, 800, 1000, 1200, 1400, 1600, 1800]

# tonal_components = [60, 50, 40]
# component_frequencies = [400, 800, 1200]

def pitch_weights(pks):

    tonal_components = pks[1] # Extract the SPL values of peaks
    component_frequencies = pks[0] # Frequencies of SPL values

    #tonal_components = [component*10 for component in tonal_components]
    component_frequencies = [component/1000 for component in component_frequencies] # Convert frequencies to kHz

    # From Terhardts paper, convert freqs to barks
    def freq2bark(freq):
        return 13*atan(0.76*freq) + 3.5*atan( pow((freq/7.5),2) )

    # From Terhardts paper, excitation correction of single harmonic
    def excitation_Lev(Lv, Fv, Fu):
        s = 27
        if(Fu<=Fv):
            s = -24.0 - (0.23 / Fv) + (0.2 * Lv)
        # print (s*(freq2bark(Fv)-freq2bark(Fu)))
        return Lv - s*(freq2bark(Fu)-freq2bark(Fv)) # CAUTION!!! Fu and Fv on the other way around than in Terhardt's paper!!!

    # print("Excitation lev:")
    # print(excitation_Lev(60, 0.40, 0.200))

    # From Terhardts paper, Hearing threshold in the function of freq
    def hear_thres(frequency):
        return 3.64*pow(frequency, -0.8)-6.5*exp(-0.6*pow(frequency-3.3,2))+pow(10, -3)*pow(frequency, 4)

    #From Terhardts paper, find the overtones that are important for the pitch detection
    def lx(component_list, freq_list, component_number):
        db_sum = 0
        for i in range(len(component_list)):
            if i != component_number:
                #print("LEV:")
                #print(excitation_Lev(component_list[i], freq_list[i], freq_list[component_number]))
                db_sum = db_sum+pow(10, excitation_Lev(component_list[i], freq_list[i], freq_list[component_number])/20)
        db_sum = pow(db_sum, 2)
        #print("Values:")
        #print(component_list[component_number])
        return component_list[component_number] - (10*log10((db_sum) + pow(10, (hear_thres(freq_list[component_number])/10))) )

    #print(tonal_components)
    #print(component_frequencies)

    # print(lx(tonal_components, component_frequencies, 0))

    # for i in range(len(component_frequencies)):
    #    pass
    #    print(lx(tonal_components, component_frequencies, i))

    # Calculate weights of the harmonic components according to Terhardts formula
    weights = []
    for i in range(len(component_frequencies)):
        if(lx(tonal_components, component_frequencies, i)<=0):
            weights.append(0)
        else:
            weights.append( (1-exp(-lx(tonal_components, component_frequencies, i)/15)) * (1+(0.07*pow(pow(( ((component_frequencies[i])/0.7) - (0.7/(component_frequencies[i])) ), 2), -0.5)) ) )

    # Normalize weights between 0 and 1:
    # weights = [i / (max(weights)) for i in weights]

    # Calculate the sum of all weights (not in terhardts paper):
    #breturn weights
    sum_of_weights = np.sum(weights)
    # Calculate the percentage of importance for all overtones (not in terhardts paper):
    if sum_of_weights >0:
        percentage_of_importance = [100 * w / sum_of_weights for w in weights]
    else:
        return weights
    return percentage_of_importance

    #print(weights)
    # print(np.argsort(np.argsort(weights)))
    # for i in range(len(tonal_components)):
    #    print(lx(tonal_components, i))

peak_weights = pitch_weights(pks)
print(peak_weights)

