import React, { useState } from 'react';
import { DBinstruments } from './../instruments';
import Select from '@mui/material/Select';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Switch from '@mui/material/Switch';
import Stack from '@mui/material/Stack';
import Popper from '@mui/material/Popper';
import Popover from '@mui/material/Popover';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Slider from '@mui/material/Slider';
import Typography from '@mui/material/Typography';
import { noteNumbers } from './noteNumbers';
import Piano from './piano/Piano';
import './piano/styles.css';
import SelectedNote from './selectedNote';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import CancelIcon from '@mui/icons-material/Cancel';
import { IconButton } from '@mui/material';

export default function AddInst(props){
    let micro = 0
    if(typeof(props.data[7])==='number'){
      micro = props.data[7]
    }

    const [state, setState] = useState({
        idx:props.data[6], 
        scoreNames: props.data[0],
        scoreTechs: props.data[1],
        scoreDyns: props.data[2],
        scorePitch: props.data[3],
        scoreTgt: props.data[4],
        scoreOnoff: props.data[5],
        scoreIdx: props.data[6],
        scoreMicro: micro,
        scoreModify: 0,
        popOpen: false,
        anchorEl: null
    })

    const clearClick = () =>{
      setState(state=>({...state, popOpen:false}))
      setState(state=>({...state, scorePitch:[]}))
      setState(state=>({...state, scoreMicro:0}))
      props.onChange([state.scoreNames, state.scoreTechs, state.scoreDyns, [], state.scoreTgt, state.scoreOnoff, state.scoreIdx, 0])
    }
    const instChange = (idx, event) => {
        const evt = event.target.value
        /*
        let scoreNames = {...state.scoreNames}
        let item = {...scoreNames[idx]}
        item = event.target.value
        scoreNames[idx] = item
        */
        setState(state=>({...state, popOpen:false}))
        setState(state=> ({...state, scoreNames:evt, scoreTechs:"normal", scoreDyns:"mf"}))
        props.onChange([evt, "normal", "mf", state.scorePitch, state.scoreTgt, state.scoreOnoff, state.scoreIdx, state.scoreMicro])
        //setState(state => state.scoreNames[idx] = event.target.value)
      }
      const techChange = (idx, event) => {
        const evt = event.target.value
        setState(state => ({...state, scoreTechs:evt}))
        props.onChange([state.scoreNames, evt, state.scoreDyns, state.scorePitch, state.scoreTgt, state.scoreOnoff, state.scoreIdx, state.scoreMicro])
      }
      const dynChange = (idx, event) => {
        const evt = event.target.value
        setState(state => ({...state, scoreDyns:evt}))
        props.onChange([state.scoreNames, state.scoreTechs, evt, state.scorePitch, state.scoreTgt, state.scoreOnoff, state.scoreIdx, state.scoreMicro])
      }
      const modChange = (idx, event) => {
        const evt = event.target.value
        let transposed = state.scorePitch.map(pitch=>{
          if(pitch+evt>=noteNumbers[state.scoreNames][state.scoreTechs][state.scoreDyns][0] && pitch+evt<=noteNumbers[state.scoreNames][state.scoreTechs][state.scoreDyns][1] ){
          return pitch+evt
          }else{
            return null
          }
        })
        transposed = transposed.filter((v,k,p)=>v!=null)
        console.log(transposed)
        setState(state => ({...state, scorePitch:transposed,scoreModify:0}))
        props.onChange([state.scoreNames, state.scoreTechs, state.scoreDyns, transposed, state.scoreTgt, state.scoreOnoff, state.scoreIdx, state.scoreMicro])
      }
      const tgtChange = (idx, event) => {
        const evt = event.target.checked
        //console.log(event)
        setState(state => ({...state, scoreTgt:evt}))
        props.onChange([state.scoreNames, state.scoreTechs, state.scoreDyns, state.scorePitch, evt, state.scoreOnoff, state.scoreIdx, state.scoreMicro])
      }
      const onoffChange = (idx, event) => {
        const evt = event.target.checked
        //console.log(event)
        setState(state => ({...state, scoreOnoff:evt}))
        props.onChange([state.scoreNames, state.scoreTechs, state.scoreDyns, state.scorePitch, state.scoreTgt, evt, state.scoreIdx, state.scoreMicro])
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
        const instruments = Object.keys(noteNumbers)
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
      const CHROMATIC = [ 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B' ]
      function mid2note (midi) {
        var decimal = midi - Math.floor(midi) // get the decimal part
        let tone = Math.round(midi)
        let name = CHROMATIC[tone % 12]
        if(decimal>=0.2 && decimal<0.5){
          if(/[#]/.test(name)){ // regex if note is sharp
            name = CHROMATIC[(tone+1) % 12]+"d"  //note without sharp + 1/4 lower
          } else {
            name = name+"+"
          }
        } else if(decimal>=0.5 && decimal<=0.8){
          if(/[#]/.test(name)){ // regex if note is sharp
            name = CHROMATIC[(tone-1) % 12]+"+"  //earlier note + 1/4 sharp
          } else {
            name = name+"d"
          } 
        }

        var oct = Math.floor(tone / 12) - 1
        return name + oct
      }
      const popperClick = (event) => {
        const tar = event.currentTarget
        setState(state => ({...state, popOpen: !state.popOpen, anchorEl: tar}))
        //setState((state) => state.anchorEl = event.currentTarget)
        
      };
      const handleClose = () => {
        setState(state => ({...state, anchorEl: null, popOpen: false }))
        props.onChange([state.scoreNames, state.scoreTechs, state.scoreDyns, state.scorePitch, state.scoreTgt, state.scoreOnoff, state.scoreIdx, state.scoreMicro])
      }
      // temp button: <Button aria-describedby={idx} variant="outlined" onClick={popperClick} size="small"> </Button>
      const selectPitch = (pitch, idx) => {
        const range = [noteNumbers[state.scoreNames][state.scoreTechs][state.scoreDyns][0], 
        noteNumbers[state.scoreNames][state.scoreTechs][state.scoreDyns][noteNumbers[state.scoreNames][state.scoreTechs][state.scoreDyns].length-1]]
        return(
          <div>
          <div aria-describedby={idx} onClick={popperClick}>
          <SelectedNote note={state.scorePitch.sort().map(note=>mid2note(note+state.scoreMicro))}/>
          </div>
          <Popover id={idx} open={state.popOpen} 
          anchorEl={state.anchorEl} 
          onClose={handleClose} 
          style={{zIndex: 10000}}   
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'left',
          }}
          sx={{
            marginTop:3,
          }}
          transformOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}>
                <Box sx={{ border: 1, p: 1, bgcolor: 'white' }}>
                <Piano
          noteRange={{ first: range[0], last: range[1] }}
          activeNotes={state.scorePitch}
          playNote={(midiNumber) => {
            return
          }}
          stopNote={(midiNumber) => {
            let pList=[...state.scorePitch]
            if(pList.includes(midiNumber)){
            const filtered = pList.filter(function(value, index, arr){  return value!=midiNumber })
            setState(state=>({...state, scorePitch:filtered}))
            // props.onChange([state.scoreNames, state.scoreTechs, state.scoreDyns, filtered, state.scoreTgt, state.scoreOnoff, state.scoreIdx])
            // Stop playing a given note - see notes below
          }else{
            pList.push(midiNumber)
            setState(state=>({...state, scorePitch:pList}))
            // console.log(pList)
            // props.onChange([state.scoreNames, state.scoreTechs, state.scoreDyns, pList, state.scoreTgt, state.scoreOnoff, state.scoreIdx])
          }
          
        }}
          width={400}
        />
                </Box>
          </Popover>
        </div>
        )
      }

      const selectTechs = (name, idx) => {
        const techs = Object.keys(noteNumbers[state.scoreNames])
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
        const dyns = Object.keys(noteNumbers[state.scoreNames][state.scoreTechs])
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

      const handleMicro  = (event, newValue) => {
        setState(state => ({...state, scoreMicro:newValue}))
      }
      const handleCommit  = (event, newValue) => {
        props.onChange([state.scoreNames, state.scoreTechs, state.scoreDyns, state.scorePitch, state.scoreTgt, state.scoreOnoff, state.scoreIdx, state.scoreMicro])
      }
      const zeroClick = () => setState(state => ({...state, scoreMicro:0}))
      const selectMicrotone = (name, idx) => {
        return (
          <Box sx={{ width: 70 }}>
            <Stack spacing={0} direction="row" sx={{ mb: 1 }} alignItems="center">
            <Typography variant="caption" style={{textAlign:"center"}}> tune </Typography>
            <IconButton aria-label="zero" size="small" onClick={zeroClick}>
            <Typography variant="caption" style={{textAlign:"center"}}> (reset) </Typography>
          </IconButton>
            </Stack>
            <Stack spacing={1} direction="row" sx={{ mb: 1 }} alignItems="center">
            <img src={"/flat.png"} height="20"/>
              <Slider valueLabelDisplay="auto" aria-label="tune"  size="small" min={-0.49} step={0.01} max={0.49} value={state.scoreMicro} onChangeCommitted={handleCommit} onChange={handleMicro} />
              <img src={"/sharp.png"} height="20"/>
            </Stack>
          </Box>
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
const notationList = state.scorePitch.map(note=>mid2note(note))
return(
    <tr>
    <td key={"nam"+state.idx}>{state.instName}</td>
    <td key={"scor"+state.idx}>{selectInstruments(state.scoreNames, state.idx)}</td>
    <td key={"tec"+state.idx}>{selectTechs(state.scoreTechs, state.idx)}</td>
    <td key={"dy"+state.idx}>{selectDyns(state.scoreDyns, state.idx)}</td>
    <td key={"mi"+state.idx}>{selectMicrotone(state.scoreMicro, state.idx)}</td>
    <td key={"pi"+state.idx}>{selectPitch(state.scorePitch, "pi"+state.idx)}</td>

    <td> <Button variant="outlined" color="warning" onClick={clearClick} size="small"> clear notes </Button></td>
    <td key={"tg"+state.idx}>
      <div style={{border: '1px solid lightGray', borderRadius: 5, padding:8}}>
    <Stack direction="row" spacing={1} alignItems="center">
            <Typography>orch.</Typography>
      <Switch key={"tgtswitch"+state.idx} checked={state.scoreTgt} color="secondary" onChange={e=>tgtChange(state.idx,e)}/>
      <Typography>tgt</Typography>
          </Stack>
          </div>
      </td>
    <td key={"onoff"+state.idx} >
    <div style={{border: '1px solid lightGray', borderRadius: 5, padding:8}}>
    <Stack direction="row" spacing={1} alignItems="center">
            <Typography>off</Typography>
      <Switch key={"onoffswitch"+state.idx} checked={state.scoreOnoff} onChange={e=>onoffChange(state.idx,e)}/>
      <Typography>on</Typography>
          </Stack>
          </div>
          </td>
          <td key={"mod"+state.idx}>{selectMods(state.scoreModify, state.idx)}</td>
          <td> <Button variant="outlined" color="warning" onClick={e=>props.onDelete(state.scoreIdx)} size="small"> delete </Button></td>
    </tr>
)

}