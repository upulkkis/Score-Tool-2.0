import React, { useState } from 'react';
import { DBinstruments } from '../instruments';
import Select from '@mui/material/Select';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Switch from '@mui/material/Switch';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Box } from '@mui/material';
import { Slider } from '@mui/material';
import { IconButton } from '@mui/material';
import Helps from '../help/helps';
import { Tooltip } from '@mui/material';

export default function InstModify(props){

    const [state, setState] = useState({
        idx:props.idx,  
        scoreNames: props.row[0], 
        scoreTechs: props.row[1], 
        scoreDyns: props.row[2], 
        scorePitch: props.row[3],
        scoreTgt: props.row[4], 
        scoreOnoff: props.row[5], 
        scoreIdx: props.row[6], 
        scoreMicro: 0,
        color: props.color,
        scoreModify: 0,
    })



    const instChange = (idx, event) => {
        /*
        let scoreNames = {...state.scoreNames}
        let item = {...scoreNames[idx]}
        item = event.target.value
        scoreNames[idx] = item
        */ 
        setState(state=> ({...state, scoreNames:event.target.value}))
        //setState(state => state.scoreNames[idx] = event.target.value)
      }
      const techChange = (idx, event) => {
        setState(state => ({...state, scoreTechs:event.target.value}))
      }
      const dynChange = (idx, event) => {
        let newDyn = "mf"
        if(state.scoreDyns==="mf"){newDyn="f"}else if(state.scoreDyns==="f"){newDyn="p"}
        setState(state => ({...state, scoreDyns:newDyn}))
        props.onChange({
          idx: state.idx, 
          row: [state.scoreNames, state.scoreTechs, newDyn, state.scorePitch, state.scoreTgt, state.scoreOnoff, state.scoreIdx, state.scoreMicro]
  })
      }
      const modChange = (idx, event) => {
        let newMod = 0
        if(state.scoreModify===0){newMod=-12}else if(state.scoreModify===-12){newMod=12}
        setState(state => ({...state, scoreModify:newMod, scorePitch:props.row[3]+newMod}))
        props.onChange({
          idx: state.idx, 
          row: [state.scoreNames, state.scoreTechs, state.scoreDyns, props.row[3]+newMod, state.scoreTgt, state.scoreOnoff, state.scoreIdx, state.scoreMicro]
  })
      }
      const tgtChange = (idx, event) => {
        setState(state => ({...state, scoreTgt: !state.scoreTgt}))
        props.onChange({
          idx: state.idx, 
          row: [state.scoreNames, state.scoreTechs, state.scoreDyns, state.scorePitch, !state.scoreTgt, state.scoreOnoff, state.scoreIdx, state.scoreMicro]
  })
      }
      const onoffChange = (idx, event) => {
        setState(state => ({...state, scoreOnoff:!state.scoreOnoff}))
        props.onChange({
          idx: state.idx, 
          row: [state.scoreNames, state.scoreTechs, state.scoreDyns, state.scorePitch, state.scoreTgt, !state.scoreOnoff, state.scoreIdx, state.scoreMicro]
  })
      }
      
      let modify = []
      if (state.scoreModify===-12){
        modify = <div onClick={modChange} style={{backgroundColor: "rgba(123,30,30,0.3)", borderRadius: 10, padding: 3, textAlign: "center"}}>-12</div>
      } else if (state.scoreModify===12){
        modify = <div onClick={modChange} style={{backgroundColor: "rgba(30,123,30,0.3)", borderRadius: 10, padding: 3, textAlign: "center"}}>12</div>
      } else if (state.scoreModify===0){
        modify = <div onClick={modChange} style={{backgroundColor: "rgba(30,30,30,0.3)", borderRadius: 10, padding: 3, textAlign: "center"}}>0</div>
      }

      const handleMicro  = (event, newValue) => {
        setState(state => ({...state, scoreMicro:newValue}))
      }
      const handleCommit  = (event, newValue) => {
        props.onChange({
          idx: state.idx, 
          row: [state.scoreNames, state.scoreTechs, state.scoreDyns, state.scorePitch, state.scoreTgt, state.scoreOnoff, state.scoreIdx, state.scoreMicro]
                    })
      }
      const zeroClick = () => setState(state => ({...state, scoreMicro:0}))
      const selectMicrotone = () => {
        return (
          <Box sx={{ width: 60, height: 15, verticalAlign: "top", marginTop: -2}}>
            <Stack spacing={1} direction="row" sx={{ mb: 1 }} alignItems="center">
            <img src={"/flat.png"} height="15"/>
              <Slider valueLabelDisplay="auto" aria-label="tune"  size="small" min={-0.49} step={0.01} max={0.49} value={state.scoreMicro} onChangeCommitted={handleCommit} onChange={handleMicro} />
              <img src={"/sharp.png"} height="15"/>
            </Stack>
          </Box>
        );
      }

return(
    <tr>
      <Tooltip followCursor title={<Helps help="AnScorenames"/>} disableHoverListener={!props.help} sx={{zIndex:99999}}>
    <td key={"scor"+state.idx} style={{backgroundColor:state.color}}>{state.scoreNames}</td>
    </Tooltip>
    <Tooltip followCursor title={<Helps help="AnTech"/>} disableHoverListener={!props.help} sx={{zIndex:99999}}>
    <td key={"tec"+state.idx}>{state.scoreTechs}</td>
    </Tooltip>
    <Tooltip followCursor title={<Helps help="AnDyn"/>} disableHoverListener={!props.help} sx={{zIndex:99999}}>
    <td key={"dy"+state.idx}><div onClick={dynChange} style={{backgroundColor: "rgba(123,200,30,0.3)", borderRadius: 10, padding: 3, textAlign: "center"}}> {state.scoreDyns} </div></td>
    </Tooltip>
    <Tooltip followCursor title={<Helps help="AnMicro"/>} disableHoverListener={!props.help} sx={{zIndex:99999}}>
    <td key={"micro"+state.idx}>{selectMicrotone()}</td>
    </Tooltip>
    <Tooltip followCursor title={<Helps help="AnTgt"/>} disableHoverListener={!props.help} sx={{zIndex:99999}}>
    <td key={"tg"+state.idx}><div onClick={tgtChange} style={{backgroundColor: "rgba(123,200,30,0.3)", borderRadius: 10, padding: 3, textAlign: "center"}}>{state.scoreTgt ? "target" : "orchestration"}</div></td>
    </Tooltip>
    <Tooltip followCursor title={<Helps help="AnOnoff"/>} disableHoverListener={!props.help} sx={{zIndex:99999}}>
    <td key={"onof"+state.idx}> <div onClick={onoffChange} style={{backgroundColor: state.scoreOnoff ? "rgba(123,200,30,0.3)" : "rgba(200,123,30,0.3)", borderRadius: 10, padding: 3, textAlign: "center"}}>{state.scoreOnoff ? "ON" : "OFF"} </div></td>
    </Tooltip>
    <Tooltip followCursor title={<Helps help="AnMo"/>} disableHoverListener={!props.help} sx={{zIndex:99999}}>
    <td key={"mo"+state.idx}>{modify}</td>
    </Tooltip>
    </tr>
)

}