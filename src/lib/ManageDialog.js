import * as React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Slide from '@mui/material/Slide';
import ChordEditor from './ChordEditor';
import Dropzone from 'react-dropzone';
import Orchestration from './Orchestration';
import axios from 'axios';
const baseURL = "https://rest.score-tool.com/";
//const baseURL = "http://127.0.0.1:5000/";
const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export default function ManageDialog(props) {
  const CHROMATIC = [ 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'B#', 'B' ]
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

    const [orch, setOrch] = React.useState([]);

    const [listen, setListen] = React.useState([]);

    React.useEffect(() => {
        setOpen(state => state = props.open)
        let newListen = []
        newListen.length = JSON.parse(localStorage.getItem("orchestrations")).length
        setListen(()=>newListen)
    }, [props])

    React.useEffect(() => {
      setOrch(()=>JSON.parse(localStorage.getItem("orchestrations")))
      let newListen = []
      newListen.length = JSON.parse(localStorage.getItem("orchestrations")).length
      setListen(()=>newListen)
  }, [])

  React.useEffect(() => {
    setOrch(()=>JSON.parse(localStorage.getItem("orchestrations")))
    let newListen = []
    newListen.length = JSON.parse(localStorage.getItem("orchestrations")).length
    setListen(()=>newListen)
}, [localStorage.getItem("orchestrations")])

    const downloadTxtFile = () => {
        const element = document.createElement("a");
        const file = new Blob([localStorage.getItem("orchestrations")], {type: 'text/plain'});
        element.href = URL.createObjectURL(file);
        element.download = "orchestration.chords";
        document.body.appendChild(element); // Required for this to work in FireFox
        element.click();
      }

    const eraseAll=()=>{
      setOrch(()=>[])
        localStorage.setItem("orchestrations", JSON.stringify([]))
    }
    const handleDelete=(i, e)=>{
      console.log(i)
      const orchst = JSON.parse(localStorage.getItem("orchestrations"))
      const newOrchst = orchst.filter((v,p,a)=>(v.id!=i) )
      setOrch(()=>newOrchst)
      localStorage.setItem("orchestrations", JSON.stringify(newOrchst))
  }
  const onDrop=(files)=>{
    files.forEach((file) => {
      const reader = new FileReader()
      //console.log(file)
      reader.onabort = () => console.log('file reading was aborted')
      reader.onerror = () => console.log('file reading has failed')
      reader.onload = () => {
      // Do whatever you want with the file contents
        let oldList = JSON.parse(localStorage.getItem("orchestrations"))
        let listLength = 0
        if(oldList.length>0){
          listLength = oldList[oldList.length-1].id+1
        }
        const txtStr = JSON.parse(reader.result)
        txtStr.map(e=>{
          const k = e.id
          const j = e.name
          const h = e.data
        })
        txtStr.map((e,i)=>{
          let newLine = e
          newLine.id = listLength+i
          oldList.push(newLine)
        })
        setOrch(()=>oldList)
        localStorage.setItem("orchestrations", JSON.stringify(oldList))
      }
      //reader.readAsArrayBuffer(file)
      reader.readAsText(file)
  })
}

const handleListen=(i, ODATA,e)=>{
  let miniList = []
  ODATA.map((elem, i)=>{
        elem[3].map(arrNote=>{
          let micro = 0
          if(typeof(elem[7])==='number'){
            micro = elem[7]
          }
          miniList.push(elem[0]+","+elem[1]+","+elem[2]+","+(arrNote+micro))
        })
      } )
      axios.post(baseURL+"listen", {orchestration: miniList, positions:Array(miniList.length).fill(17), listeningPosition: "audience"}, {
        headers: {
          auth: 'uljasPulkkis' 
        }
       })
    .then(res =>{
        const audio = <div><audio controls autoPlay="true"> <source src={res.data} type="audio/x-wav"/> </audio></div>
        let newListen = [...listen]
        newListen[i] = audio
        
        setListen(()=>newListen)
    })
}

const selectedSource=(lista)=>{
  if(lista.length>0){
    let miniList = []
    let index = 0
    lista.map((elem, i)=>{
      elem[3].map(arrNote=>{
        let micro = 0
        if(typeof(elem[7])==='number'){
          micro = elem[7]
        }
        miniList.push([elem[0], elem[1], elem[2], arrNote+micro, elem[4], elem[5], index])
        index += 1
      })
    } )
    miniList.sort(function(a, b){return a[3]-b[3]})
    let notes=miniList.map(l=>mid2note(l[3]))
    let instruments=miniList.map(l=>l[0])
    return <div style={{textAlign:"center", margin:"auto"}}><Orchestration
    notes={notes}
    instruments={instruments}
    target={[]}
    scale={0.3}
    width={150}
    height={90}
    t_score_y={110}
    b_score_y={170}
    text_space={30}/></div>
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
                <div>Click here, or press ESC to close Manage Panel</div>
              </IconButton>
            </Toolbar>
          </AppBar>
          <Typography style={{textAlign:"center"}}>
              Here you can manage your saved orchestrations
          </Typography>
          <Dropzone onDrop={onDrop} maxFiles={1} accept=".chords">
        {({getRootProps, getInputProps}) => (
          <section className="container">
            <div {...getRootProps({className: 'dropzone Upload'})} style={{margin: 5, padding: 5, borderRadius:10, border: "2px dashed #4c4c48"}}>
              <input {...getInputProps()} />
              <p style={{textAlign:"center"}}>Upload your saved file of orchestration chords</p>
            </div>
            <aside>
              <div></div>
            </aside>
          </section>
        )}
      </Dropzone>
          {orch.length===0 && <Typography style={{textAlign:"center"}}>
              Add some orchestrations to your list (Upload a pre-saved file, or click save either in Score Analyzer or in Chord Editor.)
          </Typography>
        }
          {orch.length>0 && <div> 
            <Button onClick={downloadTxtFile} variant="contained" color="primary" style={{padding: 10, margin: 5}}> Download your orchestrations </Button>
            <Typography style={{textAlign:"center"}}>
              List of your orchestrations
          </Typography>
            <table style={{textAlign:"center", margin:"auto"}}>
              <tbody>
                <tr>
                  <td>Name</td>
                  <td>Orchestration</td>
                  <td>Listen</td>
                  <td>Delete</td>
                  </tr>
          {orch.map((o, i)=><tr> <td >{o.name}</td>  <td>{selectedSource(o.data)}</td>
            <td><Button onClick={(e)=>handleListen(i, o.data,e)} variant="contained" color="secondary" style={{padding: 10, margin: 5}}> LISTEN </Button>{listen[i]}</td>
            <td><Button onClick={(e)=>handleDelete(o.id, e)} variant="contained" color="warning" style={{padding: 10, margin: 5}}> DELETE </Button></td>
          </tr>)}
          </tbody>
          </table>

          <Button onClick={eraseAll} variant="contained" color="error" style={{padding: 10, margin: 5}}> Erase all your orchestrations </Button>
        </div>
        }
        
          </Dialog>
          </div>
    )
}