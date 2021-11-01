import dash_core_components as dcc
import dash_html_components as html
import dash_bootstrap_components as dbc
import dash_admin_components as dac
from dash.dependencies import Input, Output, State, ALL
import plotly.graph_objs as go
from helpers import constants, hertz_to_microtone
import score_component as sc
import pickle
import dash
from dash.exceptions import PreventUpdate
import pretty_midi
import search_the_like
import numpy as np
import soundfile as sf
import base64
import io
from scipy.signal import convolve
from masking_slice import spectral_centroid
import alternate_mfcc
import combine_peaks
import maskingCurve_peakInput
from helpers.constants import instrument_data_path, ir_data_path

#path='/Users/admin-upu10438/Sync/Score-Tool'
#path='N:\Cloud folders (Dropbox - Sync and OneDrive)\Sync\Sync\Score-Tool'
#with open(path+'/database/no_data_orchestra.pickle', 'rb') as handle:
#    orchestra = pickle.load(handle)
#app = dash.Dash(__name__)
#server = app.server

#instrument_data_path='N:/Score-Tool iowa samples/out'
# instrument_data_path = 'c:/sample_database'
#instrument_data_path='/home/uljas/sample_library'
#ir_data_path='N:/Score-Tool iowa samples'
# ir_data_path = 'c:/sample_database/musatalo'
#ir_data_path='/home/uljas/sample_library/musatalo'

from helpers.constants import instrument_data_path, ir_data_path


def cutSample(data):
    fadeamount = 300
    maxindex = np.argmax(data > 0.01)
    startpos = 3000
    if(len(data.shape)==2):
        data=data[:,0]
    # data=data[:44100]
    print('data len :' + str(len(data)))
    if len(data) > 44100 * 3:
        if maxindex > 44100:
            if len(data) > maxindex + (44100 * 3):
                data = data[maxindex - startpos:maxindex - startpos + (44100 * 3)]
            else:
                data = data[maxindex - startpos:]
        else:
            data = data[0:44100 * 3]
    else:
        if maxindex > 44100:
            data = data[maxindex - startpos:]
    if len(data)<3*44100:
        data = np.concatenate((data, np.zeros(44100 * 3 - len(data))), axis=None)
    # print('data len :'+str(len(data)))
    fade = np.geomspace(1, 2, fadeamount) - 1
    data[0:fadeamount] = data[0:fadeamount] * fade
    data[-fadeamount:] = data[-fadeamount:] * np.flip(fade)
    data = np.concatenate((np.zeros(startpos), data), axis=None)
    return data


def fix_length(output, convolved_left, convolved_right):
    if len(output[0]) < len(convolved_left):
        output[0] = np.concatenate((output[0], np.zeros(len(convolved_left) - len(output[0]))), axis=None)
    elif len(output[0]) > len(convolved_left):
        convolved_left = np.concatenate((convolved_left, np.zeros(len(output[0]) - len(convolved_left))),
                                        axis=None)
    if len(output[1]) < len(convolved_right):
        output[1] = np.concatenate((output[1], np.zeros(len(convolved_right) - len(output[1]))), axis=None)
    elif len(output[1]) > len(convolved_right):
        convolved_right = np.concatenate((convolved_right, np.zeros(len(output[1]) - len(convolved_right))),
                                         axis=None)
    output[0] = output[0] + convolved_left
    output[1] = output[1] + convolved_right
    return output


