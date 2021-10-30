import React, { useState } from 'react';
import { DBinstruments } from '../instruments';
import Select from '@mui/material/Select';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Switch from '@mui/material/Switch';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

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
          row: [state.scoreNames, state.scoreTechs, newDyn, state.scorePitch, state.scoreTgt, state.scoreOnoff, state.scoreIdx]
  })
      }
      const modChange = (idx, event) => {
        let newMod = 0
        if(state.scoreModify===0){newMod=-12}else if(state.scoreModify===-12){newMod=12}
        setState(state => ({...state, scoreModify:newMod, scorePitch:props.row[3]+newMod}))
        props.onChange({
          idx: state.idx, 
          row: [state.scoreNames, state.scoreTechs, state.scoreDyns, props.row[3]+newMod, state.scoreTgt, state.scoreOnoff, state.scoreIdx]
  })
      }
      const tgtChange = (idx, event) => {
        setState(state => ({...state, scoreTgt: !state.scoreTgt}))
        props.onChange({
          idx: state.idx, 
          row: [state.scoreNames, state.scoreTechs, state.scoreDyns, state.scorePitch, !state.scoreTgt, state.scoreOnoff, state.scoreIdx]
  })
      }
      const onoffChange = (idx, event) => {
        setState(state => ({...state, scoreOnoff:!state.scoreOnoff}))
        props.onChange({
          idx: state.idx, 
          row: [state.scoreNames, state.scoreTechs, state.scoreDyns, state.scorePitch, state.scoreTgt, !state.scoreOnoff, state.scoreIdx]
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

return(
    <tr>
    <td key={"scor"+state.idx} style={{backgroundColor:state.color}}>{state.scoreNames}</td>
    <td key={"tec"+state.idx}>{state.scoreTechs}</td>
    <td key={"dy"+state.idx}><div onClick={dynChange} style={{backgroundColor: "rgba(123,200,30,0.3)", borderRadius: 10, padding: 3, textAlign: "center"}}> {state.scoreDyns} </div></td>
    <td key={"tg"+state.idx}><div onClick={tgtChange} style={{backgroundColor: "rgba(123,200,30,0.3)", borderRadius: 10, padding: 3, textAlign: "center"}}>{state.scoreTgt ? "target" : "orchestration"}</div></td>
    <td key={"onof"+state.idx}> <div onClick={onoffChange} style={{backgroundColor: state.scoreOnoff ? "rgba(123,200,30,0.3)" : "rgba(200,123,30,0.3)", borderRadius: 10, padding: 3, textAlign: "center"}}>{state.scoreOnoff ? "ON" : "OFF"} </div></td>
    <td key={"mo"+state.idx}>{modify}</td>
    </tr>
)

}