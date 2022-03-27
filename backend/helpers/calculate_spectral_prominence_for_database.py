import pickle
import spectral_dominance

with open('../no_data_orchestra.pickle', 'rb') as handle:
    orchestra = pickle.load(handle)

for inst in orchestra:
    for tech in orchestra[inst]:
        for dyn in orchestra[inst][tech]:
            for note in orchestra[inst][tech][dyn]:
                terhardt_dominance = spectral_dominance.spectral_prominence(orchestra[inst][tech][dyn][note]['peaks'])
                print(inst)
                print(spectral_dominance.spectral_prominence(orchestra[inst][tech][dyn][note]['peaks']))
                orchestra[inst][tech][dyn][note]['terhardt_dominance'] = terhardt_dominance


with open('./no_data_orchestra_terhardt.pickle', 'wb') as handle:
    pickle.dump(orchestra, handle, protocol=pickle.HIGHEST_PROTOCOL)