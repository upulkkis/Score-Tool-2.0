import dash_daq as daq
import dash_html_components as html
import dash_core_components as dcc
import dash_admin_components as dac
import dash_bootstrap_components as dbc
from dash.dependencies import Input, Output, State, ALL
from dash.exceptions import PreventUpdate
import dash
import plotly.graph_objs as go
import numpy as np
import math
import combine_peaks
import get_help
import heapq
import io
import soundfile as sf
import base64
import pretty_midi
import helpers.constants as constants
#from constants import instrument_data_path
from scipy.signal import convolve
from scipy.signal import find_peaks
from helpers import hertz_to_microtone
from helpers import chord_db_to_color
import sort_for_vexflow
from setDB import setDB
import alternate_mfcc
import maskingCurve_peakInput
import maskingCurve

import get_fft
import make_slice_notation
instrument_data_path = constants.instrument_data_path
plot_color='black'
plot_color="#fffef0"
paper_color=  'rgba(0,0,0,.2)'
paper_color="#fffef0"

def get_and_cut_sample(inst, inst_range):
    data, sr = sf.read(instrument_data_path+"/{}/{}/{}/{}.wav".format(inst[0], inst[1], inst[2], inst[3]))
    if len(np.shape(data))==2:
        data=data[:,0]
    fadeamount = 300
    maxindex = np.argmax(data > 0.01)
    startpos = 1000
    # data=data[:44100]
    #print('data len :' + str(len(data)))
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
        else:
            data = np.concatenate((data, np.zeros(44100-len(data))), axis=None)

    # print('data len :'+str(len(data)))
    fade = np.geomspace(1, 2, fadeamount) - 1
    data[0:fadeamount] = data[0:fadeamount] * fade
    data[-fadeamount:] = data[-fadeamount:] * np.flip(fade)

    # Omit set DB for now
    # data = setDB(inst[0], inst[1], inst[2], inst[3], inst_range, data)

    data = np.concatenate((np.zeros(startpos), data), axis=None)
    return data

