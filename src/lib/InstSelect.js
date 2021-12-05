import React, { useState } from 'react';
import { DBinstruments } from './../instruments';
import Select from '@mui/material/Select';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Switch from '@mui/material/Switch';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Tooltip } from '@mui/material';
import Helps from '../help/helps';

export default function InstSelect(props){

    const [state, setState] = useState({
        idx:props.idx, 
        instName:props.instName, 
        scoreNames: props.scoreNames,
        scoreTechs: props.scoreTechs,
        scoreDyns: props.scoreDyns,
        scoreTgt: props.scoreTgt,
        scoreOnoff: props.scoreOnoff,
        scoreModify: props.scoreModify,
    })

    props.onChange({
            instName:state.instName, 
            scoreNames: state.scoreNames,
            scoreTechs: state.scoreTechs,
            scoreDyns: state.scoreDyns,
            scoreTgt: state.scoreTgt,
            scoreOnoff: state.scoreOnoff,
            scoreModify: state.scoreModify,
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
        setState(state => ({...state, scoreDyns:event.target.value}))
      }
      const modChange = (idx, event) => {
        setState(state => ({...state, scoreModify:event.target.value}))
      }
      const tgtChange = (idx, event) => {
        event.persist();
        //console.log(event)
        setState(state => ({...state, scoreTgt:event.target.checked}))
      }
      const onoffChange = (idx, event) => {
        event.persist();
        //console.log(event)
        setState(state => ({...state, scoreOnoff:event.target.checked}))
      }
      /*
      static domToSvg(svg, point){
        var pt = svg.createSVGPoint();
        pt.x = point.x
        pt.y = point.y
        var sp = pt.matrixTransform(svg.getScreenCTM().inverse());
        return{x: sp.x, y: sp.y}
      }
      */
      const selectInstruments = (name, idx) => {
        const instruments = Object.keys(DBinstruments)
        return (
          <div>
            <FormControl sx={{ m: 1, minWidth: 50 }}>
              <InputLabel id="instrument-select">Instr.</InputLabel>
              <Select
                labelId="instrument-select"
                id={"instrument-sel"+idx}
                value={name}
                onChange={e => instChange(idx,e)}
                autoWidth
                label="instr."
              >
                {instruments.map(inst => <MenuItem value={inst}>{inst}</MenuItem>)}
              </Select>
            </FormControl>
          </div>
        );
      }

      const selectTechs = (name, idx) => {
        const techs = DBinstruments[state.scoreNames]
        return (
          <div>
            <FormControl sx={{ m: 1, minWidth: 50 }}>
              <InputLabel id="tech-select">Tech.</InputLabel>
              <Select
                labelId="tech-select"
                id={"tech-sel"+idx}
                value={name}
                onChange={e => techChange(idx,e)}
                autoWidth
                label="tech."
              >
                {techs.map(tech => <MenuItem value={tech}>{tech}</MenuItem>)}
              </Select>
            </FormControl>
          </div>
        );
      }

      const selectDyns = (name, idx) => {
        const dyns = ["from_score", "p", "mf", "f"]
        return (
          <div>
            <FormControl sx={{ m: 1, minWidth: 50 }}>
              <InputLabel id="dyn-select">Dyn.</InputLabel>
              <Select
                labelId="dyn-select"
                id={"dyn-sel"+idx}
                value={name}
                onChange={e => dynChange(idx,e)}
                autoWidth
                label="dyn."
              >
                {dyns.map(dyn => <MenuItem value={dyn}>{dyn}</MenuItem>)}
              </Select>
            </FormControl>
          </div>
        );
      }
      const selectMods = (name, idx) => {
        const dyns = [0, 12, -12, 24, -24]
        return (
          <div>
            <FormControl sx={{ m: 1, minWidth: 50 }}>
              <InputLabel id="mod-select">Transpose</InputLabel>
              <Select
                labelId="mod-select"
                id={"mod-sel"+idx}
                value={name}
                onChange={e => modChange(idx,e)}
                autoWidth
                label="trans."
              >
                {dyns.map(dyn => <MenuItem value={dyn}>{dyn}</MenuItem>)}
              </Select>
            </FormControl>
          </div>
        );
      }

return(
    <tr>
      <Tooltip title={<Helps help="Scorename"/>} disableHoverListener={!props.help} placement="top" sx={{zIndex:99999}}>
    <td key={"nam"+state.idx}>{state.instName}</td>
    </Tooltip>
    <Tooltip title={<Helps help="Instruments"/>} disableHoverListener={!props.help} placement="top" sx={{zIndex:99999}}>
    <td key={"scor"+state.idx}>{selectInstruments(state.scoreNames, state.idx)}</td>
    </Tooltip>
    <Tooltip title={<Helps help="Techs"/>} disableHoverListener={!props.help} placement="top" sx={{zIndex:99999}}>
    <td key={"tec"+state.idx}>{selectTechs(state.scoreTechs, state.idx)}</td>
    </Tooltip>
    <Tooltip title={<Helps help="Dyns"/>} disableHoverListener={!props.help} placement="top" sx={{zIndex:99999}}>
    <td key={"dy"+state.idx}>{selectDyns(state.scoreDyns, state.idx)}</td>
    </Tooltip>
    <Tooltip title={<Helps help="Target"/>} disableHoverListener={!props.help} placement="top" sx={{zIndex:99999}}>
    <td key={"tg"+state.idx}>
      <div style={{border: '1px solid lightGray', borderRadius: 5, padding:8}}>
    <Stack direction="row" spacing={1} alignItems="center">
            <Typography>orch.</Typography>
      <Switch key={"tgtswitch"+state.idx} checked={state.scoreTgt} color="secondary" onChange={e=>tgtChange(state.idx,e)}/>
      <Typography>tgt</Typography>
          </Stack>
          </div>
      </td>
      </Tooltip>
      <Tooltip title={<Helps help="Onoff"/>} disableHoverListener={!props.help} placement="top" sx={{zIndex:99999}}>
    <td key={"onoff"+state.idx} >
    <div style={{border: '1px solid lightGray', borderRadius: 5, padding:8}}>
    <Stack direction="row" spacing={1} alignItems="center">
            <Typography>off</Typography>
      <Switch key={"onoffswitch"+state.idx} checked={state.scoreOnoff} onChange={e=>onoffChange(state.idx,e)}/>
      <Typography>on</Typography>
          </Stack>
          </div>
          </td>
          </Tooltip>
          <Tooltip title={<Helps help="Transpose"/>} disableHoverListener={!props.help} placement="top" sx={{zIndex:99999}}>
          <td key={"mod"+state.idx}>{selectMods(state.scoreModify, state.idx)}</td>
          </Tooltip>
    </tr>
)

}