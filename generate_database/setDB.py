import numpy as np
import math
from instrument_Db_Levels import levels
import statistics

def applyDB(x, targetDB):
    Pref = 2e-5  # Reference sound pressure
    # max = np.max(x) # Get the max value (peak level) of the sound file
    root_mean_square = math.sqrt(statistics.mean(x ** 2.))  # RMS of the signal
    dB = 20 * math.log10(root_mean_square/Pref)   ##Get Db level of value
    dBref = 20 * math.log10(0.9/Pref) #Calculate reference for 0.9 amplitude
    adjusted=targetDB+(dBref-86) # Calculate db level according to our reference
    print("adjust to: "+str(targetDB))
    amp_value = Pref*10 ** (adjusted / 20)  # calculate amp value with reference from db
    adj_coeff  = amp_value/root_mean_square#coefficient for adjusting the file amplitude level
    return x*adj_coeff

def setDB (inst, tech, dyn, note, inst_range, sound):
    if inst in levels.keys():
        if tech in levels[inst].keys():
            if dyn in levels[inst][tech].keys():
                pivot_point = levels[inst][tech][dyn][0] # Set the pivot point, for example for different registers
                len_under_pivot = len([n for n in inst_range if n <= pivot_point])  # Notes under pivot
                len_above_pivot = len(inst_range) - len_under_pivot  # Notes above pivot
                low_reg_decibels = np.linspace(levels[inst][tech][dyn][1] , levels[inst][tech][dyn][2] , len_under_pivot)  # Under pivot db raise linearly
                high_reg_decibels = np.geomspace(levels[inst][tech][dyn][2] , levels[inst][tech][dyn][3] , len_above_pivot)  # Above pivot db raise exponentially
                db_list = np.concatenate([low_reg_decibels, high_reg_decibels])  # Concatenate db levels
                idx = inst_range.index(note)
                desired_Db = db_list[idx]
                sound = applyDB(sound, desired_Db)
    return sound

