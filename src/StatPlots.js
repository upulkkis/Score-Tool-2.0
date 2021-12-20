import * as React from 'react';
import Plot from 'react-plotly.js';
import Helps from './help/helps';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
import Paper from '@mui/material/Paper';
const Item = styled(Paper)(({ theme }) => ({
    ...theme.typography.body2,
    backgroundColor: '#fffef0',
    padding: theme.spacing(1),
    textAlign: 'center',
    color: theme.palette.text.secondary,
  }));

  export default function StatPlots({ predictions, bars, threeD, graphs }) {

    const height = 150
    const legendY = 0.92

    let xAxis = Object.keys(predictions)
    xAxis = xAxis.map(val => parseFloat(val)).sort(function(a, b) {return a - b})
    console.log(xAxis)
    const yAxis = xAxis.map(x=>predictions[x]===-1 ? 0 : 100-predictions[x])

    const targetPredictionTrace = {
        "mode": "lines",
        "type": "scatter",
        "y": yAxis,
        "x": xAxis,
        "name": "Target audibility Prediction",
        "line": {'color': 'purple'},
        showlegend: true
    }

    const barlineTrace = {
        "mode": "lines+text",
        "type": "scatter",
        "y": [].concat(...bars.map(x => [0, 100, 0])),
        "x": [].concat(...bars.map(x => [x, x, x])),
        "text": [].concat(...bars.map((x, i) => ["", i+1, ""])),
        "textposition": "middle right",
        "name": "Barlines",
        "line": {'color': 'rgba(120,120,120,0.3)'},
        showlegend: false
    }
    
    const barlineTrace2 = {
        "mode": "text",
        "type": "scatter",
        "y": bars.map(x => 200),
        "x": bars,
        "text": bars.map((x, i) => i+1),
        "textposition": "middle right",
        "name": "Barlines",
        "line": {'color': 'rgba(120,120,120,0.3)'},
        showlegend: false
    }

    const fig_layout = {
        'plot_bgcolor': "#fffef0",
        'paper_bgcolor': "#fffef0",
        'font': {
            'color': 'black'
        },
        "title": "Audibility Prediction",
        'xaxis': {'title':  'Bar', tickfont: {color:"rgba(0,0,0,0)"}},
        'yaxis': {'title':  'Prediction'},
        width:window.innerWidth-50, 
        height: height,
        margin:{l:0, r:0, t:0, b:0}, 
        showlegend: true,
        legend:{
            yanchor:"top",
            y:legendY,
            xanchor:"left",
            x:0.01
        }
    }

    const fig_layout_cent = {
        'plot_bgcolor': "#fffef0",
        'paper_bgcolor': "#fffef0",
        'font': {
            'color': 'black'
        },
        "title": "Centroid",
        'xaxis': {'title':  'Bar', tickfont: {color:"rgba(0,0,0,0)"}},
        'yaxis': {'title':  'Centroid'},
        width:window.innerWidth-50, 
        height: height,
        margin:{l:0, r:0, t:0, b:0}, 
        showlegend: true,
        legend:{
            yanchor:"top",
            y:legendY,
            xanchor:"left",
            x:0.01
        }
    }

    const centroids_t = {
        "mode": "lines",
        "type": "scatter",
        "y": xAxis.map(x=>graphs.centroid[x] ? graphs.centroid[x][1] : 0),
        "x": xAxis,
        "name": "Target spectral centroid",
        "line": {'color': 'green'},
        showlegend: true
    }

    const centroids_0 = {
        "mode": "lines",
        "type": "scatter",
        "y": xAxis.map(x=>graphs.centroid[x] ? graphs.centroid[x][0] : 0),
        "x": xAxis,
        "name": "Orchestration spectral centroid",
        "line": {'color': 'red'},
        showlegend: true
    }

    const fig_layout_distance = {
        'plot_bgcolor': "#fffef0",
        'paper_bgcolor': "#fffef0",
        'font': {
            'color': 'black'
        },
        "title": "Distance",
        'xaxis': {'title':  'Bar', tickfont: {color:"rgba(0,0,0,0)"}},
        'yaxis': {'title':  'Distance'},
        width:window.innerWidth-50, 
        height: height,
        margin:{l:0, r:0, t:0, b:0}, 
        legend:{
            yanchor:"top",
            y:legendY,
            xanchor:"left",
            x:0.01
        }
    }

    const dist = {
        "mode": "lines",
        "type": "scatter",
        "y": xAxis.map(x=>graphs.distance[x]),
        "x": xAxis,
        "name": "Target timbre distance from orchestration",
        "line": {'color': 'lime'},
        showlegend: true
    }

    const fig_layout_homog = {
        'plot_bgcolor': "#fffef0",
        'paper_bgcolor': "#fffef0",
        'font': {
            'color': 'black'
        },
        "title": "Homogeneity",
        'xaxis': {'title':  'Bar', tickfont: {color:"rgba(0,0,0,0)"}},
        'yaxis': {'title':  'Homogeneity', 'zeroline':false},
        width:window.innerWidth-50, 
        height: height,
        margin:{l:0, r:0, t:0, b:0}, 
        showlegend: true,
        legend:{
            yanchor:"top",
            y:1-legendY,
            xanchor:"left",
            x:0.01
        }
    }

    const homog = {
        "mode": "lines",
        "type": "scatter",
        "y": xAxis.map(x=>graphs.homog[x]),
        "x": xAxis,
        yaxis: {'zeroline':false},
        "name": "Orchestration timbre homogeneity",
        "line": {'color': 'olive'},
        showlegend: true
    }

    const fig_config = {
        'displayModeBar': false
    }

    //3d GRAPH:
    const aspect = Math.round(window.innerWidth /200)
    const threeD_layout = {
        type: "surface",
        'plot_bgcolor': 'fffef0',
        'paper_bgcolor': 'fffef0',
        'font': {
            'color': 'black'
        },
        'scene': { 
            "aspectratio": {"x": 1, "y": aspect, "z": 0.5},
            
            'camera': {
                projection:{type:"ortographic"},
                eye:{x:2.8, y:0.5, z:2.85},
                uirevision: true
            },
            'xaxis': {title:  'Frequency', type:"log"},
            'yaxis': {
                title:  'Bar',
                tickmode: 'array',
                tickvals: bars,
                ticktext: bars.map((x,i)=>i+1)
            },
            'zaxis': {title:  'Decibels'},
        },
        width:window.innerWidth-50, 
        margin:{l:0, r:0, t:0, b:0}, 
    }
    const threeXaxis = Object.keys(threeD.orchestration).sort()
    const trace3d_orch = {
        type: 'surface',
        "name": "Masking curve",
        x:threeD.locs,
        y:threeXaxis,
        z:threeXaxis.map(x=>threeD.orchestration[x]),
        opacity:1,
        colorscale: 'Greys', 
        showscale:false,
        showlegend: true,
    }
    
    const trace3d_tar = {
        type: 'surface',
        "name": "Target peaks",
        x:threeD.locs,
        y:threeXaxis,
        z:threeXaxis.map(x=>threeD.target[x]),
        opacity:1,
        // colorscale: 'Greens', 
        showscale:false,
        showlegend: true
    }


    return (
        <div>
            <br/>
            <Typography variant="h3"> Analytical graphs of score: </Typography>
            <br/>
            <Typography> Audibility prediction, higher means better audibility: </Typography>
        <Plot
        data={[targetPredictionTrace, barlineTrace]}
        layout={fig_layout}
        config={fig_config}
        />
        <Typography> Spectral centroids, higher means brighter timbre: </Typography>
                <Plot
        data={[centroids_0, centroids_t, barlineTrace2]}
        layout={fig_layout_cent}
        config={fig_config}
        />
        <Typography> Target timbre distance, higher means not similar with orchestration: </Typography>
                <Plot
        data={[dist, barlineTrace]}
        layout={fig_layout_distance}
        config={fig_config}
        />
        <Typography> Orchestration homogeneity, higher means more homogenous: </Typography>
                <Plot
        data={[homog, barlineTrace2]}
        layout={fig_layout_homog}
        config={fig_config}
        />
        <Typography> Orchestration masking and target peaks in 3d, more colored peaks means more audibility: </Typography>
    <Plot
    data={[trace3d_orch, trace3d_tar]}
    layout={threeD_layout}
    config={fig_config}
    />
    </div>
    )

  }