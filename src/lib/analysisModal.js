import * as React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import { TextField } from '@mui/material';
import ListItemText from '@mui/material/ListItemText';
import ListItem from '@mui/material/ListItem';
import List from '@mui/material/List';
import Divider from '@mui/material/Divider';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Slide from '@mui/material/Slide';
import Graphs from './graphs';
import Dragdrop from './dragdrop';
import SaveOrch from './SaveOrch';
import InstModify from './InstModify';
import axios from 'axios';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import QuickListen from '../quickListen';
import { address } from './Constants';
import Helps from '../help/helps';
import { Tooltip } from '@mui/material';

//const baseURL = "http://127.0.0.1:5000/"; // http://127.0.0.1:5000/databaseInstruments
const baseURL = address

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export default function AnalysisDialog(props) {
    // console.log(props)
  const [open, setOpen] = React.useState(false);
  const [list, setList] = React.useState([]);
  const [modList, setModList] = React.useState([]);
  const [data, setData] = React.useState([]);
  const [color, setColor] = React.useState([]);
  const [description, setDescription] = React.useState([]);
  const [saved, setSaved] = React.useState(false);
  const [state, setState] = React.useState({textFieldValue: "orchestration"});
  const [maskingperc, setMaskingperc] = React.useState(0);
  let instColors=[]
  let instDescr=[]
  React.useEffect(() => {
    setOpen(state => state = props.open)
    if (props.data.length>1){
      setList(list=>list = props.data[1])
      setModList([])
    }
    if (props.data.length>1){
      //console.log(props.data[0].data[2].masking_percent)
      setMaskingperc(data => data = 100-props.data[0].data[2].masking_percent)
      setData(data => data = props.data[0].data)
      setState(state=>({...state, textFieldValue: JSON.parse(localStorage.getItem("orchestrations")).length+": "+props.data[2]}))
      props.data[1].map(m=>{
        instColors.push('')
        instDescr.push('')
      }) //MAKE SLOT FOR EVERY INST, EVEN FOR TARGET
      props.data[0].data[3].map((val,i)=>{
        if(i===0){
          instColors[val]='red'
          instDescr[val]='strongest masker'
        }else if(i===1){
          instColors[val]='magenta'
          instDescr[val]='2nd masker'
        }else if(i===2){
          instColors[val]='yellow'
          instDescr[val]='3rd masker'
        }else{
          instColors[val]=''
          instDescr[val]=''
        }
      })
      setColor(instColors)
      setDescription(instDescr)
    }
  }, [props]);

  const instmod = (e) => {
    let tempList = []
    if (modList.length===0){
      tempList = [...list]
    } else {
      tempList = [...modList]
    }
    tempList[e.idx] = e.row

    setModList(modlist=>modlist=tempList)
    //console.log(tempList)
    let newData = []
    tempList.map(row=>{
      if(row[5]){
        newData.push(row)
      }
    })
    setList(list=>list=newData)
    axios.post(baseURL+"modalSlice", newData).then((response) => {
      //console.log(response)
      var result = response.data
      setData(state => state.data = result.data)
      setMaskingperc(data => data = 100-result.data[2].masking_percent)
      let Colors=[]
      let descriptions=[]
      props.data[1].map(m=>{
        Colors.push('')
        descriptions.push('')
      })

      

      // Rather complex pattern no fetch right index for color when an instrument is turned off
      result.data[3].map((val,i)=>{
        if(i===0){
          const indx0 = newData[val][6] // get the index of the instrument
          props.data[1].map((r,indx)=>{
            if(r[6]===indx0){    //compare the index to the original list of instruments (props.data[1])
              Colors[indx]='red'
              descriptions[indx]='strongest masker'
            }
          })

        }else if(i===1){
          const indx0 = newData[val][6]
          props.data[1].map((r,indx)=>{
            if(r[6]===indx0){
              Colors[indx]='magenta'
              descriptions[indx]='2nd masker'
            }
          })
        }else if(i===2){
          const indx0 = newData[val][6]
          props.data[1].map((r,indx)=>{
            if(r[6]===indx0){
              Colors[indx]='yellow'
              descriptions[indx]='3rd masker'
            }
          })
        }
      })

      setColor(state=>state=Colors)
      setDescription(descriptions)
    })
  }

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  var instrumentList=[]

  const rowChange = (i,e) => {

  }
  const handleSave = () => {
    if(list.length>0){
      let newOrch = JSON.parse(localStorage.getItem("orchestrations"))
      let newList = [...list]
      newList = newList.map(itm=>[itm[0], itm[1], itm[2], [itm[3]], itm[4], itm[5], itm[6], itm[7] ])
      console.log(newList)
      let id = 0
      if(newOrch!=null){
        if(newOrch.length>0){
          id=newOrch[newOrch.length-1].id+1
        }
        newOrch.push({id:id, name:state.textFieldValue,data:newList})
        localStorage.setItem("orchestrations", JSON.stringify(newOrch))
        setSaved(()=>true)
    }
    }
  }
  let listenList = []
  if (modList.length===0){
    listenList = list
  } else {
    modList.map(row=>{
      if(row[5]){
        listenList.push([row[0], row[1], row[2], row[3]+row[7]])
      }
    })
  }
  /*
  if(data.length>3){
    instColors.length = data[3].length
    data[3].map((val,i)=>{
      if(i===0){instColors[val]='red'}else if(i===1){instColors[val]='magenta'}else if(i===2){instColors[val]='yellow'}else{instColors[val]=''}
    })
  }
  */
  const handleTextFieldChange = (e) => setState(state=>({...state, textFieldValue:e.target.value}))
  const Saving=()=>{
    if(saved){return<div style={{textAlign:"center"}}>Saved!</div>}else{return <div>
      <TextField fullWidth value={state.textFieldValue} label="save name" onChange={handleTextFieldChange} />
      <Button fullWidth={true} variant="contained" color="secondary" onClick={handleSave}> Save to your list of orchestrations </Button>
      </div>}
  }
  const CHROMATIC = [ 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'Bb', 'B' ]
  function mid2note (midi) {
    var name = CHROMATIC[midi % 12]
    var oct = Math.floor(midi / 12) - 1
    return name + oct
  }
  return (
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
              <div>Click here, or press ESC to close</div>
            </IconButton>
          </Toolbar>
        </AppBar>
        <div style={{textAlign:"center"}}>
          <Typography>
            You can alter the orchestration by clicking the colored values. The changes do not affect the original score.
          </Typography>
          <table style={{margin: "auto", display: 'inline'}}>
            <tbody>
          <tr>
            <td>Instr.</td>
            <td>Tech.</td>
            <td>Dyn.</td>
            <td>Tune</td>
            <td>Role</td>
            <td>On/Off</td>
            <td>Transpose +- oct.</td>
          </tr>
          { list.map((lst, idx)=><InstModify help={props.help} onChange={instmod} idx={idx} row={lst} color={''}/>)
          }
          </tbody>
          </table>
          <Tooltip followCursor title={<Helps help="Maskers"/>} disableTouchListener={!props.help} disableHoverListener={!props.help} sx={{zIndex:99999}}>     
          <table style={{margin: "auto",display: 'inline'}}>
            <tbody>
            <tr><td>maskers</td></tr>
          {color.map((col,i)=><tr><td style={{backgroundColor:col, borderRadius: 10, padding: 4, textAlign: "center", margin:4}}>{list[i][0]}{" "}{mid2note(list[i][3])}{" "+description[i]}</td></tr>)}
          </tbody>
          </table>
          </Tooltip>
          <br/>
          <Tooltip followCursor title={<Helps help="Prediction"/>} disableTouchListener={!props.help} disableHoverListener={!props.help} sx={{zIndex:99999}}>
            <div>
          <Typography variant="caption" component="div" color="text.secondary">
            Target audibility prediction: 
          </Typography>
          <Box sx={{ position: 'relative', display: 'inline-flex' }}>
      <CircularProgress variant="determinate" value={maskingperc} color={(() => {
                      if(maskingperc<=30){
                        return "error"
                      }else if(maskingperc<=50){
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
          {`${Math.round(maskingperc)}%`}
        </Typography>
      </Box>
    </Box>
    </div>
    </Tooltip>
          <br/>
          <Tooltip followCursor title={<Helps help="SaveOrch"/>} disableTouchListener={!props.help} disableHoverListener={!props.help} sx={{zIndex:99999}}>
            <div>
          <SaveOrch text={state.textFieldValue} orchestration={list}/>
          </div>
          </Tooltip>
          <Tooltip followCursor title={<Helps help="QuickListen"/>} disableTouchListener={!props.help} disableHoverListener={!props.help} sx={{zIndex:99999}}>
            <div>
          <QuickListen instrumentList={listenList}/>
          </div>
          </Tooltip>
            <Graphs data={data} help={props.help}/>
            <Tooltip followCursor title={<Helps help="Listen"/>} disableTouchListener={!props.help} disableHoverListener={!props.help} sx={{zIndex:99999}}>
              <div>
            <Dragdrop instrumentList={listenList}/>
            </div>
            </Tooltip>
            
        </div>
      </Dialog>
    </div>
  );
}