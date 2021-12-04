import * as React from 'react';
import { Slider } from '@mui/material';
const minDistance = 1;
export default function RespSlider(props) { 
    const [state, setState] = React.useState({measureRange:[1,2], maxMeasure:2})
    React.useEffect(()=>{
        setState(state=>({...state, measureRange:props.range, maxMeasure:props.max}))
    },[props]
    )
    const handleChange = (event, newValue, activeThumb) => {
        if (!Array.isArray(newValue)) {
            return;
          }
      let val = newValue
      /*
          if (activeThumb === 0) {
            val = [Math.min(newValue[0], state.measureRange[1] - minDistance), state.measureRange[1]]
          } else {
            val = [state.measureRange[0], Math.max(newValue[1], state.measureRange[0] + minDistance)]
          }
          */
        setState(state=>({...state, measureRange:val}))
    }
    return(
        <Slider
        style={props.style}
        value={state.measureRange}
        min={1}
        max={state.maxMeasure}
        step={1}
        marks={true}
        onChange={handleChange}
        onChangeCommitted={props.measureHandleChange}
        valueLabelDisplay="auto"
        disableSwap
      />
    )
}