def search(app, orchestra):

    # from compare import test_instrument_input
    percussion = ['timp', 'bass_drum', 'snare', 'cymbal', 'thaigong', 'tamtam', 'tamtam_40', 'tamtam_22', 'tambourine','crotale', 'tuned_gongs', 'xylophone', 'woodblock', 'percussion_misc', 'triangle_6', 'triangle_8', 'vibraphone']

    selected_instruments = list(orchestra.keys())
    quick_selections = ['all_sustaining', 'only_strings', 'only_percussion', 'only_voices']
    pitch_classes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
    octaves = [1, 2, 3, 4, 5, 6, 7, 8]
    search_box = html.Div([
        dbc.FormGroup(
            [
                dbc.Label("Quick select instruments"),
                dbc.RadioItems(
                    options=[{'label': quick, 'value': quick} for quick in quick_selections],
                    value='all_sustaining',
                    id="quick-select-input",
                    inline=True
                ),
                dbc.Button("Select all instruments", id='select_all',size="sm", className='mr-1'),
                dbc.Button("Invert selection", id='invert_selection',size="sm", className='mr-1'),
                dbc.Button("Clear all", id='clear_selection',size="sm", className='mr-1', color='danger'),
            ]
        ),
        html.Div(
        dbc.FormGroup(
            [
                dbc.Label("Choose instruments to search from"),
                dbc.Checklist(
                    options=[{'label': instrument, 'value': instrument} for instrument in orchestra.keys()],
                    value=[instrument for instrument in orchestra.keys() if instrument not in percussion+['piano', 'guitar']+['baritone_generic', 'soprano_generic', 'tenor_generic']],
                    id="instrument_data-input",
                    inline=True
                ),
            ]
        ), id='instrument_select_outer')
        ,
        dbc.FormGroup(
            [
                dbc.Button("Select all techniques", id='select_all_techs', size="sm", className='mr-1'),
                dbc.Button("Select normal", id='invert_tech_selection', size="sm", className='mr-1'),
                dbc.Button("Clear all", id='clear_tech_selection', size="sm", className='mr-1', color='danger'),
                dbc.Label("Choose techniques to search from"),
                dbc.Checklist(
                    options=[{'label': tech, 'value': tech} for tech in set([tec for key in orchestra.keys() for tec in orchestra[key].keys() if key in selected_instruments])],
                    value=['normal'],
                    id="tech_data-input",
                    inline=True,
                ),
            ]
        ),
        dbc.FormGroup(
            [
                dbc.Label("Choose dynamics to search from"),
                dbc.Checklist(
                    options=[{'label': dyn, 'value': dyn} for dyn in ['p', 'mf', 'f']],
                    value=['p', 'mf', 'f'],
                    id="dynamic_data-input",
                    inline=True,
                ),
            ]
        ),
        dbc.FormGroup(
            [
                dbc.Label("Choose pitch-classes to search from"),
                dbc.Checklist(
                    options=[{'label': pitch, 'value': pitch} for pitch in pitch_classes],
                    value=pitch_classes,
                    id="pitch-class_data-input",
                    inline=True,
                ),
            ]
        ),
        dbc.FormGroup(
            [
                dbc.Label("Choose octaves / registers to search from"),
                dbc.Checklist(
                    options=[{'label': octave, 'value': octave} for octave in octaves],
                    value=octaves,
                    id="octave_data-input",
                    inline=True,
                ),
            ]
        ),
    ])
    start_box= dac.Box(
            [dac.BoxHeader(title='Search timbres from Score-Tool database'),
             dac.BoxBody([
               dbc.Row([
                dbc.Col([
                    # test_instrument_input.new_instrument_input(app, orchestra, 'three', False),
                    dbc.Button(id='add_to_search_button', n_clicks=0, children='Add the instrument above to search source', block=True, style={'marginTop':20}),
                    dbc.Button(id='add_from_chord_app', n_clicks=0, children='Add the instrumentation from CHORD app (Clears current selecion!)', block=True, style={'marginTop':20}),
                    dbc.Button(id='remove_last_button', n_clicks=0, children='Remove last item from search source', block=True, style={'marginTop':20}),
                    html.Div('Search sources:'),
                    html.Div(id='search_sources')
                ], width=6, style={'borderRight':'6px solid grey'}),
                dbc.Col(search_box, width=6)
               ]),
                 dbc.Row([
                     dbc.FormGroup(
                         [
                             dbc.Label("Choose search methods"),
                             dbc.Checklist(
                                 options=[{'label': method, 'value': method} for method in ['mfcc', 'centroid', 'masking_curve', 'peaks']],
                                 value=['peaks'],
                                 id="method-input",
                                 inline=True,
                             ),
                             html.P('Number of overlapping peaks to match (valid only if peaks is selected): '),
                             dbc.Input(id='overlap_number', placeholder='peaks overlap', type="number", size=12, min=1,
                                       max=20, step=1, value=3),
                         ]
                     ),
                dbc.Button(id='search_button', n_clicks=0, children='Click to search', block=True, style={'marginTop':20}),
               ])
               ])
             ],
        width=12)

    result_box=dac.Box([dac.BoxHeader(title='Search results'),
                         dac.BoxBody([
                             dcc.Loading(
                                 id="matching-listening",
                                 type="default",
                                 children=html.Div(id='matching_orchestration'),
                             ),

                        ])],width=12, )

    @app.callback(
        Output("tech_data-input", "options"),
        [
            Input("instrument_data-input", "value"),
        ],
    )
    def inst_input_callback(value):
        techs = [{'label': tech, 'value': tech} for tech in set([tec for key in orchestra.keys() for tec in orchestra[key].keys() if key in value])]
        return techs


