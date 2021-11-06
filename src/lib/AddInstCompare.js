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
import Typography from '@mui/material/Typography';
import { noteNumbers } from './noteNumbers';
import { Piano } from 'react-piano';
import './piano/styles.css';
import SelectedNote from './selectedNote';

export default function AddInstCompare(props){

    const [state, setState] = useState({
        idx:props.data[6], 
        scoreNames: props.data[0],
        scoreTechs: props.data[1],
        scoreDyns: props.data[2],
        scorePitch: props.data[3],
        scoreTgt: props.data[4],
        scoreOnoff: props.data[5],
        scoreIdx: props.data[6],
        scoreModify: 0,
        popOpen: false,
        anchorEl: null
    })

    const clearClick = () =>{
      setState(state=>({...state, popOpen:false}))
      setState(state=>({...state, scorePitch:[]}))
      props.onChange([state.scoreNames, state.scoreTechs, state.scoreDyns, [], state.scoreTgt, state.scoreOnoff, state.scoreIdx])
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
        let dyn="mf"
        if(evt==="crotale"){
          dyn="f"
        }
        let tech ="normal"
        if(evt==="percussion_misc"){
          tech="castanet"
        }
        const note = noteNumbers[evt][tech][dyn][0]
        setState(state=> ({...state, scorePitch:note,scoreNames:evt, scoreTechs:tech, scoreDyns:dyn}))
        props.onChange([evt, tech, dyn, note, state.scoreTgt, state.scoreOnoff, state.scoreIdx])
        //setState(state => state.scoreNames[idx] = event.target.value)
      }
      const techChange = (idx, event) => {
        const evt = event.target.value
        setState(state => ({...state, scoreTechs:evt}))
        props.onChange([state.scoreNames, evt, state.scoreDyns, state.scorePitch, state.scoreTgt, state.scoreOnoff, state.scoreIdx])
      }
      const dynChange = (idx, event) => {
        const evt = event.target.value
        setState(state => ({...state, scoreDyns:evt}))
        props.onChange([state.scoreNames, state.scoreTechs, evt, state.scorePitch, state.scoreTgt, state.scoreOnoff, state.scoreIdx])
      }
      const modChange = (idx, event) => {
        const evt = event.target.value
        setState(state => ({...state, scorePitch:state.scorePitch+evt,scoreModify:0}))
      }
      const tgtChange = (idx, event) => {
        const evt = event.target.checked
        //console.log(event)
        setState(state => ({...state, scoreTgt:evt}))
        props.onChange([state.scoreNames, state.scoreTechs, state.scoreDyns, state.scorePitch, evt, state.scoreOnoff, state.scoreIdx])
      }
      const onoffChange = (idx, event) => {
        const evt = event.target.checked
        //console.log(event)
        setState(state => ({...state, scoreOnoff:evt}))
        props.onChange([state.scoreNames, state.scoreTechs, state.scoreDyns, state.scorePitch, state.scoreTgt, evt, state.scoreIdx])
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
      const CHROMATIC = [ 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'Bb', 'B' ]
      function mid2note (midi) {
        var name = CHROMATIC[midi % 12]
        var oct = Math.floor(midi / 12) - 1
        return name + oct
      }
      const popperClick = (event) => {
        const tar = event.currentTarget
        setState(state => ({...state, popOpen: !state.popOpen, anchorEl: tar}))
        //setState((state) => state.anchorEl = event.currentTarget)
        
      };
      const handleClose = () => {
        setState(state => ({...state, anchorEl: null, popOpen: false }))
        props.onChange([state.scoreNames, state.scoreTechs, state.scoreDyns, state.scorePitch, state.scoreTgt, state.scoreOnoff, state.scoreIdx])
      }
      // temp button: <Button aria-describedby={idx} variant="outlined" onClick={popperClick} size="small"> </Button>
      const selectPitch = (pitch, idx) => {
        const range = [noteNumbers[state.scoreNames][state.scoreTechs][state.scoreDyns][0], 
        noteNumbers[state.scoreNames][state.scoreTechs][state.scoreDyns][noteNumbers[state.scoreNames][state.scoreTechs][state.scoreDyns].length-1]]
        return(
          <div>
          <div aria-describedby={idx} onClick={popperClick}>
          <SelectedNote note={[mid2note(state.scorePitch)]}/>
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
          activeNotes={[state.scorePitch]}
          playNote={(midiNumber) => {
          }}
          onPlayNoteInput={(midiNumber) => {
            setState(state=>({...state, scorePitch:midiNumber}))
          }}
          stopNote={(midiNumber) => {
            return null
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
//const notationList = state.scorePitch.map(note=>mid2note(note))
return(
    <tr>
    <td key={"nam"+state.idx}>{state.instName}</td>
    <td key={"scor"+state.idx}>{selectInstruments(state.scoreNames, state.idx)}</td>
    <td key={"tec"+state.idx}>{selectTechs(state.scoreTechs, state.idx)}</td>
    <td key={"dy"+state.idx}>{selectDyns(state.scoreDyns, state.idx)}</td>
    <td key={"pi"+state.idx}>{selectPitch(state.scorePitch, "pi"+state.idx)}</td>
    <td key={"mod"+state.idx}>{selectMods(state.scoreModify, state.idx)}</td>

    </tr>
)

}