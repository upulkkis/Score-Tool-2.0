import * as React from 'react';
import { useState } from 'react';
import { Piano } from 'react-piano';
import { TextField } from '@mui/material';
import Select from '@mui/material/Select';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import 'react-piano/dist/styles.css';
import { noteNumbers } from './noteNumbers';
import AddInst from './AddInst';
import Button from '@mui/material/Button';
import axios from 'axios';
import Graphs from './graphs';
import Dragdrop from './dragdrop';
import SaveOrch from './SaveOrch';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { TableBody, Typography } from '@mui/material';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import { Savings } from '@mui/icons-material';
import QuickListen from '../quickListen';
import { address } from './Constants';
import Helps from '../help/helps';
import { Tooltip } from '@mui/material';
const theme = createTheme({
  palette: {
  neutral: {
    main: '#dcc4ac',
    contrastText: '#black'
  }
}
})
console.log(address)
const baseURL = address;
//const baseURL = "http://127.0.0.1:5000/";

export default function ChordEditor(props) {

    const [state, setState] = useState({
      instList:[],
      listenList:[],
      data:[],
      selected:null,
      saved:false,
      audibilityPercent:0,
      textFieldValue:"Chord Editor orchestration "+JSON.parse(localStorage.getItem("orchestrations")).length
    })
    
    React.useEffect(()=>{
      if(sessionStorage.getItem("LastChord")!=null){
        const instList = JSON.parse(sessionStorage.getItem("LastChord"))
        setState(state => ({...state, instList: instList}))
        fetchAnalysisData(instList)
      }
    },[])

    const fetchAnalysisData = (list) => {
      let analyseList = []
      let listenList = []
      let index = 0
      list.map((elem, i)=>{
        elem[3].map(arrNote=>{
          let micro = 0
          if(typeof(elem[7])==='number'){
            micro = elem[7]
          }
          if (elem[5]){
            analyseList.push([elem[0], elem[1], elem[2], arrNote, elem[4], elem[5], index, micro])
            listenList.push([elem[0], elem[1], elem[2], arrNote+micro, elem[4], elem[5], index])
          }
          index += 1
        })
      } )
      //console.log(analyseList)
      axios.post(baseURL+"modalSlice", analyseList).then((response) => {
        //console.log(response)
        var result = response.data
        setState(state => ({...state, data: result.data, listenList: listenList, audibilityPercent: 100-result.data[2].masking_percent}))
      })
    }

    const addOne = (e) => {
      e.persist()
      //const t = e
      //console.log(t)
      const tgt = e.target.textContent.toLowerCase()
      let newList = [...state.instList]
      let tech = "normal"
      if(tgt==="percussion_misc"){
        tech = "castanet"
      }
      let dyn="mf"
      if(tgt==="crotale"){
        dyn = "f"
      }
      let notes = []
      if(noteNumbers[tgt][tech][dyn][0]===noteNumbers[tgt][tech][dyn][1]){
        notes = [noteNumbers[tgt][tech][dyn][0]]
      }
      if(newList.length === 0){
      newList.push([tgt, tech, dyn, notes, false, true, 0])
      }else{
      newList.push([tgt, tech, dyn, notes, false, true, newList[newList.length-1][6]+1])
      }
      console.log(newList)
      setState(state=>({...state,
        instList: newList
      }))
    }

    const onDelete= (e) => {
      console.log(state.instList)
      var filtered = state.instList.filter(function(value, index, arr){ 
        return value[6] != e;
    });
      console.log(filtered)
      setState(state=>({...state,
        instList: filtered
      }))
      fetchAnalysisData(filtered)
    }
    //console.log(state.instList)
    const onChange = (i, e) => {
      let newList = [...state.instList]
      newList[i] = e
      setState(state=>({...state,
        instList: newList,
        saved: false
      }))
      sessionStorage.setItem("LastChord", JSON.stringify(newList))
      fetchAnalysisData(newList)
    }
    
    const handleSave = () => {
      if(state.instList.length>0){
        let newOrch = JSON.parse(localStorage.getItem("orchestrations"))
        let id = 0
        if(newOrch!=null){
          if(newOrch.length>0){
            id=newOrch[newOrch.length-1].id+1
          }
          newOrch.push({id:id, name:state.textFieldValue,data:state.instList})
          localStorage.setItem("orchestrations", JSON.stringify(newOrch))
          setState(state=>({...state,
            saved: true
          }))
        }   
      }
    }
    const handleOrch=(e)=>{
      const id = e.target.value
      const orch = JSON.parse(localStorage.getItem("orchestrations")).filter((v,i,a)=>(v.id===id))
      const orchestration = orch[0].data.map((row, ind)=>[row[0], row[1], row[2], row[3], row[4], row[5], ind])
      setState(state=>({...state,
        instList: orchestration,
        selected: id
      }))
      fetchAnalysisData(orchestration)
    }
    const handleClear=()=>{
      setState(state=>({...state,
        instList:[],
        listenList:[],
        data:[],
        selected:null,
        saved:false
      }))
    }
    const handleTextFieldChange = (e) => setState(state=>({...state, textFieldValue:e.target.value}))
    const updateGraphs = () => fetchAnalysisData(state.instList)
    // const st = noteNumbers.bass_cl.normal.mf[0]
    // const end = noteNumbers.bass_cl.normal.mf[noteNumbers.bass_cl.normal.mf.length-1]
    const woodwinds = ['piccolo','flute', 'alto_flute', 'bass_flute','oboe', 'english_horn','clarinet', 'clarinet_eb','bass_cl', 'bassoon']
    const brass = ['trumpet', 'horn','tenor_trombone', 'bass_trombone', 'soprano_sax','alto_sax']
    const perc = ['crotale', 'cymbal', 'percussion_misc', 'tambourine', 'tamtam', 'tamtam_22', 'tamtam_40', 'thaigong', 'triangle_6', 'triangle_8', 'vibraphone', 'woodblock', 'xylophone', 'timp']
    const various = ['piano', 'harp', 'guitar','soprano_generic', 'tenor_generic','baritone_generic']
    const strings = ['violin', 'viola', 'cello', 'double_bass', 'solo_violin', 'solo_viola', 'solo_cello', 'solo_double_bass']
    // <Button variant="contained" color="neutral" onClick={addOne}> Click to add instrument to orchestration </Button>
    const Saving=()=>{
      if(state.saved){return<div style={{textAlign:"center"}}>Saved!</div>}else{return <div>
        <TextField fullWidth value={state.textFieldValue} label="save name" onChange={handleTextFieldChange} />
        <Button fullWidth={true} variant="contained" color="secondary" onClick={handleSave}> Save to your list of orchestrations </Button>
        </div>}
    }
    const Storage=()=>{
      if(localStorage.getItem("orchestrations")===null){
        return null
      }
      else{
        return JSON.parse(localStorage.getItem("orchestrations")).map(item => <MenuItem value={item.id}>{item.name}</MenuItem>)
      }
    }
    return (
      <>
      <ThemeProvider theme={theme}>
      <Tooltip title={<Helps help="ClearInstr"/>} disableTouchListener={!props.help} disableHoverListener={!props.help} followCursor>
      <Button variant="contained" color="warning" onClick={handleClear}> Clear all instruments </Button>
      </Tooltip>
      <Tooltip title={<Helps help="SelectSaved"/>} disableTouchListener={!props.help} disableHoverListener={!props.help} followCursor>
        <div style={{textAlign:"center", margin: "auto"}}>
      <Typography style={{textAlign:"center"}}> Select orchestration from your saved orchestrations  </Typography>
      <FormControl sx={{ m: 1, minWidth: "50vw", textAlign:"center", margin: "auto"}}>
              <InputLabel id="orchestration-select">Orchestrations</InputLabel>
              <Select
                labelId="orchestration-select"
                id={"orchestration-select"+1}
                value={state.selected}
                onChange={handleOrch}
                autoWidth
                label="orch."
              >
                {Storage()}
              </Select>
            </FormControl>
        </div>
        </Tooltip>
      <Typography style={{textAlign:"center"}}> or/and  </Typography>
      <Tooltip title={<Helps help="AddInstr"/>} disableTouchListener={!props.help} disableHoverListener={!props.help} followCursor>
        <div >
      <Typography style={{textAlign:"center"}}> Click below to add instrument to orchestration  </Typography>
      <table>
        <tbody>
          <tr>
            <td>Woodwinds</td>
            <td>Brass</td>
            <td>Strings</td>
            <td>Percussion</td>
            <td>Various</td>
          </tr>
          <tr>
            <td>{woodwinds.map(ww=><Button variant="contained" onClick={addOne} color="neutral" size="small">{ww}</Button>)}</td>
            <td>{brass.map(brs=><Button variant="contained" onClick={addOne} color="neutral" size="small">{brs}</Button>)}</td>
            <td>{strings.map(strgs=><Button variant="contained" onClick={addOne} color="neutral" size="small">{strgs}</Button>)}</td>
            <td>{perc.map(prc=><Button variant="contained" onClick={addOne} color="neutral" size="small">{prc}</Button>)}</td>
            <td>{various.map(vrs=><Button variant="contained" onClick={addOne} color="neutral" size="small">{vrs}</Button>)}</td>
          </tr>
        </tbody>
      </table>
      </div>
      </Tooltip>
      <div style={{zoom:1}}>
      <table>
      {state.instList.map((elem, i)=> <AddInst key={elem} help={props.help} data={elem} onChange={e=>onChange(i, e)} onDelete={onDelete} idx={"fgfg"+i} />)}
      </table>
      </div>

      </ThemeProvider>
      <br/>
      <Tooltip title={<Helps help="Prediction"/>} disableTouchListener={!props.help} disableHoverListener={!props.help} followCursor>
      <div style={{margin:"auto", textAlign:"center"}}>
      <Typography variant="caption" component="div" color="text.secondary">
            Target audibility prediction: 
          </Typography>
          <Box sx={{ position: 'relative', display: 'inline-flex' }}>
      <CircularProgress variant="determinate" value={state.audibilityPercent} color={(() => {
                      if(state.audibilityPercent<=30){
                        return "error"
                      }else if(state.audibilityPercent<=50){
                        return "warning"
                      } else {
                        return "success"
                      }
                  })()}/>
      <Box
        sx={{
          top: 0,
          left: 0,
          bottom: 0,
          right: 0,
          position: 'absolute',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Typography variant="caption" component="div" color="text.secondary">
          {`${Math.round(state.audibilityPercent)}%`}
        </Typography>
      </Box>
    </Box>
    </div>
    </Tooltip>
    <br/>
      <ThemeProvider theme={theme}>
      <Button variant="contained" color="neutral" onClick={updateGraphs} style={{display:"none"}}> Click to update graphs </Button>
      <Tooltip title={<Helps help="SaveOrch"/>} disableTouchListener={!props.help} disableHoverListener={!props.help} followCursor>
        <div>
      <SaveOrch text={state.textFieldValue} orchestration={state.instList}/>
      </div>
      </Tooltip>
      </ThemeProvider>
      <Tooltip title={<Helps help="QuickListen"/>} disableTouchListener={!props.help} disableHoverListener={!props.help} followCursor>
      <div style={{textAlign:"center", margin:"auto"}}><QuickListen instrumentList={state.listenList}/></div>
      </Tooltip>
      <Graphs data={state.data} help={props.help}/>
      <Tooltip title={<Helps help="Listen"/>} disableTouchListener={!props.help} disableHoverListener={!props.help} followCursor>
        <div>
          <Dragdrop instrumentList={state.listenList}/>
          </div>
          </Tooltip>
        </>
        
      );
}