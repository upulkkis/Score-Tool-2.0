import * as React from 'react';
import { DragDropContainer, DropTarget } from 'react-drag-drop-container';
import Select from '@mui/material/Select';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Button from '@mui/material/Button';
import axios from "axios";
import { address } from './Constants';
const baseURL = address

export default function Dragdrop(props) {

    const auto_assign_position = (name) => {
        let pos=21
        const pos_list={
            'violin': 2, 'viola': 8, 'cello': 11, 'double_bass': 14, 'flute':15, 'oboe':16, 'clarinet':17, 'bassoon':18, 'horn':19, 'trumpet':22, 'tenor_trombone':23, 'bass_trombone':21, 'timpani':22, 'cymbal':24
        }
        if (Object.keys(pos_list).includes(name))
            pos=pos_list[name]
        return pos
    }
    let instruments = []
    props.instrumentList.map(listItem=>instruments.push(listItem[0]))

    //const instruments = ["violin", "cello", "bassoon", "horn"]
      const styles = {fontSize: 32, fontWeight: 'bold', margin: 20, cursor: 'pointer'};
      const positionList = [
        //left,top,name
        [10, 50, 3],
        [20, 50, 2],
        [30, 50, 1],
        
        [60, 50, 10],
        [70, 50, 11],
        [80, 50, 12],
        
        [15, 35, 6],
        [25, 35, 5],
        [40, 40, 4],
        
        [55, 40, 7],
        [65, 35, 8],
        [75, 35, 9],
        [86, 35, 13],
        
        [18, 20, 20],
        [32, 20, 19],
        [45, 30, 15],
        
        [50, 30, 16],
        [70, 20, 24],
        [80, 20, 14],
        
        [40, 10, 22],
        [50, 10, 21],
        [60, 10, 23],
        
        [45, 20, 17],
        [50, 20, 18],
        
        [45, 55, 25]
        ]
        let hState = []
        positionList.map(p=>hState.push(false))
        const [state, setState] = React.useState({
            clicked: false,
            over: false,
            drop: "not yet",
            instrument_assignment: instruments.map(inst=>auto_assign_position(inst)),
            hoverState: hState,
            position: "audience",
            audio: "",
            play:false
          });
          React.useEffect(() => {
            setState(state=>({...state, instrument_assignment: instruments.map(inst=>auto_assign_position(inst))}))
          },[props])

          React.useEffect(() => {
            if(state.play){
              document.getElementById("AUDIOPLAY").play();
             }
          },[])



      if(props.instrumentList.length === 0){
        return null
      }
  /*  
      const handleMouseOver = () => {
        setState({...state, over: true});
      };
    
      const handleMouseOut = () => {
        setState({...state, over: false});
      };
*/

      const dropped = (idx,e) =>{
          
        console.log(idx)
        if(e){
          const new_ass = [...state.instrument_assignment]
          new_ass[e.dragData.data] = idx
          const new_hvr = [...state.hoverState]
            new_hvr[idx-1] = false
          setState({...state, instrument_assignment: new_ass, hoverState: new_hvr})
        }

      }

      const addHere = (idx,e) =>{
        const new_ass = [...state.hoverState]
        new_ass[idx] = true
        setState({...state, hoverState: new_ass});
      }

      
      const leave = (idx,e) =>{
        const new_ass = [...state.hoverState]
        new_ass[idx] = false
        setState({...state, hoverState: new_ass});
      }

      const setPosition = (offsetLeft, offsetTop, number) => {
        const left = (offsetLeft)+"%";
       const top = offsetTop+"%";
return (
    <div style={{left: left, position: 'absolute', top:top}}>
    <DropTarget 
    onHit={e=>dropped(number, e)}
    targetKey="foo" 
    onDragEnter={e=>addHere(number-1, e)} 
    onDragLeave={e=>leave(number-1, e)} 
>
    <h2 style={{backgroundColor:"rgba(0,255,0,0.3)", borderRadius:"30px", padding:6}}>{number}{" "}{state.hoverState[number-1] ? 'DROP HERE' : ''}</h2>
</DropTarget>
</div>
)
}
  /*
  <style>
    .highlighted .my_target {background-color: 'lightblue'}
  </style>
  */
 const listen = () =>{
    setState({...state, audio: ""})
     const postData = {orchestration: props.instrumentList.map(lst=>lst[0]+","+lst[1]+","+lst[2]+","+lst[3]), 
     positions: state.instrument_assignment, listeningPosition: state.position}
  axios.post(baseURL+"listen", postData, {
    headers: {
      auth: 'uljasPulkkis' 
    }
   })
.then(res =>{
    const audio = <div><audio controls autoPlay="true" id="AUDIOPLAY"> <source src={res.data} type="audio/x-wav"/> </audio></div>
    setState({...state, audio: audio, play:true})
})
.catch(error=>console.log(error))
 }

  return(
    <div style={{maxWidth:800, textAlign: "center", margin: "auto", alignItems: "center"}}>
            <div style={{padding:20}}>Here you can listen how your orchestration sounds like played with real instruments in Helsinki Music Center hall. The algorithm utilize pre-calculated impulse responses. Helsinki Musiikkitalo spatial impulse response measurements are done by Aalto University. They are used here with permission from Prof. Tapio Lokki, who has computed the binaural responses</div>
  <div style={{marginTop:-20,padding:20}}>Drag the instruments of your orchestration to the place on stage you want them to play. Select the listening position, selecting 'conductor' places you on the conductor podium and 'audience' to the center of row 6. When you are ready, tap 'listen' and wait for a few seconds for calculations.</div>
  <Button
        onClick={listen}
        variant="contained"
      >
        click here to calculate acoustics and listen
      </Button>
      {state.audio}
            <div style={{display: 'block'}}>
            <FormControl sx={{ m: 1, minWidth: 50 }}>
              <InputLabel id="listen-select">Position</InputLabel>
              <Select
                labelId="listen-select"
                id="listen-select"
                value={state.position}
                onChange={e => setState({...state, position: e.target.value})}
                autoWidth
                label="listen-select"
              >
                <MenuItem value="audience">audience</MenuItem>
                <MenuItem value="conductor">conductor</MenuItem>
              </Select>
            </FormControl>
            </div>
    <div style={{float: 'left'}}>
        {instruments.map((inst, idx)=>{
            return(
      <DragDropContainer dragClone={false} targetKey="foo" onDrop={dropped} dragData={{data:idx}} >
      <div style={{backgroundColor:"rgba(0,255,255,0.3)", borderRadius:"30px", fontSize:24, padding:10}}>
            {inst+": "+state.instrument_assignment[idx]}
      </div>
    </DragDropContainer>
        )})}


    </div>
    <div style={{clear: 'both'}}>&nbsp;</div>


    <div style={{ backgroundImage: "url(./musatalo.jpg)", position:"relative", backgroundSize: "100% 120%", backgroundRepeat:"no-repeat" }}>
  <div style={{minHeight:"50vh"}}>
    {positionList.map(values => setPosition(values[0], values[1], values[2]))}
    </div>
    </div>




  </div>
  )

}

/*
    {places.map((place, idx)=>{
        return(
    <DropTarget 
    onHit={e=>dropped(idx, e)}
    targetKey="foo" 
    onDragEnter={e=>addHere(idx, e)} 
    onDragLeave={e=>leave(idx, e)} 
>
    <p>{place}</p>
    <div>{state.hoverState[idx] ? 'DROP HERE' : ''}</div>
</DropTarget>
    )})}
*/