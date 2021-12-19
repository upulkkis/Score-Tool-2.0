import pickle
import numpy as np

with open('orchestra.pickle', 'rb') as handle:
    orchestra = pickle.load(handle)

with open('no_data_orchestra_old.pickle', 'rb') as handle:
    old_orchestra = pickle.load(handle)

orchestra['timp'] = old_orchestra['timp']

o=0
for item in orchestra.items():
    instr=item[0]
    for ite in item[1].values():
        for it in ite.values():
            for i in it.values():
                if len(i['masking_curve']) == 106:
                    o+=1
                #for val in i.values():
                #    print(val)
                    #if len(val['masking_curve']) == 106:
                    #    o+=1

print(o)

with open('orchestra.pickle', 'wb') as fil:
    # Pickle the 'data' dictionary using the highest protocol available.
    pickle.dump(orchestra, fil, pickle.HIGHEST_PROTOCOL)