import * as React from 'react';
import Plot from 'react-plotly.js';
import Orchestration from './Orchestration';
import Masking from './Masking';
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

export default function Graphs(props) {
    if(props.data.length<2){
      return null
    }
    const gaudeData = [
        {
          domain: { x: [0, 1], y: [0, 1] },
          value: props.data[2].var_coeff_graph,
          title: { text: "Orch. timbre homogeneity" },
          type: "indicator",
          mode: "gauge+number",
          gauge: {
            axis: { range: [null, 100] },
          }
        }
      ];
    const gaugeLayout = { width:350, margin: { t: 0, b: 0 }, plot_bgcolor: "#fffef0",paper_bgcolor: "#fffef0" };

    //console.log(props)
    const figConfig = props.data[2].fig_config
    const graphData = props.data[2].msking_graph.data
    const graphLay = props.data[2].msking_graph.layout
    graphLay.width = window.innerWidth-380
    return (
        <div>

        <Grid
                  style={{marginTop:0.5}}
          container
          direction="row"
          justifyContent="center"
          alignItems="center"
          spacing={0.5}>

  <Grid item xs={6} md={6}>
    <Item style={{height:452, backgroundColor:"#fffef0"}}>
        <Typography>
            Orchestration at clicked point
        </Typography>
        <div style={{backgroundColor: "rgba(0,255,0,0.3)", display:"inline"}}>Target</div> 
  <div style={{backgroundColor: "rgba(255,0,0,0.5)", display:"inline"}}> Heaviest masker</div>
  <div style={{backgroundColor: "rgba(255,255,0,0.5)", display:"inline"}}> 2nd masker</div>
  <div style={{backgroundColor: "rgba(255,0,255,0.5)", display:"inline"}}> 3rd masker </div>
    <Orchestration 
            notes={props.data[4].notes}
            instruments={props.data[4].instruments}
            target={props.data[4].target}
            target_color="green"
            highlights={props.data[4].highlights}
            width={200}
            text_space={200}
            />
    </Item>
  </Grid>
  <Grid item xs={6} md={6}>
    <Item style={{height:452, backgroundColor:"#fffef0"}}>
        <Typography>
            Spectral centroid at clicked point
        </Typography>
    <Orchestration 
            notes={props.data[2].centroid_graph.notes}
            instruments={props.data[2].centroid_graph.markings}
            target={[]}
            width={150}
            text_space={200}
            />
    </Item>
  </Grid>
</Grid>

<Grid
                  style={{marginTop:0.5}}
          container
          direction="row"
          justifyContent="center"
          alignItems="center"
          spacing={0.5}>
  <Grid item xs={6} md={6}>
    <Item style={{height:452, backgroundColor:"#fffef0"}}>
        <Typography>
            Timbre distance data
        </Typography>
        <Typography>
            Target timbre distance from orchestration: {props.data[2].distance_graph}/100
        </Typography>
        <Plot
            data={gaudeData}
            layout={gaugeLayout}
            config={figConfig}
            
        />
    </Item>
  </Grid>
  <Grid item xs={6} md={6}>
    <Item style={{height:452, backgroundColor:"#fffef0", verticalAlign: "center"}}>
    <Typography>
            Masking staff graph
        </Typography>
        <br/>
        <br/>
        <Masking
        masking_notevalues={props.data[2].masking_score.masking_notevalues}
        masking_colors={props.data[2].masking_score.masking_colors}
        masking_notesizes={props.data[2].masking_score.masking_notesizes}
        target_notevalues={props.data[2].masking_score.target_notevalues}
        target_colors={props.data[2].masking_score.target_colors}
        target_notesizes={props.data[2].masking_score.target_notesizes}
        />
    </Item>
    </Grid>
  </Grid>

  <Grid
          style={{marginTop:0.5}}
          container
          direction="row"
          justifyContent="left"
          alignItems="left"
          spacing={0.5}>
  <Grid item xs={12} md={12}>
    <Item>
    <Plot
            data={graphData}
            layout={{...graphLay, width:window.innerWidth-50}}
            config={figConfig}
            
        />
    </Item>
</Grid>
</Grid>
          

          <Grid
          style={{marginTop:0.5}}
          container
          direction="row"
          justifyContent="center"
          alignItems="center"
          spacing={0.5}>
                            <Grid item xs={4} md={4}>
                        <Item style={{height:452, backgroundColor:"#fffef0"}}>
                        <Typography>
            Summary of the current orchestration
        </Typography>
        <br/>
        <br/>
                        <Typography>
                          {props.data[2].summary}
                      </Typography>
                      </Item>
                  </Grid>
                <Grid item xs={8} md={8}>
        <Item>
        <Plot
            data={props.data[2].mfcc_graph.data}
            layout={{...props.data[2].mfcc_graph.layout, width:(window.innerWidth/1.5)-50}}
            config={figConfig}
            width={200}
        />
        </Item>
              </Grid>
        

                  </Grid>
      </div>
    )
}