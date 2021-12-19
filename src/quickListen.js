import * as React from 'react';
import Button from '@mui/material/Button';
import axios from "axios";
import { address } from './lib/Constants';

const baseURL = address
//const baseURL = "http://127.0.0.1:5000/"
//const baseURL = "https://rest.score-tool.com/";

export default function QuickListen(props) {

    let instruments = []
    props.instrumentList.map(listItem=>instruments.push(listItem[0]))

    const auto_assign_position = (name) => {
        let pos=21
        const pos_list={
            'violin': 2, 'viola': 8, 'cello': 11, 'double_bass': 14, 'flute':15, 'oboe':16, 'clarinet':17, 'bassoon':18, 'horn':19, 'trumpet':22, 'tenor_trombone':23, 'bass_trombone':21, 'timpani':22, 'cymbal':24
        }
        if (Object.keys(pos_list).includes(name))
            pos=pos_list[name]
        return pos
    }

    const [state, setState] = React.useState({
        instrument_assignment: instruments.map(inst=>auto_assign_position(inst)),
      });
      React.useEffect(() => {
        setState(state=>({...state, instrument_assignment: instruments.map(inst=>auto_assign_position(inst))}))
      },[props])


    const listen = () =>{
        setState({...state, audio: ""})
         const postData = {orchestration: props.instrumentList.map(lst=>lst[0]+","+lst[1]+","+lst[2]+","+lst[3]), 
         positions: state.instrument_assignment, listeningPosition: "audience"}
      axios.post(baseURL+"listen", postData, {
        headers: {
          auth: 'uljasPulkkis' 
        }
       })
    .then(res =>{
        const audio = <div style={{transform: "scale(0.5,0.5)"}}><audio controls autoPlay="true" id="AUDIOPLAY"> <source src={res.data} type="audio/x-wav"/> </audio></div>
        setState({...state, audio: audio})
    })
    .catch(error=>console.log(error))
     }
     return (
         <div style={{transform: "scale(0.8,0.8)"}}>
        <Button
        size="small"
        onClick={listen}
        variant="contained">
        Quick listen
      </Button>
      {state.audio}
      </div>
     )
}