def press_search(orchestra, search_sources, method, inst_search, tech_search, dyn_search, pitch_class_search, octave_search, overlap):


    method_array=np.array([False, False, False, False])
    for methods in method:
        if methods=='peaks':
            method_array[3]=True
        if methods=='mfcc':
            method_array[2] = True
        if methods=='centroid':
            method_array[1] = True
        if methods=='masking_curve':
            method_array[0] = True
    sources_list=[]
    current_sample = []
    current_peaks = []
    current_entry = []
    for each in search_sources:
        entry = each.split(',')
        #print(entry)
        #entry[3]=pretty_midi.note_name_to_number(entry[3])
        entry[3] = int(entry[3])
        if len(current_sample)==0:
            signal, sampleRate = sf.read(instrument_data_path + "/{}/{}/{}/{}.wav".format(entry[0], entry[1], entry[2], entry[3]))
            current_sample = cutSample(signal)
        else:
            signal, sampleRate = sf.read(instrument_data_path + "/{}/{}/{}/{}.wav".format(entry[0], entry[1], entry[2], entry[3]))
            current_sample = current_sample+cutSample(signal)
        #current_entry.append(orchestra[entry[0]][entry[1]][entry[2]][int(entry[3])]['masking_curve'])
        #current_entry.append(orchestra[entry[0]][entry[1]][entry[2]][int(entry[3])]['centroid'])
        #current_entry.append(orchestra[entry[0]][entry[1]][entry[2]][int(entry[3])]['mfcc'])
        current_peaks = combine_peaks.combine_peaks(current_peaks, orchestra[entry[0]][entry[1]][entry[2]][int(entry[3])]['peaks'])
        sources_list.append(entry[0])

    current_entry.append(maskingCurve_peakInput.maskingCurve(np.ones(22048) + 70, current_peaks))
    current_entry.append(spectral_centroid(current_sample[:sampleRate]))
    current_entry.append(alternate_mfcc.alternate_mfcc(current_sample[:sampleRate]))
    current_entry.append(current_peaks)

    notes_search=[]
    for pitch in pitch_class_search:
        pitch=pitch+str(0)
        for oct in octave_search:
            notes_search.append(pretty_midi.note_name_to_number(pitch)+(12*int(oct)))

    match_inst = search_the_like.do_the_search(orchestra, sources_list, current_entry, method_array, 1, inst_search, tech_search, dyn_search, notes_search, overlap)

    ############# LISTENING MODULE


    # raw_sounds = []
    # length = len(orchestration)
    i = 0
    sr = 44100
    target_sound = [[], []]
    orchestration_sound = [[], []]
    is_target = False
    orig_inst=entry[0]+","+entry[1]+","+entry[2]+","+str(entry[3])+","+"True"
    # ensemble=[match_inst+",False", orig_inst]

    instr=match_inst.split(',')
    data, sr = sf.read(instrument_data_path + '/{}/{}/{}/{}.wav'.format(instr[0], instr[1], instr[2], instr[3]))
    if len(np.shape(data)) == 2:
        data = data[:, 0]
    data = cutSample(data)
    if np.max(data)<0.2:
        normalization = 0.2 / np.max(data)
        data = data*normalization
    if np.max(current_sample)>0.9:
        normalization = 0.9 / np.max(current_sample)
        current_sample = current_sample*normalization
    ir, sr = sf.read(ir_data_path + '/{}/{}.wav'.format('audience', 22))
    ir = np.transpose(ir)
    convolved_left = convolve(data, ir[0])
    convolved_right = convolve(data, ir[1])
    orchestration_sound = [convolved_left, convolved_right]
    convolved_left = convolve(current_sample, ir[0])
    convolved_right = convolve(current_sample, ir[1])
    target_sound = [convolved_left, convolved_right]

    together=current_sample+data
    if np.max(together)>0.9:
        normalization = 0.9 / np.max(together)
        together = together*normalization
    convolved_left = convolve(together, ir[0])
    convolved_right = convolve(together, ir[1])
    output = [convolved_left, convolved_right]


    max_vol = np.max(orchestration_sound)

    normalization = np.max(data) / max_vol
    orchestration_sound[0] = orchestration_sound[0] * normalization
    orchestration_sound[1] = orchestration_sound[1] * normalization

    max_vol = np.max(target_sound)

    normalization = np.max(current_sample) / max_vol
    target_sound[0] = target_sound[0] * normalization
    target_sound[1] = target_sound[1] * normalization

    max_vol = np.max(output)

    normalization = np.max(together) / max_vol
    output[0] = output[0] * normalization
    output[1] = output[1] * normalization


    save = io.BytesIO()
    writearray = np.array([output[0], output[1]])
    sf.write(save, np.transpose(writearray), sr, format="wav")
    b64 = base64.b64encode(save.getvalue())
    orchfile = "data:audio/x-wav;base64," + b64.decode("ascii")
    save = io.BytesIO()
    writearray = np.array([target_sound[0], target_sound[1]])
    sf.write(save, np.transpose(writearray), sr, format="wav")
    b64 = base64.b64encode(save.getvalue())
    targetfile = "data:audio/x-wav;base64," + b64.decode("ascii")
    save = io.BytesIO()
    writearray = np.array([orchestration_sound[0], orchestration_sound[1]])
    sf.write(save, np.transpose(writearray), sr, format="wav")
    b64 = base64.b64encode(save.getvalue())
    onlyorchfile = "data:audio/x-wav;base64," + b64.decode("ascii")
    custom_id='search_inst'
    match_parts=match_inst.split(',')
    rslt = [
        [match_parts[0], match_parts[1], match_parts[2], int(match_parts[3])],
        onlyorchfile,
        targetfile,
        orchfile
        ]
    return rslt
    rslt= html.Div([html.Div([
                    html.H2('The matching instrument is: {} {} {} {}'.format(match_parts[0], match_parts[1], match_parts[2], pretty_midi.note_number_to_name(int(match_parts[3])))),
                        html.Div('search source(s) only'),
                      html.Audio(src=targetfile, controls=True, id='audio1{}'.format(custom_id)),
                        html.Div('matching instrument only, {} {} {} {}'.format(match_parts[0], match_parts[1], match_parts[2], pretty_midi.note_number_to_name(int(match_parts[3])))),
                      html.Audio(src=onlyorchfile, controls=True, id='audio2{}'.format(custom_id)),
                      html.Div('Both together: '),
                      html.Audio(src=orchfile, controls=True, id='audio3'.format(custom_id))])])
    ############# LISTENING

    return rslt

    @app.callback(
        Output("search_sources", "children"),
        [
            Input("add_to_search_button", "n_clicks"),
            Input("remove_last_button", "n_clicks"),
            Input("add_from_chord_app", "n_clicks"),
        ],
        [State("search_sources", "children"),
         State("instrument-input{}".format('three'), 'value'),
         State("dynamics-input{}".format('three'), 'value'),
         State("techs-input{}".format('three'), 'value'),
         State("notes-input{}".format('three'), 'value'),

         State({'type': 'inst{}'.format(''), 'index': ALL}, 'value'),
         State({'type': 'tech{}'.format(''), 'index': ALL}, 'value'),
         State({'type': 'dyn{}'.format(''), 'index': ALL}, 'value'),
         State({'type': 'note{}'.format(''), 'index': ALL}, 'value'),
         State({'type': 'target{}'.format(''), 'index': ALL}, 'value'),
         State({'type': 'onoff{}'.format(''), 'index': ALL}, 'value'),
        ]
    )
    def add_to_search(n_clicks, klikki1, klikki2, s_sources, inst, dyn, tech, note, chord_inst, chord_techs, chord_dyn, chord_notes, chord_target, chord_onoff):
        ctx = dash.callback_context  # Callback context to recognize which input has been triggered
        if not ctx.triggered:
            raise PreventUpdate
        else:
            input_id = ctx.triggered[0]['prop_id'].split('.')[0]
        if input_id=="add_to_search_button":
            if not s_sources:
                s_sources=[]
            s_sources.append(html.Div(inst+", "+tech+", "+dyn+", "+pretty_midi.note_number_to_name(int(note))))
        if input_id=="remove_last_button":
            if not s_sources:
                s_sources=[]
            else:
                s_sources.pop()
        if input_id=="add_from_chord_app":
            s_sources = []
            for i in range(len(chord_inst)):
                if chord_onoff[i] and not chord_target[i]:
                    s_sources.append(html.Div('{}, {}, {}, {}'.format(chord_inst[i], chord_techs[i], chord_dyn[i], pretty_midi.note_number_to_name(int(chord_notes[i])))))
        return s_sources

    @app.callback(
        Output("tech_data-input", "value"),
        [
            Input("select_all_techs", "n_clicks"),
            Input("invert_tech_selection", "n_clicks"),
            Input("clear_tech_selection", "n_clicks"),

            ],
        [
            State("tech_data-input", 'options'),
            State("tech_data-input", 'value'),
            ]
        )
    def select_techniques(sel_all, sel_inv, sel_clear, state, state2):
        ctx = dash.callback_context  # Callback context to recognize which input has been triggered
        # techs = [tech['label'] for tech in state]
        if not ctx.triggered:
            raise PreventUpdate
        else:
            input_id = ctx.triggered[0]['prop_id'].split('.')[0]
        if input_id=="select_all_techs":
            value = [tech['label'] for tech in state]
        if input_id=='clear_tech_selection':
            value=[]
        if input_id=='invert_tech_selection':
            value = ['normal']
        return value

    @app.callback(
        Output("instrument_select_outer", "children"),
        [
            Input("quick-select-input", "value"),
            Input("select_all", "n_clicks"),
            Input("invert_selection", "n_clicks"),
            Input("clear_selection", "n_clicks"),

        ],
        [
            State("instrument_data-input", 'value'),
        ]
    )
    def select_outer(q_sel, sel_all, sel_inv, sel_clear, state):
        ctx = dash.callback_context  # Callback context to recognize which input has been triggered
        value=[]
        if not ctx.triggered:
            raise PreventUpdate
        else:
            input_id = ctx.triggered[0]['prop_id'].split('.')[0]
        print(input_id)
        if input_id=="select_all":
            value = [instrument for instrument in orchestra.keys()]
        if input_id=='clear_selection':
            value=[]
        if input_id=='invert_selection':
            value = [instrument for instrument in orchestra.keys() if instrument not in state]
        if input_id=='quick-select-input':
            #if q_sel=='all_sustaining':
                # value=[instrument for instrument in orchestra.keys() if instrument not in percussion+['piano', 'guitar']+['baritone_generic', 'soprano_generic', 'tenor_generic']]
            if q_sel=='only_strings':
                value = ['violin', 'viola', 'cello', 'double_bass', 'solo_violin', 'solo_viola','solo_cello', 'solo_double_bass']
            #if q_sel=='only_percussion':
                # value = percussion
            if q_sel=='only_voices':
                value = ['baritone_generic', 'soprano_generic', 'tenor_generic']

        outer = dbc.FormGroup(
            [
                dbc.Label("Choose instruments to search from"),
                dbc.Checklist(
                    options=[{'label': instrument, 'value': instrument} for instrument in orchestra.keys()],
                    value=value,
                    id="instrument_data-input",
                    inline=True
                ),
            ]
        )
        return outer

    def compare_maskings(data, mfcc, peaks, i1, i2):
        fig_config = {
            'displayModeBar': False
        }
        fig_layout = {
            #'width': '29%',
            'plot_bgcolor': 'black',
            'paper_bgcolor': 'black',
            'font': {
                'color': 'white'
            },
            'xaxis': {'title': ''},
            "title": "Mfcc vectors",
            'yaxis': {'title': 'mfcc values'},
        }

        layout2d = {
            #'width': '70%',
            #'height': '400',
            'plot_bgcolor': 'black',
            'paper_bgcolor': 'black',
            'font': {
                'color': 'white'
            },
            "title": "Spectral features",
            'xaxis': {'title': 'Frequency in Hz', 'type': 'log'},
            'yaxis': {'title': 'dB (SPL)', 'showgrid': False, 'zeroline': False},
        }
        mfcc_vector1_trace = {
            "mode": "lines",
            "type": "scatter",
            "y": mfcc[0][1:],
            "name": "mfcc vector of {}".format(i1),
            "line": {'color': 'yellow'},
        }
        mfcc_vector2_trace = {
            "mode": "lines",
            "type": "scatter",
            "y": mfcc[1][1:],
            "name": "mfcc vector of {}".format(i2),
            "line": {'color': 'purple'},
        }
        trace1 = {
            "mode": "markers",
            "type": "scatter",
            "x": peaks[0][0],
            "y": peaks[0][1],
            "name": "{} peaks".format(i1),
            "marker": {'symbol': 'x', 'size': 12, 'color': 'green'}, #'colorscale': colorscale, 'line': {'width': 0}},
        }
        trace2 = {
            "mode": "markers",
            "type": "scatter",
            "x": peaks[1][0],
            "y": peaks[1][1],
            "name": "{} peaks".format(i2),
            "marker": {'symbol': 'o', 'size': 12, 'color': 'olive'},  # 'colorscale': colorscale, 'line': {'width': 0}},
        }
        x_axis= constants.threshold[:, 0]
        gra = dcc.Graph(figure={'data': [
            go.Scatter(x=x_axis, mode='lines', y=data[0], name='{} curve'.format(i1), line={'color':'sienna'},
                       #hovertemplate='%{y} percent of target peaks masked by orchestration',
                       fill='tozeroy',),
                       #fillcolor='sienna'),
            go.Scatter(x=x_axis, mode='lines', y=data[1], name='{} curve'.format(i2), line={'color': 'moccasin'},
                       # hovertemplate='%{y} percent of target peaks masked by orchestration',
                       fill='tozeroy',),
                       #fillcolor='moccasin'),
            trace1, trace2], 'layout': layout2d}, config=fig_config,)  # , config=fig_config)
        #gra =html.Div(['Peaks and masking graph comparison', gra], )
        mfcc_fig = go.Figure(data=[mfcc_vector1_trace, mfcc_vector2_trace], layout=fig_layout)
        mfcc_fig = dcc.Graph(figure=mfcc_fig, config=fig_config)
        return [gra, mfcc_fig]


    return html.Div([start_box, result_box])

#app.layout = search(app, orchestra)

#PORT = 8050
#ADDRESS = '127.0.0.1'
#if __name__ == '__main__':
#    app.run_server(port=PORT, host=ADDRESS, debug=True)
