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

  export default function CompareGraphs({data}) {

    if(data.length<2){
        return null
      }

return(
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
          Overtone structure of {data[3].instruments[0]}
      </Typography>
  <Orchestration 
          notes={data[1].notes}
          instruments={data[1].instruments}
          target={data[1].target}
          target_color="red"
          width={200}
          text_space={200}
          />
  </Item>
</Grid>

<Grid item xs={6} md={6}>
  <Item style={{height:452, backgroundColor:"#fffef0"}}>
      <Typography>
          Overtone structure of {data[3].instruments[1]}
      </Typography>
  <Orchestration 
          notes={data[2].notes}
          instruments={data[2].instruments}
          target={data[2].target}
          target_color="red"
          width={200}
          text_space={200}
          />
  </Item>
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
          Spectral centroids
      </Typography>
  <Orchestration 
          notes={data[3].notes}
          instruments={data[3].instruments}
          target={[]}
          width={150}
          text_space={200}
          />
  </Item>
</Grid>
<Grid item xs={6} md={6}>
      <Item>
      <Plot
          data={data[0][1].data}
          layout={
            {...data[0][1].layout, width:(window.innerWidth/2)-50}
          }
          config={{displayModeBar: false}}
          width={200}
      />
      </Item>
            </Grid>
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
          data={data[0][0].data}
          layout={
            {...data[0][0].layout, width:window.innerWidth-50}
          }
          config={{displayModeBar: false}}
      />
  </Item>
</Grid>


        </Grid>

    </div>
)
}
