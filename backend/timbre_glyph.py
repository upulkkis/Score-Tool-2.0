#import plotly.graph_objects as go # or plotly.express as px

def make_glyph(orch_mfcc, target_mfcc, plot_color, paper_color, orchestration_glyph_data=[], name1='orchestration', name2='target'):
    coordinates=['Fundamental strength',
                 'High formants _ old',
                 #'Near high formants',
                 'high formants', # old near high
                 'Middle high formants'
                 'high middle formants',
                 'above middle formants',
                 'middle formants',
                 'Below middle formants',
                 'low middle formants',
                 #'Middle low formants',
                 'low formants', #old middle low
               'Near low formants',
                 'Low formants']
    background={
        'type':'barpolar',
        #'r':[-130,0],
        'r':[-2300,0],
        'width':360,
        'marker_color':['pink', 'pink'],
        'opacity':0.3,
        'showlegend': False,
        'hoverinfo': 'none',
        'theta':['timbre strength'],
        }
    trace1={
        'type':'scatterpolar',
        'r': orch_mfcc,
        'name': name1,
        'theta':coordinates,
        'fill':'toself',
        'mode':'none'
    }
    trace2={
        'type':'scatterpolar',
        'r':target_mfcc,
        'name':name2,
        'theta':coordinates,
        'fill':'toself',
        'mode':'none'
    }

    orch_trace_data=[]
    #print('orch_data: {}'.format(orchestration_glyph_data))
    if len(orchestration_glyph_data)>0:
        for i in range(len(orchestration_glyph_data['mfccs'])):
            orch_trace_data.append(
                {
                    'type': 'scatterpolar',
                    'r': orchestration_glyph_data['mfccs'][i],
                    'name': orchestration_glyph_data['instruments'][i],
                    'theta': coordinates,
                    'fill': 'toself',
                    'mode': 'none',
                    'visible': 'legendonly',
                }
            )

    pol_layout={
        'title': 'Timbre glyph (from mfcc)',
        'font': {'color':'gray'},
        'plot_bgcolor': plot_color,
        'paper_bgcolor': paper_color,
        'polar': {
        'bgcolor':"#fffef0",
        'radialaxis':{
            #'range':[-130, 130],
            'range':[-2300, 2300],
            'visible':True,
            'showline':False,
            'nticks':1,
    },
        'angularaxis':{
            'visible':True,
            'showline':False,
            'showgrid':False,
            'nticks':4,
            'color':'gray',
    },
    },
                'showlegend':True
    }
    return {"data": [background, trace1, trace2], "layout":pol_layout}
    #fig= go.Figure(data=[background, trace1, trace2]+orch_trace_data, layout=pol_layout)
    #print("orch_mfcc")
    #print(orch_mfcc)
    #return fig