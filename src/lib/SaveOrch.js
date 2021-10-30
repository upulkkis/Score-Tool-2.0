import * as React from 'react';
import { TextField } from '@mui/material';
import { Button } from '@mui/material';

export default function SaveOrch({text, orchestration}) {
    const [state, setState] = React.useState({
        textFieldValue: text,
        saved: false
    });
    React.useEffect(()=>{
        setState(state=>({...state,
            saved: false,
            textFieldValue: text
          }))
    },[orchestration]
    )
    const handleSave = () => {
        if(orchestration.length>0){
          let newOrch = JSON.parse(localStorage.getItem("orchestrations"))
          let id = 0
          if(newOrch!=null){
            if(newOrch.length>0){
              id=newOrch[newOrch.length-1].id+1
            }
            console.log(orchestration)
            console.log(typeof(orchestration[0][3]))
            if(typeof(orchestration[0][3])==="number"){
              newOrch.push({id:id, name:state.textFieldValue,data:orchestration.map(itm=>[itm[0], itm[1], itm[2], [itm[3]], itm[4], itm[5], itm[6] ])})
            }else{
              newOrch.push({id:id, name:state.textFieldValue,data:orchestration})
            }
            localStorage.setItem("orchestrations", JSON.stringify(newOrch))
            setState(state=>({...state,
              saved: true
            }))
          }   
        }
      }

    const handleTextFieldChange = (e) => {
        const newTxt = e.target.value
        setState(state=>({...state, textFieldValue:newTxt}))
    }

const Saving=()=>{
    if(state.saved){return<div style={{textAlign:"center"}}>Saved!</div>}else{return <div>
      <TextField fullWidth value={state.textFieldValue} label="save name" onChange={handleTextFieldChange} />
      <Button fullWidth={true} variant="contained" color="secondary" onClick={handleSave}> Save to your list of orchestrations </Button>
      </div>}
  }

  return(<div>
      {Saving()}
      </div>
  )
}