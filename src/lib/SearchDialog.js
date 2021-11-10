import * as React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Select from '@mui/material/Select';
import InputLabel from '@mui/material/InputLabel';
import Orchestration from './Orchestration';
import { Box } from '@mui/system';
import { FormControlLabel } from '@mui/material';
import { Checkbox } from '@mui/material';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Slide from '@mui/material/Slide';
import { noteNumbers } from './noteNumbers';
import { FormatListNumberedTwoTone } from '@mui/icons-material';
import fromNote from './piano/MidiNumbers.js'
import axios from 'axios';
import { address } from './Constants';
const baseURL = address

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export default function SearchDialog(props) {

  const orchSort=(lista)=>{
    lista.sort(function(a, b){return fromNote.fromNote(a.note)-fromNote.fromNote(b.note)})
  }

  const woodwinds = ['piccolo','flute', 'alto_flute', 'bass_flute','oboe', 'english_horn','clarinet', 'clarinet_eb','bass_cl', 'bassoon']
  const brass = ['trumpet', 'horn','tenor_trombone', 'bass_trombone', 'soprano_sax','alto_sax']
  const perc = ['crotale', 'cymbal', 'percussion_misc', 'tambourine', 'tamtam', 'tamtam_22', 'tamtam_40', 'thaigong', 'triangle_6', 'triangle_8', 'vibraphone', 'woodblock', 'xylophone', 'timp']
  const various = ['piano', 'harp', 'guitar','soprano_generic', 'tenor_generic','baritone_generic']
  const strings = ['violin', 'viola', 'cello', 'double_bass', 'solo_violin', 'solo_viola', 'solo_cello', 'solo_double_bass']

  const DYN = ['p', 'mf', 'f']
  const METHOD = ['mfcc', 'centroid', 'masking_curve', 'peaks']

  const CHROMATIC = [ 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B' ]
  const OCT = [1, 2, 3, 4, 5, 6, 7, 8]
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

  const [open, setOpen] = React.useState(false);
    const [state, setState] = React.useState({
      selected: null,
      instList: [],
      searchInstruments: woodwinds.concat(brass).concat(strings),
      searchTechs: ["normal"],
      availableTechs: [],
      searchPitch: CHROMATIC,
      searchOct: OCT,
      searchDyn : DYN,
      searchMethod: ["peaks"],
      searchPeaks: 3,
      toggle: [true, true, true, false, false, false],
      result:null
    });
    React.useEffect(() => {
        setOpen(state => state = props.open)
    }, [props])

    React.useEffect(() => {
      let techs = []
      state.searchInstruments.map(inst=>{
        Object.keys(noteNumbers[inst]).map(tch=>{
          if(!techs.includes(tch)){
            techs.push(tch)
          }
        })
      })
      
      setState(state => ({...state, availableTechs:techs}))
  }, [state.searchInstruments])

    const Storage=()=>{
      if(localStorage.getItem("orchestrations")===null){
        return null
      }
      else{
        return JSON.parse(localStorage.getItem("orchestrations")).map(item => <MenuItem value={item.id}>{item.name}</MenuItem>)
      }
    }

    const handleCheck = (i,itm,e) => {
      const value = e.target.checked
      if(value){
        let searchList = [...state.searchInstruments]
        searchList.push(itm)
        setState(state=>({...state, searchInstruments:searchList}))
      }else{
        const filtered = state.searchInstruments.filter(function(value, index, arr){ 
          return value !== itm;
      });
      setState(state=>({...state, searchInstruments:filtered}))
      }
    }

    const handleTech = (i,itm,e) => {
      const value = e.target.checked
      if(value){
        let searchList = [...state.searchTechs]
        searchList.push(itm)
        setState(state=>({...state, searchTechs:searchList}))
      }else{
        const filtered = state.searchTechs.filter(function(value, index, arr){ 
          return value !== itm;
      });
      setState(state=>({...state, searchTechs:filtered}))
      }
    }

    
    const handleDyn = (i,itm,e) => {
      const value = e.target.checked
      if(value){
        let searchList = [...state.searchDyn]
        searchList.push(itm)
        setState(state=>({...state, searchDyn:searchList}))
      }else{
        const filtered = state.searchDyn.filter(function(value, index, arr){ 
          return value !== itm;
      });
      setState(state=>({...state, searchDyn:filtered}))
      }
    }

    
    const handlePitch = (i,itm,e) => {
      const value = e.target.checked
      if(value){
        let searchList = [...state.searchPitch]
        searchList.push(itm)
        setState(state=>({...state, searchPitch:searchList}))
      }else{
        const filtered = state.searchPitch.filter(function(value, index, arr){ 
          return value !== itm;
      });
      setState(state=>({...state, searchPitch:filtered}))
      }
    }

    
    const handleOct = (i,itm,e) => {
      const value = e.target.checked
      if(value){
        let searchList = [...state.searchOct]
        searchList.push(itm)
        setState(state=>({...state, searchOct:searchList}))
      }else{
        const filtered = state.searchOct.filter(function(value, index, arr){ 
          return value !== itm;
      });
      setState(state=>({...state, searchOct:filtered}))
      }
    }

    const handleMethod = (i,itm,e) => {
      const value = e.target.checked
      if(value){
        let searchList = [...state.searchMethod]
        searchList.push(itm)
        setState(state=>({...state, searchMethod:searchList}))
      }else{
        const filtered = state.searchMethod.filter(function(value, index, arr){ 
          return value !== itm;
      });
      setState(state=>({...state, searchMethod:filtered}))
      }
    }

    const handleOverlap = (e) => {
      const value = e.target.value
      setState(state=>({...state, searchPeaks:value}))
    }

    const handleOrch=(e)=>{
      const id = e.target.value
      const orch = JSON.parse(localStorage.getItem("orchestrations")).filter((v,i,a)=>(v.id===id))
      const orchestration = orch[0].data.map((row, ind)=>[row[0], row[1], row[2], row[3], row[4], row[5], ind, row[7]])
      setState(state=>({...state,
        instList: orchestration,
        selected: id
      }))
    }
    
    const selectedSource=(lista)=>{
      if(lista.length>0){
        let miniList = []
        let index = 0
        lista.map((elem, i)=>{
          elem[3].map(arrNote=>{
            let mic = 0
            if(typeof(elem[7])==='number'){
              mic = elem[7]
            }
            miniList.push([elem[0], elem[1], elem[2], arrNote, elem[4], elem[5], index, mic])
            index += 1
          })
        } )
        miniList.sort(function(a, b){return a[3]-b[3]})
        let notes=miniList.map(l=>{
          return mid2note(l[3]+l[7])
        })
        let instruments=miniList.map(l=>l[0])
        return <div style={{textAlign:"center", margin:"auto"}}><Orchestration
        notes={notes}
        instruments={instruments}
        target={[]}
        scale={0.8}
        width={200}
        height={250}
        t_score_y={110}
        b_score_y={170}
        text_space={100}/></div>
      }
    }

    const addToTarget = (res, e) =>{
      let LISTA = [...state.instList]
      LISTA.push([res[0], res[1], res[2], [res[3]], 0, 1, LISTA[LISTA.length-1][6]+1, 0])
      setState(state=>({...state, instList:LISTA}))
    }

    const addToSaved = (res, e) =>{
      let LISTA = [...state.instList]
      LISTA.push([res[0], res[1], res[2], [res[3]], 0, 1, LISTA[LISTA.length-1][6]+1, 0])
      setState(state=>({...state, instList:LISTA}))
      let saved = JSON.parse(localStorage.getItem("orchestrations"))
      saved[state.selected].data = LISTA
      localStorage.setItem("orchestrations", JSON.stringify(saved))
    }

    const makeSearch = () => {
      setState(state=>({...state, result:""}))
      let miniList = []
      state.instList.map((elem, i)=>{
        elem[3].map(arrNote=>{
          miniList.push(elem[0]+","+elem[1]+","+elem[2]+","+Math.round(arrNote))   //Rounded note for search
        })
      } )
      const axiosData = [miniList, state.searchMethod, state.searchInstruments, state.searchTechs, state.searchDyn, state.searchPitch, state.searchOct, state.searchPeaks]
      axios.post(baseURL+"search", axiosData).then((response) => {
        //console.log(response)
        const result = response.data
        const resultRender = <div id={result[0]}> 
                <Typography style={{textAlign:"center", margin:"auto"}}> Search result: {result[0][0]} {result[0][1]} {result[0][2]} {mid2note(result[0][3])}</Typography>
          <div style={{textAlign:"center", margin:"auto"}}><Orchestration
        notes={ [ mid2note(result[0][3]) ] }
        instruments={ [ result[0][0] ] }
        target={[]}
        scale={0.8}
        width={200}
        height={250}
        t_score_y={50}
        b_score_y={140}
        text_space={100}/>
        </div> 
        <Typography style={{textAlign:"center", margin:"auto"}}> Play search result, {result[0][0]}: </Typography>
        <div><audio controls id={"yks"+result[0]}> <source src={result[1]} autoPlay="true" type="audio/x-wav"/> </audio></div>
        <Typography style={{textAlign:"center", margin:"auto"}}> Play search source: </Typography>
        <div><audio controls id={"kaks"+result[0]}> <source src={result[2]} type="audio/x-wav"/> </audio></div>
        <Typography style={{textAlign:"center", margin:"auto"}}> Play both together: </Typography>
        <div><audio controls id={"kol"+result[0]}>  <source src={result[3]} type="audio/x-wav"/> </audio></div>
        <Button onClick={e=>addToTarget(result[0],e)} variant="contained" color="secondary" style={{padding: 10, margin: 5}}> Add search result to search source </Button>
        <Button onClick={e=>addToSaved(result[0],e)} variant="contained" color="secondary" style={{padding: 10, margin: 5}}> Update your saved orchestration with search result </Button>
        </div>

        setState(state=>({...state, result:resultRender}))
      })
    }

    const handleToggle = (i, evt) =>{
      let toggle = [...state.toggle]
      toggle[i] = !toggle[i]
      setState(state=>({...state, toggle:toggle}))

      if(i===0){
        if(toggle[i]){
          const newSelection = state.searchInstruments.concat(woodwinds)
          setState(state=>({...state, searchInstruments:newSelection}))
        } else {
          let newSelection = state.searchInstruments.filter((v,a,u)=> (!woodwinds.includes(v)) )
          setState(state=>({...state, searchInstruments:newSelection}))
        }
      }

      if(i===1){
        if(toggle[i]){
          const newSelection = state.searchInstruments.concat(brass)
          setState(state=>({...state, searchInstruments:newSelection}))
        } else {
          let newSelection = state.searchInstruments.filter((v,a,u)=> (!brass.includes(v)) )
          setState(state=>({...state, searchInstruments:newSelection}))
        }
      }

      if(i===2){
        if(toggle[i]){
          const newSelection = state.searchInstruments.concat(strings)
          setState(state=>({...state, searchInstruments:newSelection}))
        } else {
          let newSelection = state.searchInstruments.filter((v,a,u)=> (!strings.includes(v)) )
          setState(state=>({...state, searchInstruments:newSelection}))
        }
      }

      if(i===3){
        if(toggle[i]){
          const newSelection = state.searchInstruments.concat(perc)
          setState(state=>({...state, searchInstruments:newSelection}))
        } else {
          let newSelection = state.searchInstruments.filter((v,a,u)=> (!perc.includes(v)) )
          setState(state=>({...state, searchInstruments:newSelection}))
        }
      }

      if(i===4){
        if(toggle[i]){
          const newSelection = state.searchInstruments.concat(various)
          setState(state=>({...state, searchInstruments:newSelection}))
        } else {
          let newSelection = state.searchInstruments.filter((v,a,u)=> (!various.includes(v)) )
          setState(state=>({...state, searchInstruments:newSelection}))
        }
      }

      if(i===5){
        if(toggle[i]){
          const newSelection = state.searchTechs.concat(state.availableTechs)
          setState(state=>({...state, searchTechs:newSelection}))
        } else {
          setState(state=>({...state, searchTechs:["normal"]}))
        }
      }
    }

    return(
        <div>
        <Dialog
          fullScreen
          open={open}
          onClose={props.handleClose}
          TransitionComponent={Transition}
          PaperProps={{style:{backgroundColor: "#fffef0"}}}
        >
          <AppBar sx={{ position: 'relative', backgroundColor: "#dcc4ac", color:"#4c4c48" }}>
            <Toolbar>
              <IconButton
                edge="start"
                color="inherit"
                onClick={props.handleClose}
                aria-label="close"
              >
                <div>Click here, or press ESC to close Search Panel</div>
              </IconButton>
            </Toolbar>
          </AppBar>

          <Typography style={{textAlign:"center"}}> Select search source from your saved orchestrations  </Typography>
      <FormControl sx={{ m: 1, minWidth: 50 }}>
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

            <Typography variant="h5" style={{textAlign:"center", margin:"auto"}}>
              Search source
          </Typography>
      {selectedSource(state.instList)}
      <Typography variant="h5" style={{textAlign:"center", margin:"auto"}}>
              Search space
          </Typography>
        <table>
          <tbody>
            <tr>
              <td>
              <Typography>
              Woodwinds
          </Typography>
          <FormControlLabel
                style={{color:"green"}}
                  label={"toggle all"}
                  control={<Checkbox checked={state.toggle[0]} size="small"  color="success" onChange={(evt)=>handleToggle(0,evt)} />}
                />
              </td>
              <td>
              <Typography>
              Brass
          </Typography>
          <FormControlLabel
                style={{color:"green"}}
                  label={"toggle all"}
                  control={<Checkbox checked={state.toggle[1] } size="small" color="success" onChange={(evt)=>handleToggle(1,evt)} />}
                />
              </td>
              <td>
              <Typography>
              Strings
          </Typography>
          <FormControlLabel
                style={{color:"green"}}
                  label={"toggle all"}
                  control={<Checkbox checked={state.toggle[2] } color="success" size="small" onChange={(evt)=>handleToggle(2,evt)} />}
                />
                </td>
                <td>
                <Typography>
              Percussion
          </Typography>
          <FormControlLabel
                style={{color:"green"}}
                  label={"toggle all"}
                  control={<Checkbox checked={state.toggle[3] } color="success" size="small" onChange={(evt)=>handleToggle(3,evt)} />}
                />
                </td>
                <td>
                <Typography>
              Other
          </Typography>
          <FormControlLabel
                style={{color:"green"}}
                  label={"toggle all"}
                  control={<Checkbox checked={state.toggle[4] } color="success" size="small" onChange={(evt)=>handleToggle(4,evt)} />}
                />
                </td>
            </tr>

            <tr>
              <td>
          <Box sx={{ display: 'inline'}}>
          {woodwinds.map((ww,i)=>
                  <FormControlLabel
                  label={ww}
                  control={<Checkbox checked={state.searchInstruments.includes(ww)} size="small" onChange={(evt)=>handleCheck(i,ww,evt)} />}
                />
          )}
          </Box>
          </td>

          <td>
          <Box sx={{ display: 'inline'}}>
          {brass.map((itm,i)=>
                  <FormControlLabel
                  label={itm}
                  control={<Checkbox checked={state.searchInstruments.includes(itm)} size="small" onChange={(evt)=>handleCheck(i,itm,evt)} />}
                />
          )}
          </Box>
          </td>

          <td>
          <Box sx={{ display: 'inline'}}>
          {strings.map((itm,i)=>
                  <FormControlLabel
                  label={itm}
                  control={<Checkbox checked={state.searchInstruments.includes(itm)} size="small" onChange={(evt)=>handleCheck(i,itm,evt)} />}
                />
          )}
          </Box>
          </td>

          <td>
          <Box sx={{ display: 'inline'}}>
          {perc.map((itm,i)=>
                  <FormControlLabel
                  label={itm}
                  control={<Checkbox checked={state.searchInstruments.includes(itm)} size="small" onChange={(evt)=>handleCheck(i,itm,evt)} />}
                />
          )}
          </Box>
          </td>

          <td>
          <Box sx={{ display: 'inline'}}>
          {various.map((itm,i)=>
                  <FormControlLabel
                  label={itm}
                  control={<Checkbox checked={state.searchInstruments.includes(itm)} onChange={(evt)=>handleCheck(i,itm,evt)} />}
                />
          )}
          </Box>
          </td>

            </tr>
          </tbody>
          </table>

          <Typography>
              Techniques
          </Typography>
          <FormControlLabel
                style={{color:"green"}}
                  label={"toggle all"}
                  control={<Checkbox checked={state.toggle[5] } color="success" size="small" onChange={(evt)=>handleToggle(5,evt)} />}
                />
          <Box sx={{ display: 'inline'}}>
          {state.availableTechs.map((itm,i)=>
                  <FormControlLabel
                  label={itm}
                  control={<Checkbox checked={state.searchTechs.includes(itm)} size="small" onChange={(evt)=>handleTech(i,itm,evt)} />}
                />
          )}
          </Box>

          <Typography>
              Dynamics
          </Typography>
          <Box sx={{ display: 'inline'}}>
          {DYN.map((itm,i)=>
                  <FormControlLabel
                  label={itm}
                  control={<Checkbox checked={state.searchDyn.includes(itm)} size="small" onChange={(evt)=>handleDyn(i,itm,evt)} />}
                />
          )}
          </Box>

          <Typography>
              Pitch classes
          </Typography>
          <Box sx={{ display: 'inline'}}>
          {CHROMATIC.map((itm,i)=>
                  <FormControlLabel
                  label={itm}
                  control={<Checkbox checked={state.searchPitch.includes(itm)} size="small" onChange={(evt)=>handlePitch(i,itm,evt)} />}
                />
          )}
          </Box>

          <Typography>
              Octaves
          </Typography>
          <Box sx={{ display: 'inline'}}>
          {OCT.map((itm,i)=>
                  <FormControlLabel
                  label={itm}
                  control={<Checkbox checked={state.searchOct.includes(itm)} size="small" onChange={(evt)=>handleOct(i,itm,evt)} />}
                />
          )}
          </Box>

          <Typography>
              Search method
          </Typography>
          <Box sx={{ display: 'inline'}}>
          {METHOD.map((itm,i)=>
                  <FormControlLabel
                  label={itm}
                  control={<Checkbox checked={state.searchMethod.includes(itm)} size="small" onChange={(evt)=>handleMethod(i,itm,evt)} />}
                />
          )}
          <FormControl fullWidth>
  <InputLabel id="overlapping">Overlappin partials for peaks</InputLabel>
  <Select
    labelId="overlapping"
    id="overlapping-select"
    value={state.searchPeaks}
    label="Overlappin partials for peaks"
    onChange={handleOverlap}
  >
    {[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15].map(val=><MenuItem value={val}>{val}</MenuItem>)}
  </Select>
</FormControl>
          </Box>

          <Button onClick={makeSearch} variant="contained" color="primary" style={{padding: 10, margin: 5}}> SEARCH </Button>
          <br/>
          {state.result}
          </Dialog>
          </div>
    )
}