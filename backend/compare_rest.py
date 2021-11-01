import dash_core_components as dcc
import dash_html_components as html
import dash_bootstrap_components as dbc
import dash_admin_components as dac
from dash.dependencies import Input, Output, State
import plotly.graph_objs as go
from helpers import constants, hertz_to_microtone
import score_component as sc


plot_color="#fffef0"
paper_color="#fffef0"

def compare(data, orchestra):

    def compare_maskings(data, mfcc, peaks, i1, i2):
        fig_config = {
            'displayModeBar': False
        }

        layout2d = {
            #'width': '70%',
            #'height': '400',
            'plot_bgcolor': plot_color,
            'paper_bgcolor': paper_color,
            'font': {
                'color': 'black'
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
        x_axis = constants.threshold[:, 0]
        trace00 = {
            "mode": "lines",
            "type": "scatter",
            "x": x_axis,
            "y": data[0],
            "name":'{} curve'.format(i1),
            "line": {'color':'sienna'},
            "fill": 'tozeroy'
            }
        trace01 = {
            "mode": "lines",
            "type": "scatter",
            "x": x_axis,
            "y": data[1],
            "name":'{} curve'.format(i2),
            "line": {'color':'moccasin'},
            "fill": 'tozeroy'
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
        gra = {'data': [trace00, trace01, trace1, trace2], 'layout': layout2d}
        #gra =html.Div(['Peaks and masking graph comparison', gra], )
        #mfcc_fig = go.Figure(data=[mfcc_vector1_trace, mfcc_vector2_trace], layout=fig_layout)
        import timbre_glyph as mels
        mfcc_fig = mels.make_glyph(mfcc[0], mfcc[1], plot_color, paper_color, [], name1=i1, name2=i2)
        #mfcc_fig = dcc.Graph(figure=mfcc_fig, config=fig_config)
        return [gra, mfcc_fig]
    def truncate(peaks, partials):
        new_peaks=[[],[]]
        if len(peaks[0])>partials:
            new_peaks[0]=peaks[0][:partials]
            new_peaks[1] = peaks[1][:partials]
            return new_peaks
        return peaks

    i1, t1, d1, n1 = data[0][0], data[0][1], data[0][2], data[0][3]
    i2, t2, d2, n2 = data[1][0], data[1][1], data[1][2], data[1][3]
    print(data)
    i1_peaks = orchestra[i1][t1][d1][n1]['peaks']
    i1_masks = orchestra[i1][t1][d1][n1]['masking_curve']
    i1_mfcc = orchestra[i1][t1][d1][n1]['mfcc']
    i1_cent = orchestra[i1][t1][d1][n1]['centroid']

    i2_peaks = orchestra[i2][t2][d2][n2]['peaks']
    i2_masks = orchestra[i2][t2][d2][n2]['masking_curve']
    i2_mfcc = orchestra[i2][t2][d2][n2]['mfcc']
    i2_cent = orchestra[i2][t2][d2][n2]['centroid']

    i1_p = truncate(i1_peaks, 20)
    i2_p = truncate(i2_peaks, 20)

    i1_notes = [hertz_to_microtone.convert(val) for val in i1_p[0]]
    i2_notes = [hertz_to_microtone.convert(val) for val in i2_p[0]]

    i1_cent = hertz_to_microtone.convert(i1_cent)
    i2_cent = hertz_to_microtone.convert(i2_cent)

    #Find the loudest partial in each peak list
    loudest={'one_db':0, 'one_idx':0, 'two_db':0, 'two_idx':0}
    for i in range(len(i1_p[1])):
        if i1_p[1][i]>loudest['one_db']:
            loudest['one_db']=i1_p[1][i]
            loudest['one_idx'] = i
    for i in range(len(i2_p[1])):
        if i2_p[1][i]>loudest['two_db']:
            loudest['two_db'] = i2_p[1][i]
            loudest['two_idx'] = i

    #Make the db-readings look comparable
    # for i in range(len(i1_p[1])):
    #     print(i1_p[1][i])
    #     i1_p[1][i] = int(i1_p[1][i]-loudest['one_db'])
    # for i in range(len(i2_p[1])):
    #     i2_p[1][i] = int(i2_p[1][i] - loudest['two_db'])

    i1_ann = [str(int(i-loudest['one_db'])) + " db" for i in i1_p[1]]
    i2_ann = [str(int(i-loudest['two_db'])) + " db" for i in i2_p[1]]
    i1_ann[loudest['one_idx']] = 'loudest'
    i2_ann[loudest['two_idx']] = 'loudest'

    i1_score = html.Div([html.Div('Overtones of {}, loudest partial = red'.format(i1), style={'color':'black', 'height':20}),
        sc.Orchestration(notes=i1_notes, instruments=i1_ann, target=[loudest['one_idx']], width=200)], style={'backgroundColor':'#eed',
                                                                                            'display':'inline-block'})
    i2_score = html.Div([html.Div('Overtones of {}, loudest partial = red'.format(i2), style={'color':'black', 'height':20}),
        sc.Orchestration(notes=i2_notes, instruments=i2_ann, target=[loudest['two_idx']], width=200)], style={'backgroundColor':'#eed',
                                                                                            'display': 'inline-block'})
    score_centroids = html.Div([html.Div('Spectral centroids of {} and {}'.format(i1, i2), style={'color':'black', 'height':20}),
        sc.Orchestration(notes=[i1_cent, i2_cent], instruments=[i1, i2], target=[], width=100)], style={'backgroundColor':'#eed',
                                                                                      'display': 'inline-block'})
    i1_score = {"notes": i1_notes, "instruments": i1_ann, "target":[loudest["one_idx"]]}
    i2_score = {"notes": i2_notes, "instruments": i2_ann, "target":[loudest["two_idx"]]}
    centroids = {"notes":[i1_cent, i2_cent], "instruments":[i1, i2], "target":[]}



    # print('Compare values: {}, and {}'.format(i1_mfcc, i2_mfcc))
    mgraph = compare_maskings([i1_masks, i2_masks], [i1_mfcc, i2_mfcc], [i1_peaks, i2_peaks], i1, i2)
    #row=dbc.Row([dbc.Col(i1_score, width=3), dbc.Col(i2_score, width=3), dbc.Col(score_centroids, width=2), dbc.Col(mgraph[1], width=4)])
    #i2_mgraph = compare_maskings(i2_masks, i2_mfcc, i2_peaks, 'instrument 2')
#except:
#    i1_score = 'Check notes, dynamics or techniques'
    #i2_score = 'Check notes, dynamics or techniques'
#    print('out of range')

    return [mgraph, i1_score, i2_score, centroids]

