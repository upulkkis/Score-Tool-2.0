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

  export default function StatPlots({ predictions, bars }) {


    const xAxis = Object.keys(predictions).sort()
    const yAxis = xAxis.map(x=>predictions[x]===-1 ? 0 : 100-predictions[x])

    const targetPredictionTrace = {
        "mode": "lines",
        "type": "scatter",
        "y": yAxis,
        "x": xAxis,
        "name": "Audibility Prediction",
        "line": {'color': 'gray'},
    }

    const barlineTrace = {
        "mode": "lines",
        "type": "scatter",
        "y": [].concat(...bars.map(x => [0, 100, 0])),
        "x": [].concat(...bars.map(x => [x, x, x])),
        "text": [].concat(...bars.map((x, i) => ["", i, ""])),
        "name": "Barlines",
        "line": {'color': 'rgba(120,120,120,0.3)'},
    }

    const fig_layout = {
        'plot_bgcolor': "#fffef0",
        'paper_bgcolor': "#fffef0",
        'font': {
            'color': 'black'
        },
        "title": "Audibility Prediction",
        'xaxis': {'title':  'Whole notes from start'},
        'yaxis': {'title':  'Prediction'}
    }

    const fig_config = {
        'displayModeBar': false
    }

    return (
        <Plot
        data={[targetPredictionTrace, barlineTrace]}
        layout={fig_layout}
        config={fig_config}
        
    />
    )

  }