def spectral_centroid(x, samplerate=44100):
    length = len(x)
    magnitudes = np.abs(np.fft.fft(x))[:length//2+1] # magnitudes of positive frequencies
    freqs = np.abs(np.fft.fftfreq(length, 1.0/samplerate)[:length//2+1]) # positive frequencies
    return np.sum(magnitudes*freqs) / np.sum(magnitudes) # return weighted mean

def get_slice(lista, orchestra, custom_id='', initial_chord='', multisclice=False):
    dummy_fft_size = 22048
    # list_copy = lista.copy()
    # def help(topic):
    #    return html.Div(html.Details([html.Summary('?', className='button'), html.Div(get_help.help(topic))]))

    def target_and_orchestration(list_of_instruments):
        # list_of_instruments: instrument, technique, dynamics, note, target, on/off
        S = np.ones(dummy_fft_size) + 70
        orchestration_sum=np.zeros(44100)
        target_sum=np.zeros(44100)
        peaks_o = []
        peaks_t = []
        masking_curves_o = []
        masking_curves_t = []
        orch_mfcc_array=np.array(np.zeros(12))
        targ_mfcc_array = np.array(np.zeros(12))
        min_orch_note=120
        min_target_note=120
        t_cents=[]
        o_cents=[]
        inst_idx_number=0
        orch_sample=[]
        target_sample=[]
        orchestration_indexes=[]
        original_osmd_indexes=[]
        orchestration_instrument_names=[]
        for instrument in list_of_instruments:
            #print(instrument)
            if instrument[5]==1: #If instrument is set "on"
                if instrument[4]==0: #if orchestration
                    #try:
                        #odata=orchestra[instrument[0]][instrument[1]][instrument[2]][instrument[3]]['data']
                        #orchestration_sum = orchestration_sum+orchestra[instrument[0]][instrument[1]][instrument[2]][instrument[3]]['data']
                        orch_mfcc_array=np.vstack([orch_mfcc_array, orchestra[instrument[0]][instrument[1]][instrument[2]][instrument[3]]['mfcc']])
                        if len(orch_sample)==0:
                            orch_sample=get_and_cut_sample(instrument, list(orchestra[instrument[0]][instrument[1]][instrument[2]].keys()))
                        else:
                            orch_sample=orch_sample+get_and_cut_sample(instrument, list(orchestra[instrument[0]][instrument[1]][instrument[2]].keys()))
                        o_cents.append(orchestra[instrument[0]][instrument[1]][instrument[2]][instrument[3]]['centroid'])
                        pks = orchestra[instrument[0]][instrument[1]][instrument[2]][instrument[3]]['peaks']
                        peaks_o = combine_peaks.combine_peaks(peaks_o, [pks[0], pks[1]])#orchestra[instrument[0]][instrument[1]][instrument[2]][instrument[3]]['peaks'])
                        masking_curves_o.append(maskingCurve_peakInput.maskingCurve(S, pks))
                        #Make a list of orchestration instrument indexes for masking calculation:
                        orchestration_indexes.append(inst_idx_number)
                        original_osmd_indexes.append(instrument[-1])
                        orchestration_instrument_names.append(instrument[0])

                        if instrument[3]<min_orch_note:
                             min_orch_note=instrument[3]
                    #except Exception as e:
                    #    print("Out of range orchestration notes found!")
                    #    print(e)
                if instrument[4]: #if target
                    try:
                        #tdata=orchestra[instrument[0]][instrument[1]][instrument[2]][instrument[3]]['data']
                        #target_sum = target_sum+orchestra[instrument[0]][instrument[1]][instrument[2]][instrument[3]]['data']
                        t_cents.append(orchestra[instrument[0]][instrument[1]][instrument[2]][instrument[3]]['centroid'])
                        targ_mfcc_array = np.vstack([targ_mfcc_array,orchestra[instrument[0]][instrument[1]][instrument[2]][instrument[3]]['mfcc']])
                        if len(target_sample) == 0:
                            target_sample = get_and_cut_sample(instrument, list(orchestra[instrument[0]][instrument[1]][instrument[2]].keys()))
                        else:
                            target_sample = target_sample + get_and_cut_sample(instrument, list(orchestra[instrument[0]][instrument[1]][instrument[2]].keys()))
                        pks = orchestra[instrument[0]][instrument[1]][instrument[2]][instrument[3]]['peaks']
                        peaks_t = combine_peaks.combine_peaks(peaks_t, [pks[0], pks[1]])#orchestra[instrument[0]][instrument[1]][instrument[2]][instrument[3]]['peaks'])
                        masking_curves_t.append(maskingCurve_peakInput.maskingCurve(S, pks))
                        if instrument[3]<min_target_note:
                             min_target_note=instrument[3]
                    except:
                        print("Out of range target notes found!")
            inst_idx_number += 1
        sums=[orchestration_sum+70, target_sum+70]
        #print(masking_curves_o)
        tgt=True
        if peaks_t == []:tgt=False
        orch_mfcc_array=np.delete(orch_mfcc_array, 0, axis=0) #Poistetaan nollat alusta häiritsemästä
        # orch_mfcc= np.mean(orch_mfcc_array, axis=0)
        if len(orch_sample)>0:
            orch_mfcc= alternate_mfcc.alternate_mfcc(orch_sample)
        o_cents = spectral_centroid(orch_sample)#np.mean(o_cents)
        min_notes = [min_orch_note, 0]
        targ_mfcc=[]
        if tgt:
            min_notes=[min_orch_note, min_target_note]
            targ_mfcc_array=np.delete(targ_mfcc_array, 0, axis=0)
            # targ_mfcc=np.mean(targ_mfcc_array, axis=0)
            targ_mfcc = alternate_mfcc.alternate_mfcc(target_sample)
            t_cents = spectral_centroid(target_sample)#np.mean(t_cents)

        return sums, min_notes, orch_mfcc_array, [peaks_o, peaks_t], [orch_mfcc, targ_mfcc], [o_cents, t_cents], [masking_curves_o, masking_curves_t], orchestration_indexes, orchestration_instrument_names, original_osmd_indexes



    def get_features(data, peaks, min_note, mfccs, cents):
            result=dict()
            S=np.ones(dummy_fft_size)+70
            result["spectrum"]=S
            try:
                masking_threshold = maskingCurve_peakInput.maskingCurve(S, peaks) #Calculate the masking curve
            except:
                print("Masking calculation fail, using flat masking curve")
                masking_threshold = np.ones(106)
            result['masking_locs']= constants.threshold[:, 0]
            result['masking_threshold']=masking_threshold
            #print("masking calculated")
            #mfcc_data, centroid = MFCC.custom_mfcc(data) #Calculate mfcc and spectral centroid
            result['mfcc']= mfccs#mfcc_data
            result['centroid']= cents#centroid
            #print("mfcc calculated")
            #LpcLocs, LpcFreqs = lpc_coeffs.lpc_coeffs(data) #calculate LPC-frequency response
            #result['lpc_locs']=LpcLocs
            #result['lpc_threshold']=LpcFreqs
            #locs, peaks = findPeaks.peaks(S, min_note)
            result['peak_locs']=peaks[0]
            result['peaks']=peaks[1]
            #print("lpc calculated")
            return result

    sums, min_notes, orch_mfcc_array, peaks, mean_mffcs, mean_cents, masking_lists, orchestration_indexes, orchestration_instrument_names, original_osmd_indexes = target_and_orchestration(lista) #Returns sums list with 2 elements: [orchestration target], peaks [orch, tar]
    #print(sums)
    #print(masking_lists[0])
    #print(masking_lists[1])

    orchestration = get_features(sums[0], peaks[0], min_notes[0], mean_mffcs[0], mean_cents[0])
    tgt=True
    if mean_cents[1] == []: tgt = False
    if tgt:
        target = get_features(sums[1], peaks[1], min_notes[1], mean_mffcs[1], mean_cents[1])
    else:
        result = dict()
        result['masking_locs']= constants.threshold[:, 0]
        result['masking_threshold']=np.ones(106)
        #print("masking calculated")
        #mfcc_data, centroid = MFCC.custom_mfcc(data) #Calculate mfcc and spectral centroid
        result['mfcc']= orchestration['mfcc']
        result['spectrum'] = np.ones(44100)
        result['centroid']= 0
        #print("mfcc calculated")
        #LpcLocs, LpcFreqs = lpc_coeffs.lpc_coeffs(data) #calculate LPC-frequency response
        #result['lpc_locs']=LpcLocs
        #result['lpc_threshold']=LpcFreqs
        #locs, peaks = findPeaks.peaks(S, min_note)
        result['peak_locs']=[]
        result['peaks']=[]
        target=result

    mixer_definitions=[
        ['powerness', 50, 0.91],
        ['fullness, fatness, boominess', 70, 0.93],
        ['hardness, warmth', 100, 0.95],
        ['fullness, boominess', 190, 0.91],
        ['body, muddiness', 260, 0.93],
        ['richness, boxiness', 530, 0.95],
        ['richness, nasalness', 600, 0.91],
        ['punch, hornness', 750, 0.93],
        ['clarity, listening fatique', 2500, 0.95],
        ['ear tiring', 4500, 0.91],
        ['presence, harshness', 5000, 0.93],
        ['sharpness, dullness', 7000, 0.95],
        ['sheen, shrill, brittle', 12000, 0.91],
    ]
    def make_annotations(name, x, y=1):
        return {
            #'xref':'x',
            'yref':'paper',
            'visible': True,
            'showarrow': True,
            'text': name,
            'font': {
                'size': 11,
                'color': 'black'
            },
            'textangle': -30,
            'bordercolor':'gray',
            'align': 'left',
            'xanchor': 'left',
            'valign': 'bottom',
            #'width': math.log10(100),
            #'height': 20,
            'x': math.log10(x),
            'y': y
        }
    def make_arrow(x, y=1):
        return{
            'yref':'paper',
            'text':'',
            'ax':math.log10(x),
            'x':math.log10(x+50),
            'y':y
        }

    #annotations = [f for name, x, y in mixer_definitions for f in (make_annotations(name, x, y), make_arrow(x))]
    annotations = [make_annotations(name, x, y) for name, x, y in mixer_definitions]

    fig_layout = {
        'plot_bgcolor': plot_color,
        'paper_bgcolor': paper_color,
        'font': {
            'color': 'black'
        },
        'xaxis': {'title': {'text': 'Frequency in Hz', 'standoff':3}, 'type': 'log',
                  # 'rangeslider': {'visible': True},
                  # 'rangeselector': {'visible':True,
                  #                  'buttons':[{'step':'all'}, {'step':'day'}, {'step':'hour'}]},
                  'showgrid': False,
                  'range': [1.6, 4.3]
                  },
        "title": {'text': "Masking curve", 'xanchor':'left', 'x':0},
        'yaxis': {'title':  'dB (SPL)', 'showgrid': False, 'zeroline': False},
        'dragmode': 'zoom',
        'annotations':annotations,
        'legend': {'orientation': 'h', 'y':-0.15}
        #'grid': {'rows': 1, 'columns': 2},
        #"height": '99vh',  # view height
    }
    fig_layout2 = {
        'plot_bgcolor': plot_color,
        'paper_bgcolor': paper_color,
        'font': {
            'color': 'black'
        },
        "title": "Centroids",
        'yaxis': {'title':  'Frequency in Hz'},
    }
    fig_layout3 = {
        'plot_bgcolor': plot_color,
        'paper_bgcolor': paper_color,
        'font': {
            'color': 'black'
        },
        "title": "Orchestration and target mfcc:s",
        'yaxis': {'title':  'MFCCs'},
    }
    fig_layout4 = {
        'plot_bgcolor': plot_color,
        'paper_bgcolor': paper_color,
        'font': {
            'color': 'black'
        },
        'xaxis': {'title': ''},
        "title": "Mfcc vectors",
        'yaxis': {'title':  'mfcc values'},
    }
    audibility_layout = {
        'plot_bgcolor': plot_color,
        'paper_bgcolor': paper_color,
        'font': {
            'color': 'black'
        },
        "title": "Audibility of the target",
    }
    dark_layout = {
        'plot_bgcolor': plot_color,
        'paper_bgcolor': paper_color,
        'font': {
            'color': 'black'
        },
    }
    fig_config = {
        'displayModeBar': False
    }

    #fig = go.Figure().add_trace(go.Scatter(x=orchestration['masking_locs'], y=orchestration['masking_threshold']), layout=fig_layout, xaxis_type="log")

    color=[]
    #Tässä interpoloidaan maskauskäyrän välit vastaamaan targetin huippuja:
    # hearing_target_list = target['peaks'] - np.interp(target['peak_locs'], orchestration['masking_locs'], orchestration['masking_threshold'])
    #print(hearing_target_list)
    def remove_too_low_frequencies(old_peaks, old_locs):
        new_peaks=[]
        new_locs=[]
        for i in range(len(old_locs)):
            if old_locs[i] >35:
                new_peaks.append(old_peaks[i])
                new_locs.append(old_locs[i])
        return new_peaks, new_locs

    if any(x < 35 for x in target['peak_locs']):    #Frequency peaks under 35hz are concidered as mistake
        target['peaks'], target['peak_locs'] = remove_too_low_frequencies(target['peaks'], target['peak_locs'])

    idx_above = target['peaks'] > np.interp(target['peak_locs'], orchestration['masking_locs'], orchestration['masking_threshold'])
    peaks_above_masking = target['peaks'] - np.interp(target['peak_locs'], orchestration['masking_locs'], orchestration['masking_threshold'])
    # print(target['peaks'] - np.interp(target['peak_locs'], orchestration['masking_locs'], orchestration['masking_threshold']))
    # print(np.count_nonzero(peaks_above_masking>9))
    # print(peaks_above_masking)
    # Function to calculate masking percent. Takes into account how afr peaks are from masking threshold
    def calculate_masking_percent(peaks_above):

        # Check the critical band area for louder peaks:
        nonzeros_loc = np.array(target['peak_locs'])[idx_above]
        nonzeros_pks = np.array(target['peaks'])[idx_above]
        nonzero_indexes = np.nonzero(idx_above)[0] # Returns tuple, take index [0]
        for i in range(len(nonzeros_loc)):
            idx = (np.abs(orchestration['masking_locs'] - nonzeros_loc[i])).argmin() #Find the nearest masking index for peak
            low_range = idx-1 # Check three indexes under target peak EDIT: CHANGE TO 1
            high_range = idx+1 # Check two indexes above target peak EDIT: CHANGE TO 1
            if idx <4:
                low_range = idx
            band_max = np.array(orchestration['masking_threshold'])[low_range:high_range].max() #Get maximum around peak
            peaks_above_masking[nonzero_indexes[i]] = target['peaks'][i]-band_max
            if peaks_above_masking[nonzero_indexes[i]] <= 0: #If current peak is under loca maximum...
                idx_above[nonzero_indexes[i]] = False  # ...set idx above to False
            if nonzeros_loc[i] >7000: #Do not count peaks over 7kHz
                peaks_above_masking[nonzero_indexes[i]] = -1
                idx_above[nonzero_indexes[i]] = False  # ...set idx above to False

        percent = 100
        if np.count_nonzero(idx_above == True) == 0:
            return 100
        else:
            # percent = 20
            percent = 100 - ( 100 * (np.count_nonzero(idx_above == True) / len(idx_above)) )

        #If there are at least two componenets over 15db above masking threshold:
        if np.count_nonzero(peaks_above_masking>15)>=1:
            if np.count_nonzero(peaks_above_masking>15)==len(peaks_above_masking):
                return 0
            if np.count_nonzero(peaks_above_masking > 15) >= 2:
                return percent*0.1 # 5+(percent*0.3)
            return 5+(percent*0.1) # 10+(percent*0.4)

        #If there are at least two componenets over 10db above masking threshold:
        if np.count_nonzero(peaks_above_masking>10)>=1:
            if np.count_nonzero(peaks_above_masking>10)==len(peaks_above_masking):
                return 0
            if np.count_nonzero(peaks_above_masking > 10) >= 2:
                return percent*0.2 # 30+(percent*0.3)
            return 5+(percent*0.2) #50+(percent*0.4)

        #if there are at least three components over 6db above masking threshold:
        if np.count_nonzero(peaks_above_masking>6)>=1:
            if np.count_nonzero(peaks_above_masking>6)==len(peaks_above_masking):
                return 10
            if np.count_nonzero(peaks_above_masking > 6) >= 2:
                return percent*0.3 # 35 + (percent * 0.5)
            return 5+(percent*0.3) # 40 + (percent * 0.3)

        #if there are at least three components over 0db above masking threshold:
        if np.count_nonzero(peaks_above_masking>0)>=1:
            if np.count_nonzero(peaks_above_masking>0)==len(peaks_above_masking):
                return 60 #If all peaks are above, but barely
            if np.count_nonzero(peaks_above_masking > 0) >= 2:
                return 70 + (percent * 0.3)
            return 80 + (percent * 0.2)


        if np.count_nonzero(idx_above == True) == 0:
            masking_percent = 100
        else:
            masking_percent = 100 - 100 * (np.count_nonzero(idx_above == True) / len(idx_above))
        return masking_percent

        '''  OLD VERSION!!!
        if np.count_nonzero(idx_above == True) == 0:
            return 100
        else:
            percent = 100 - 100 * (np.count_nonzero(idx_above == True) / len(idx_above))
        #print(percent)
        #If there are at least two componenets over 15db above masking threshold:
        if np.count_nonzero(peaks_above_masking>15)>=1:
            if np.count_nonzero(peaks_above_masking>15)==len(peaks_above_masking):
                return 0
            if np.count_nonzero(peaks_above_masking > 10) >= 2:
                return 5+(percent*0.3)
            return 20+(percent*0.4)

        #If there are at least two componenets over 10db above masking threshold:
        if np.count_nonzero(peaks_above_masking>10)>=1:
            if np.count_nonzero(peaks_above_masking>10)==len(peaks_above_masking):
                return 0
            if np.count_nonzero(peaks_above_masking > 10) >= 2:
                return 20+(percent*0.7)
            return 50+(percent*0.5)

        #if there are at least three components over 6db above masking threshold:
        if np.count_nonzero(peaks_above_masking>6)>=1:
            if np.count_nonzero(peaks_above_masking>6)==len(peaks_above_masking):
                return 10
            if np.count_nonzero(peaks_above_masking > 6) >= 2:
                return 50 + (percent * 0.5)
            return 70 + (percent * 0.3)

        #if there are at least three components over 0db above masking threshold:
        if np.count_nonzero(peaks_above_masking>0)>=1:
            if np.count_nonzero(peaks_above_masking>0)==len(peaks_above_masking):
                return 60 #If all peaks are above, but barely
            if np.count_nonzero(peaks_above_masking > 0) >= 2:
                return 70 + (percent * 0.3)
            return 80 + (percent * 0.2)


        if np.count_nonzero(idx_above == True) == 0:
            masking_percent = 100
        else:
            masking_percent = 100 - 100 * (np.count_nonzero(idx_above == True) / len(idx_above))
        return masking_percent
        '''





    indexes_above=0;
    for i in range(len(idx_above)):
        if idx_above[i]:
            color.append(1)
            indexes_above+=1
        else: color.append(0)
    #Käyrän alla punainen rasti, käyrän yllä vihreä rasti:
    colorscale = [[0, 'red'], [1.0, 'green']]
    output_masking_order_idx=[]
    #print('target peaks:')
    #print(target['peaks'])

    # Following function compares orchestration from two steps lower to one step higher the highest masking value against the target:
    def compare_target_to_orchestration(orch_msking, tgt_msking, peak_index_list):
        sum=0
        for idx in peak_index_list:
            highest=orch_msking[idx]
            if idx>0:
                if orch_msking[idx-1]>highest:
                    highest=orch_msking[idx-1]
                    if idx > 1:
                        if orch_msking[idx - 2] > highest:
                            highest = orch_msking[idx - 2]
                if orch_msking[idx+1]>highest:
                    highest = orch_msking[idx + 1]
            difference = highest-tgt_msking[idx]
            sum = sum+difference
        return sum

    def find_nearest(array, value): # FInd nearest value of numpy array
        array = np.asarray(array)
        idx = (np.abs(array - value)).argmin()
        return idx

    #if tgt and indexes_above < len(target['peaks']/2): ## HERE calculate strongest maskers only if half of the target is inaudible, changed to all
    if True:
        for i in range(len(masking_lists[0])):
            #!! Find the 15 (changed to 30) loudest peaks for target, subtract them from orchestration:
            tgt_peaks = heapq.nlargest(30, range(len(target['masking_threshold'])), key=target['masking_threshold'].__getitem__)
            pks = find_peaks(target['masking_threshold'], 15) #
            min_idx=0
            if min_notes[1]<120:
                min_herz = pretty_midi.note_number_to_hz(min_notes[1])*0.9 # Take tenth off to make sure it finds all
                min_idx = find_nearest(constants.threshold[:,0], min_herz)
            #print(target['masking_threshold'])
            tgt_peaks = [pk for pk in list(pks[0]) if pk>=min_idx]
            if not tgt_peaks:
                tgt_peaks = list(pks[0])
            if not tgt:
                target['masking_threshold'] = constants.threshold[:,2]
                tgt_peaks = [v for v in range(45)]
            #print(target['masking_threshold'][tgt_peaks])
            #print(tgt_peaks)
            #print(target['peaks'])
            #print(target['peak_locs'])
            #print(target['masking_threshold'][tgt_peaks])
            #print(masking_lists[1][0][tgt_peaks])
            #print(compare_target_to_orchestration(masking_lists[0][i], np.array(target['masking_threshold']), tgt_peaks))

            #Following function compares orchestration from two steps lower to one step higher the highest masking value against the target:
            masking_lists[0][i] = compare_target_to_orchestration(masking_lists[0][i], np.array(target['masking_threshold']), tgt_peaks)

            #masking_lists[0][i] = np.subtract(masking_lists[0][i][tgt_peaks], np.array(target['masking_threshold'])[tgt_peaks]) #Old way: just subrtact the difference on the same spot
            #print(masking_lists[0][i])
            #masking_lists[0][i] = np.sum(masking_lists[0][i][0:40]) #Old way, sum up the values in list
            #print(masking_lists[0][i])
            #print(masking_lists[0][i])

        masking_order_idx = heapq.nlargest(len(masking_lists[0]), range(len(masking_lists[0])), key=masking_lists[0].__getitem__)
        masking_order=[]
        output_masking_order_idx=[]
        osmd_indexes=[]
        for id in masking_order_idx:
            masking_order.append(lista[orchestration_indexes[id]])
            output_masking_order_idx.append(orchestration_indexes[id])
            osmd_indexes.append(original_osmd_indexes[id])
    else:
        masking_order=[]
        output_masking_order_idx=[]
        osmd_indexes=[]

    if isinstance(target['peaks'], np.ndarray):
        target['peaks'] = target['peaks'].tolist()
    if isinstance(target['peak_locs'], np.ndarray):
        target['peak_locs'] = target['peak_locs'].tolist()

    trace1 = {
        "mode": "markers",
        "type": "scatter",
        "x": target['peak_locs'],
        "y": target['peaks'],
        "name": "Audible peaks",
        "marker": {'symbol': 'x', 'size': 12, 'color': color, 'colorscale': colorscale, 'line':{'width': 0}}, #Tässä laitetaan eri väriset rastit kuuluvuuden mukaan
        "line": {'color': 'Green', 'width': 5},
    }

    #Build stems for peaks
    peak_stems_x = []
    peak_stems_y = []
    for i in range(len(target['peak_locs'])):
        peak_stems_x.append(target['peak_locs'][i]-10)
        peak_stems_y.append(-30)
        peak_stems_x.append(target['peak_locs'][i])
        peak_stems_y.append(target['peaks'][i])
        peak_stems_x.append(target['peak_locs'][i] + 10)
        peak_stems_y.append(-30)
        peak_stems_x.append(None)
        peak_stems_y.append(None)

    stem_trace = {
        "mode": "lines",
        "type": "scatter",
        "x": peak_stems_x,
        "y": peak_stems_y,
        "line": {"color": "Grey", "width": 4},
        "opacity": 0.7,
        "showlegend": False,
    }

    trace2 = {
        "mode": "lines",
        "type": "scatter",
        "x": orchestration['masking_locs'],
        "y": orchestration['masking_threshold'],
        "name": "masked area",
        "line": {'color': 'orange', 'width': 0},
        "fill": "tonexty"
    }

    trace3 = {
        "showlegend": False,
        "mode": "lines",
        "type": "scatter",
        "x": orchestration['masking_locs'],
        "y": np.zeros(106)-30,
        'line': {'width': 0}
    }

    trace4 = {
        "type": "bar",
        "x": ['orchestration', 'target'],
        "y": [orchestration['centroid'], target['centroid']]
    }


    cv = lambda x: np.std(x) / np.mean(x)
    var = np.apply_along_axis(cv, axis=0, arr=orch_mfcc_array)
    var_coeff = np.mean(abs(var))
    trace5 = {
        "type": "bar",
        "x": ['Target mfcc distance to orch.', 'Orchestration variation coefficient'],
        "y": [np.linalg.norm(orchestration['mfcc'][1:]-target['mfcc'][1:]), var_coeff]
    }
    mfcc_distance=np.linalg.norm(orchestration['mfcc'][1:]-target['mfcc'][1:])

    # print('var_coeff and distance : {} and {}'.format(var_coeff, mfcc_distance))
    distance = {
        'mode': "gauge+number",
        "type": "indicator",
        'value': mfcc_distance,
        'domain': {'x': [0, 1], 'y': [0, 1]},
        'title': {'text': "Target mfcc distance"}
    }

    mfcc_vector_trace1 = {
        "mode": "lines",
        "type": "scatter",
        "y": orchestration['mfcc'],#[1:],
        "name": "orchestration mfcc vector",
        "line": {'color': 'yellow'},
    }

    mfcc_vector_trace2 = {
        "mode": "lines",
        "type": "scatter",
        "y": target['mfcc'],#[1:],
        "name": "target mfcc vector",
        "line": {'color': 'purple'},
        "fill": "tonexty",
        "fillcolor": "grey"
    }

    def generate_barks():
        xx=[]
        yy=[]
        for f in constants.barks:
            xx = [*xx, *[f, f, None]]
            yy = [*yy, *[100, -20, None]]
        xx[-1]=[]
        yy[-1]=[]
        return xx, yy
    xx, yy = generate_barks()
    vertical_line = {
        "mode": "lines",
        "type": "scatter",
        "x": xx,
        "y": yy,
        "opacity": 0.3,
        "name": "Critical bands"
    }

    orchestration_formant = {
        'visible': "legendonly",
        "mode": "lines",
        "type": "scatter",
        "x": [50, 300, 500, 10000],
        "y": [75, 87, 87, 20],
        "line": {'width': 0},
        "opacity": 0.05,
        "name": "ideal orchestration formant",
        "fill": "tonexty"
    }
    mixer_bands=[[40, 80],[50,160], [90, 110], [150,300], [190, 350], [300,600], [400, 1000], [700,800], [1000, 4000], [4400, 4600], [4900, 5100], [6800, 7200], [10000, 15000]]
    def create_mixer_bands(bands, elev=0):
        return [[bands[0], bands[0], bands[1], bands[1], None], [98+elev, 101+elev, 101+elev, 98+elev, None]]
    m_bands_x=[]
    m_bands_y=[]
    elev=0
    for band in mixer_bands:
        temp_data=create_mixer_bands(band, elev)
        m_bands_x=m_bands_x+temp_data[0]
        m_bands_y=m_bands_y+temp_data[1]
        if elev==0:
            elev=3
        elif elev==3:
            elev=6
        else:
            elev=0
    #print(m_bands_y)
    mixer_bands_1 = {
        'mode': 'lines',
        'type': 'scatter',
        'x': m_bands_x,
        'y': m_bands_y,
        'line': {'color':'pink'},
        'opacity': 0.3,
        'showlegend': False,
    }

    hearing_threshold = {
        "mode": "lines",
        "type": "scatter",
        "x": constants.threshold[:, 0],
        "y": constants.threshold[:, 2],
        "opacity": 0.7,
        "name": "Hearing threshold",
        "line": {"dash": "dash", "color": "red"},
    }

    spect=target['spectrum']
    spect[spect<-30]=-30
    spec_trace = {
        "mode": "lines",
        "type": "scatter",
        "x": np.arange(19919)[86:],
        "y": target['spectrum'][86:19919],
        "opacity": 0.1,
        "name": "spectrum"
    }

    audibility = {
        'mode': "gauge+number",
        "type": "indicator",
        'value': 270,
        'domain': {'x': [0, 1], 'y': [0, 1]},
        'title': {'text': "Audibility"}

    }

    if np.count_nonzero(idx_above == True)==0:
        masking_percent=100
    else:
        masking_percent=100-100*(np.count_nonzero(idx_above == True)/len(idx_above))
    #print(masking_percent)

    #New masking percent function:
    masking_percent = calculate_masking_percent(peaks_above_masking)
    #effect of centroid
    if target['centroid']<2000 and masking_percent<85:

        masking_add = (2000/target['centroid'])/5 #add masking by certain factor if centroid is under 2khz
        masking_percent += (masking_add*100)
        if masking_percent>100: #can't go over 100 percent
            masking_percent = 100

    def inline(graph):
        return html.Div(graph, style={'display':'inline-block'})

    if orchestration['centroid']>(target['centroid']+200):
        brightness="The orchestration is brighter than target."
    elif (target['centroid']-200)<=orchestration['centroid']<=(target['centroid']+200):
        brightness="The orchestration and target are about equal bright."
    elif orchestration['centroid']<(target['centroid']-200):
        brightness="The target is brighter than orchestration."

    if mfcc_distance<20:
        color_distance="The orchestration and the target have about the same timbre."
    elif 20<=mfcc_distance<=70:
        color_distance="The target timbre differs from orchestration slightly."
    elif mfcc_distance>=70:
        color_distance="The target sound has differrent timbre than orchestration."

    masker=''
    if tgt and masking_percent>50:
        masker = "The heaviest masker is {} playing {}.".format(masking_order[0][0], masking_order[0][2])
        if masking_order[0][2]=='p':
            masker += ' Concider changing the register of {}, or revise the orchestration.'.format(masking_order[0][0])
        else:
            masker += ' Concider lowering dynamics of {}, or increase dynamics of target.'.format(masking_order[0][0])
        if len(masking_order)>1:
            masker += " The second heaviest masker is {} playing {}.".format(masking_order[1][0], masking_order[1][2])
        if len(masking_order)>2:
            masker += " The third heaviest masker is {} playing {}.".format(masking_order[2][0], masking_order[2][2])

    fig1 = go.Figure(data=[trace1, trace3, trace2, vertical_line, hearing_threshold, trace3, orchestration_formant, stem_trace, mixer_bands_1], layout=fig_layout)     #Removing spectrum increase screen update, so, this is out: spec_trace
    fig2 = go.Figure(data=[trace4], layout=fig_layout2)
    fig3 = go.Figure(data=[trace5], layout=fig_layout3)
    distance= go.Figure(data=[distance], layout=dark_layout)
    #print(mfcc_vector_trace1)
    # mfcc_fig = go.Figure(data=[mfcc_vector_trace1, mfcc_vector_trace2], layout=fig_layout4)


    #Make individual orchestration glyph-data:
    orchestration_glyph_data=dict()
    orchestration_glyph_data['mfccs']=orch_mfcc_array

    orchestration_glyph_data['instruments']=orchestration_instrument_names

    import timbre_glyph as mels
    mfcc_fig = mels.make_glyph(orchestration['mfcc'],target['mfcc'], plot_color, paper_color, orchestration_glyph_data)
    #mfcc_fig = []
    audibility= go.Figure(data=audibility, layout=audibility_layout)
    #fig = go.Figure(data=[go.Scatter(x=orchestration['masking_locs'], y=orchestration['masking_threshold'])], layout=fig_layout)

    def make_box(content, width):
        return dac.Box([dac.BoxBody(content)],width=width)

    masking_graph = make_box(html.Div(className='masking', children=[
                     html.Div(dcc.Graph(id='masking-graph{}'.format(custom_id),figure=fig1, config=fig_config),
                              ), ]),12),
    gauge_graph = html.Div(className='gauge', children=[
                         #dcc.Graph(id='audibility', figure=audibility, config=fig_config),
                         daq.GraduatedBar(vertical=True, value=masking_percent, max=100, step=1,
                                          style={'color': 'black'}, showCurrentValue=True,
                                          color={"gradient": True, "ranges": {"green": [0, 50], "yellow": [50, 90], "red": [90, 100]}},
                                          label={'label': '% of target peaks masked',
                                                 'style': {'color': 'white'}})
                     ]),
    summary_graph = dac.Box([dac.BoxHeader(title='Summary:', collapsible=False, style={'height':50}),dac.BoxBody(html.Div(className='teksti', children=[
                             html.Div("There are {} target peaks above the masking threshold.".format(np.count_nonzero(idx_above == True))+" "+brightness+" "+color_distance+" "+masker
                                      ), #html.Audio(src=in_file, controls=True) #daudio.DashAudioComponents(id='audio-player',src="horn", autoPlay=True, controls=True)
                              ], style={'textAlign':'center'}))], width=12),
    mfcc_graph = html.Div(className='mfcc', children=[
                              html.Div(dcc.Graph(id='mfcc-vector{}'.format(custom_id), figure=mfcc_fig, config=fig_config, style={'height':300})),
                              html.Div(id='place{}'.format(custom_id))
                              ]),
    centroid_graph = make_box(html.Div(className='bar1', children=[
        html.Div([dcc.Graph(id='centroid-graph{}'.format(custom_id), figure=fig2, config=fig_config, style={'height':240})]),
    ]),12),

    #This is made-up value, distances are approx up to 250 (new database = 8000)
    #mfcc_distance_value = mfcc_distance / 250 * 100
    mfcc_distance_value = mfcc_distance / 8000 * 100

    if mfcc_distance_value <40:
        masking_percent+=10 # if target has matching timbre, it hears less
        if masking_percent>100:
            masking_percent=100

    #if multisclice:
    #    return [masking_percent, osmd_indexes]

    distance_graph = html.Div(className='bar2', children=[
         #html.Div([dcc.Graph(id='distance-graph', figure=distance, config=fig_config)]),
         daq.GraduatedBar(vertical=True, value=mfcc_distance_value, max=100, step=1, id='distance-graph{}'.format(custom_id),
                         style={'color': 'black'}, #showCurrentValue=True,
                         color={"gradient": True, "ranges": {"green": [0, 50], "yellow": [50, 90], "red": [90, 100]}},
                         label={'label': 'Target timbre distance from orchestration',
                                'style': {'color': 'white'}})
     ]),

    #hom_val = (2-var_coeff)/2*100
    hom_val = (6-var_coeff)/6*100
    var_coeff_graph = html.Div(className='bar3', children=[
                             #html.Div([dcc.Graph(id='varcoeff-graph', figure=fig3, config=fig_config)]),
                            daq.GraduatedBar(vertical=True, value=hom_val, max=100, step=1, style={'color':'black', 'textAlign':'center'},showCurrentValue=True, color={"gradient":True,"ranges":{"grey":[0,50], "green":[50,100]}},label={'label':'Homogeneity % of orchestration', 'style':{'color':'white'}})
                    ]),
    #import chord.listening_module

    Analyze_graph =[
        dbc.Row([
            #dbc.Col([summary_graph[0], centroid_graph[0]], width=3),
            dbc.Col(masking_graph, width=12)
        ]),
        dbc.Row([
            dbc.Col(make_box(dbc.Row([
                dbc.Col(gauge_graph[0]),
                dbc.Col(distance_graph[0]),
                dbc.Col(var_coeff_graph[0]),
            ]), 12), width=6),
        dbc.Col(make_box(mfcc_graph[0],12), width=6),
                    ]),
    # dbc.Row([
    #     dbc.Col(chord.listening_module.module(app, list_copy, custom_id))
    # ])
    ]

    centroid_notes = []
    centroid_markings = []
    if orchestration['centroid']:
        centroid_markings.append('Orch. {:.1f}Hz'.format(float(orchestration['centroid'])))
        centroid_notes.append(orchestration['centroid'])
    if target['centroid']:
        centroid_markings.append('Target {:.1f}Hz'.format(float(target['centroid'])))
        centroid_notes.append(target['centroid'])

    centroid_notes, centroid_markings, tgts_dummy, highs, dummy_sort_idx = sort_for_vexflow.sort_notes(centroid_notes,
                                                                                                       centroid_markings,
                                                                                                       [])
    centroid_notes = [hertz_to_microtone.convert(i) for i in centroid_notes]

    ## MAKE MASKING SCORE GRAPH DATA:
    def format_notecolor(peaks, masking_notevalues):
        for i in range(len(masking_notevalues)):
            if i > 0:
                if masking_notevalues[i] - masking_notevalues[i - 1] < 4 and peaks[i - 1] != 0:
                    peaks[i] = 0
        peaks = [i ** 3 for i in peaks]
        peaks = [i / (90 ** 3) for i in peaks]

        return peaks
    orch_masking_mod_locs = orchestration['masking_locs'].copy()
    orch_masking_mod_locs[0] = 20;
    masking_notevalues = [pretty_midi.hz_to_note_number(int(i)) for i in orch_masking_mod_locs]
    masking_colors = [chord_db_to_color.color(i) for i in orchestration['masking_threshold']]
    masking_notesizes = np.ones(len(masking_notevalues)) + 100
    target_notevalues = [pretty_midi.hz_to_note_number(int(i)) for i in target['peak_locs']]
    target_peaks = format_notecolor(target['peaks'], target_notevalues)
    target_colors = ['rgba(0, 0, 0, {})'.format(i) for i in target_peaks]
    target_notesizes = np.ones(len(target_notevalues)) + 40

    if multisclice:
        return [masking_percent, osmd_indexes, mfcc_distance_value, hom_val, [orchestration['centroid'], target['centroid']], [orchestration['masking_threshold'], target['masking_threshold'], orchestration['masking_locs']]]

    graphs_dict = {"fig_config": fig_config,
                   "msking_graph": {"data": [trace1, trace3, trace2, vertical_line, hearing_threshold, trace3, orchestration_formant, stem_trace,
     mixer_bands_1], "layout": fig_layout},
                   "masking_percent": masking_percent,
                   "summary": "There are {} target peaks above the masking threshold.".format(
                       np.count_nonzero(idx_above == True)) + " " + brightness + " " + color_distance + " " + masker,
                   "mfcc_graph": mfcc_fig,
                   "centroid_graph": {"notes": centroid_notes, "markings":centroid_markings},
                   "distance_graph": mfcc_distance_value,
                   "var_coeff_graph": hom_val,
                   "masking_score":{"masking_notevalues":masking_notevalues, "masking_colors":masking_colors,
                                     "masking_notesizes":masking_notesizes,
                                     "target_notevalues":target_notevalues, "target_colors":target_colors,
                                     "target_notesizes":target_notesizes}
                   }
    # return [], [], graphs_dict, output_masking_order_idx

    notation = make_slice_notation.notation(orchestra,
                                 [list[0] for list in lista],
                                 [list[1] for list in lista],
                                 [list[2] for list in lista],
                                 [list[3] for list in lista],
                                 [list[4] for list in lista],
                                 [list[5] for list in lista],
                                 [list[7] if len(list)>=8 else 0 for list in lista], ##This is for microtones
                                output_masking_order_idx
                                 )
    orchestration['spectrum']=[0]
    target['spectrum']=[0]
    return orchestration, target, graphs_dict, output_masking_order_idx, notation
    return orchestration, target, Analyze_graph, summary_graph[0], output_masking_order_idx



