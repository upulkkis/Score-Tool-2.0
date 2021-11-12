import numpy as np
from scipy.spatial.distance import euclidean
import heapq

def do_the_search(orchestra, sources_list, search_source, search_method, search_iterations, include_inst, include_tech, include_dyn, include_notes, overlap):

    min_peaks_to_find=15
    smallest = 10000
    match = ''
    remains = []
    percent_match = 0
    match_peaks = []
    def note2Freq(note):
        a = 440 #frequency of A (coomon value is 440Hz)
        distFromA=note-69 #distance from a1
        return a * (2 ** (distFromA / 12.))

    def nearest_index(value, list):
        index = (np.abs(list - value)).argmin()
        return index

    def peak_dist(source_list, target_list, overlap):
        #print(source_list)
        #print(target_list)

        dist_vect = []
        empty = True
        if len(source_list[0]) <= len(target_list[0]):
            length = len(source_list[0])
        else:
            length = len(target_list[0])
        for i in range(length):
            if source_list[0][i] < max(target_list[0]):
                nearest_ind = nearest_index(source_list[0][i], target_list[0])
                dist_vect.append(euclidean([source_list[0][i], source_list[1][i]],
                                           [target_list[0][nearest_ind], target_list[1][nearest_ind]]))
                empty = False
        if empty or len(dist_vect) < overlap:
            return 100000
        return sum(dist_vect)

    def n_closest(source_list, target_list, overlap):

        def n_lowest(list, n):
            return heapq.nsmallest(n, list)

        def n_highest_index(list, n):
            return heapq.nlargest(n, range(len(list)), key=list.__getitem__)
        dist_vect = []

        if len(source_list[0]) <= len(target_list[0]):
            length = len(source_list[0])
        else:
            length = len(target_list[0])
        if length<overlap:
            overlap=length

        indices = n_highest_index(source_list[1], overlap)

        for i in indices:
            nearest_ind = nearest_index(source_list[0][i], target_list[0])
            dist_vect.append(euclidean([source_list[0][i], source_list[1][i]],
                                       [target_list[0][nearest_ind], target_list[1][nearest_ind]]))
        return sum(dist_vect)

    def n_match(source_list, target_list, overlap):

        def n_lowest(list, n):
            return heapq.nsmallest(n, list)

        def n_highest_index(list, n):
            return heapq.nlargest(n, range(len(list)), key=list.__getitem__)
        dist_vect = []

        if len(source_list[0]) <= len(target_list[0]):
            length = len(source_list[0])
        else:
            length = len(target_list[0])
        if length<overlap:
            overlap=length

        indices = n_highest_index(target_list[1], overlap)

        for i in indices:
            nearest_ind = nearest_index(target_list[0][i], source_list[0])
            dist_vect.append(euclidean([target_list[0][i], target_list[1][i]],
                                       [source_list[0][nearest_ind], source_list[1][nearest_ind]]))
        return sum(dist_vect)

    def matching_spectra(source_list, target_list, overlap):
        dist_vect = []
        empty = True
        if len(source_list[0]) <= len(target_list[0]):
            length = len(source_list[0])
        else:
            length = len(target_list[0])
        if length<overlap:
            overlap=length
        for i in range(overlap):
            dist_vect.append(euclidean([source_list[0][i], source_list[1][i]],[target_list[0][i], target_list[1][i]] ))
        return sum(dist_vect)
    def seek_data(orchestra, source, feature, overlap):
        smallest = 1000000
        match = ''
        remains = []
        percent_match = 0
        match_peaks = []
        for inst in orchestra:
            if inst not in sources_list and inst in include_inst:
            #if inst not in exclude_inst:
                for tech in orchestra[inst]:
                    if tech in include_tech:
                        for dyn in orchestra[inst][tech]:
                            if dyn in include_dyn:
                                for note in orchestra[inst][tech][dyn]:
                                    if note in include_notes:
                                        try:
                                            feat = orchestra[inst][tech][dyn][note]['masking_curve']
                                            dist1 = euclidean(feat, source[0])

                                            feat = orchestra[inst][tech][dyn][note]['centroid']
                                            dist2 = abs(feat - source[1])

                                            feat = orchestra[inst][tech][dyn][note]['mfcc']
                                            dist3 = euclidean(feat, source[2])

                                            feat = orchestra[inst][tech][dyn][note]['peaks']
                                            # dist4 = peak_dist(source[3], feat, overlap)
                                            dist4 = n_closest(source[3], feat, overlap)

                                            dist5 = n_match(source[3], feat, overlap)
                                            #dist5 = n_closest(source[3], feat, overlap)

                                            feat = np.array([dist1, dist2, dist3, dist4, dist5])

                                            dist = sum(feat[feature])
                                            # dist = mean([dist1, dist3, dist4])
                                            if dist < smallest:
                                                match_peaks = feat
                                                print('{}, {}, {}, {} DIST: {}'.format(inst, tech, dyn, note, dist))
                                                smallest = dist
                                                match = '{},{},{},{}'.format(inst, tech, dyn, note)
                                        except:
                                            print('Error in: ' + inst)
        return match, percent_match, match_peaks, remains
    print(search_method)
    #print(search_source[1])
    match, percent_match, match_peaks, remains = seek_data(orchestra, search_source, search_method, overlap)

    return match

