import React, { Component, Suspense, lazy } from 'react';
import Dropzone from 'react-dropzone';
import './App.css';
import MyNavbar from './MyNavbar';
import { Tooltip } from '@mui/material';
import Helps from './help/helps';
import Score from './lib/Score'
import Button from '@mui/material/Button';
import { styled } from '@mui/material/styles';
import Paper from '@mui/material/Paper';
import { Typography } from '@mui/material';
import { TextField, Backdrop, CircularProgress } from '@mui/material';
import Select from '@mui/material/Select';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import ChordDialog from './lib/ChordDialog';
import CompareDialog from './lib/CompareDialog';
import SearchDialog from './lib/SearchDialog';
import ManageDialog from './lib/ManageDialog';
import AboutScoreTool from './AboutScoreTool';
import IconButton from '@mui/material/IconButton';
import QueueMusic from '@mui/icons-material/QueueMusic';
import LibraryMusic from '@mui/icons-material/LibraryMusic';
import SettingsApplications from '@mui/icons-material/SettingsApplications';
import Info from '@mui/icons-material/Info';
import Clear from '@mui/icons-material/Clear';
import CompareArrows from '@mui/icons-material/CompareArrows';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { ManageSearch, ScoreSharp } from '@mui/icons-material';
import { MXLHelper } from 'opensheetmusicdisplay';
const theme = createTheme({
  palette: {
  neutral: {
    main: '#dcc4ac',
    contrastText: '#black'
  }
}
})

//const OpenSheetMusicDisplay = React.lazy(() => import('./lib/OpenSheetMusicDisplay'));
const Item = styled(Paper)(({ theme }) => ({
    ...theme.typography.body2,
    backgroundColor: "#fffef0",
    padding: theme.spacing(1),
    textAlign: 'center',
    color: theme.palette.text.secondary,
  }));

class App extends Component {
  constructor(props) {
    super(props);
    // Don't call this.setState() here!
    // this.state = { file: "MuzioClementi_SonatinaOpus36No1_Part2.xml", cursor:false, next:0 };
    this.state = { loading:false, from: 0, to: 0, file: "", filetype:"",cursor:false, help:false,next:0, files: [], load:"none", chord:false, compare:false, search:false, manage:false,analyze: "none", about:"block", osmd:""};
    // this.state = { file: "Flute_Concerto_Uljakselle.xml", cursor:false, next:0 };
    this.setcursor = this.setcursor.bind(this)
    this.setnext = this.setnext.bind(this)
    this.loadFile = this.loadFile.bind(this);
    this.onDrop = (files) => {
      this.setState({files})
    };
    document.title = "Score-Tool 2.0"
  }
  componentDidMount(){
    const items = JSON.parse(localStorage.getItem("orchestrations"))
    console.log(items)
    //localStorage.setItem("orchestrations", JSON.stringify([]))
    if(items===null){
      localStorage.setItem("orchestrations", JSON.stringify([]) )
    }
  }
  componentDidUpdate(prevProps){

  }
  chordClose() {
    this.setState(state => state.chord=false);
  };
  compareClose() {
    this.setState(state => state.compare=false);
  };
  searchClose() {
    this.setState(state => state.search=false);
  };
  manageClose() {
    this.setState(state => state.manage=false);
  };
  setcursor() {
    this.setState(state => state.cursor = true);
  }

  loadFile(){
    
    //console.log(this.state)
      this.state.files.forEach((file) => {
      let filename = file.name;
      let filetype = ""
      const reader = new FileReader()
      if (filename.toLowerCase().indexOf(".xml") > 0
      || filename.toLowerCase().indexOf(".musicxml") > 0) {
        this.setState(state => state.filetype = "xml")
        filetype = "xml"
      reader.readAsText(file);
  } else if (filename.toLowerCase().indexOf(".mxl") > 0) {
    this.setState(state => state.filetype = "mxl")
    filetype = "mxl"
      reader.readAsBinaryString(file);
  }
  else {
      alert("No vaild .xml/.mxl/.musicxml file!");
  }
      //console.log(file)
      reader.onabort = () => console.log('file reading was aborted')
      reader.onerror = () => console.log('file reading has failed')
      reader.onload = () => {
      // Do whatever you want with the file contents
        const txtStr = reader.result
        
        if (filetype==="mxl") {
          if (this.state.from > 0 && this.state.to > 0) {
          //this.setState(state => state.loading = true) 
          let parser = new DOMParser();
          MXLHelper.MXLtoXMLstring(txtStr).then((x) => {
            let xmlDoc = parser.parseFromString(x,"text/xml")
            let measures = xmlDoc.getElementsByTagName("measure")
            for (var i = measures.length - 1; i >= 0; i--) {
              if (i%100===0){
              console.log("Bars left to check: "+i)
              }
              // console.log("test number: "+measures[i].getAttribute("number"))
              if (parseInt(measures[i].getAttribute("number"))<this.state.from || parseInt(measures[i].getAttribute("number"))>this.state.to){
                // console.log("pass number: "+measures[i].getAttribute("number"))
                if (parseInt(measures[i].getAttribute("number"))!==1){
                  // console.log("remove number: "+measures[i].getAttribute("number"))
                  measures[i].parentNode.removeChild(measures[i])
                  //measures[i].textContent = ""
                }
              }
            }
            this.setState(state => state.loading = false)
            //console.log(xmlDoc)
            this.setState(state => state.osmd= <div>
            <Score file={xmlDoc} filename={this.state.files[0].name+this.state.files[0].size} help={this.state.help} show={this.state.cursor} next={this.state.next} />
            </div>
            )
            this.setState(state => state.filetype = "done")
            
          })
        } else {
          this.setState(state => state.loading = false)
          this.setState(state => state.osmd = <div>
          <Score file={txtStr} filename={this.state.files[0].name+this.state.files[0].size} help={this.state.help} show={this.state.cursor} next={this.state.next} />
          </div>
          )
          this.setState(state => state.filetype = "done")
        }
      } else if (filetype==="xml") {
        if (this.state.from > 0 && this.state.to > 0) {
          //this.setState(state => state.loading = true)
        let parser = new DOMParser();
        //onsole.log(this.state.file)
        let xmlDoc = parser.parseFromString(txtStr,"text/xml")
        let measures = xmlDoc.getElementsByTagName("measure")
        for (var i = measures.length - 1; i >= 0; i--) {
          // console.log("test number: "+measures[i].getAttribute("number"))
          if (parseInt(measures[i].getAttribute("number"))<this.state.from || parseInt(measures[i].getAttribute("number"))>this.state.to){
            // console.log("pass number: "+measures[i].getAttribute("number"))
            if (parseInt(measures[i].getAttribute("number"))!==1){
              // console.log("remove number: "+measures[i].getAttribute("number"))
              measures[i].parentNode.removeChild(measures[i])
            }
          }
        }
        this.setState(state => state.loading = false)
        this.setState(state => state.osmd  = <div>
        <Score file={xmlDoc} filename={this.state.files[0].name+this.state.files[0].size} help={this.state.help} show={this.state.cursor} next={this.state.next} />
        </div>
        )
        this.setState(state => state.filetype = "done")
      } else {
        this.setState(state => state.loading = false)
        this.setState(state => state.osmd = <div>
        <Score file={txtStr} filename={this.state.files[0].name+this.state.files[0].size} help={this.state.help} show={this.state.cursor} next={this.state.next} />
        </div>
        )
        this.setState(state => state.filetype = "done")
  
      }
    }

        this.setState(state => {
          state.file = ""
          state.load = "inline-block"
          
        });
        //this.forceUpdate()
      }
      

      //reader.readAsArrayBuffer(file)
      //reader.readAsText(file)

  })
  }

  setnext() {
    var nbr = this.state.next
    this.setState(state => state.next = nbr+1);
  }

  handleClick(event) {
    const file = event.target.value;
    this.setState(state => state.file = file);
  }

//           <img src={logo} className="App-logo" alt="logo" />
  render() {

    const files = this.state.files.map(file => (
      <li key={file.name}>
        {file.name} - {file.size} bytes
      </li>
    ));
    
    const Scores = () =>{
      const availableScores = ["test_score2.xml", "sonority.xml"]
      return(
        availableScores.map(s=><MenuItem value={s}>{s}</MenuItem>)
      )
    }

    var osmd = []
    const handleScore = (e) =>{
      const file = e.target.value;
     
      //this.setState(state => state.osmd = <Score id={file+"fromExamples"} file={file} filename={file+"fromExamples"} help={this.state.help} show={this.state.cursor} next={this.state.next}/>);
      //osmd = <Score id={file+"fromExamples"} file={file} filename={file+"fromExamples"} help={this.state.help} show={this.state.cursor} next={this.state.next}/>;
      this.setState(state => state.filetype = "done")
      this.setState(state => state.load = "block")
      this.setState(state => state.file = file)
      this.setState(state => state.osmd  = <div>
        <Score file={file} filename={file+"fromExamples"} help={this.state.help} show={this.state.cursor} next={this.state.next} />
        </div>)
      this.setState(state => state.files = [{name:file, size:"fromExamples"}])
    }
    //console.log(this.state.files[0])
    
    /*
    if (this.state.files[0]){
  osmd= <div>
  <button  onClick={this.loadFile} style={{width:40, height: 40}}>
  Load current file
</button>
  <button  onClick={this.setcursor} style={{width:40, height: 40}}>
  Cursor
</button>
<button  onClick={this.setnext} style={{width:40, height: 40}}>
  next {this.state.next}
</button>
<OpenSheetMusicDisplay file={this.state.file} show={this.state.cursor} next={this.state.next}/>
</div>
    }
    */
    if (this.state.files[0]){
      //console.log(this.state.files)
      let hide = "inline-block"
      if(this.state.load==="inline-block"){
        hide = "none"
      }
     if (this.state.filetype==="done"){
    osmd = ""
  }else {
    osmd= <div>
    <div style={{display: hide}}>
      <Typography>If you have huge score, you can set the bar range here to conciderably reduce the loading time (numbers only, first bar will always show because of the musicXML format restrictions)</Typography>
    <div>
        <TextField
          label="from bar"
          id="outlined-size-small"
          defaultValue={0}
          size="small"
          value={this.state.from}
          onChange={e=>this.setState(state=>state.from = e.target.value)}
        />
        <TextField
          label="to bar"
          id="outlined-size-small"
          defaultValue={0}
          size="small"
          value={this.state.to}
          onChange={e=>this.setState(state=>state.to = e.target.value)}
        />
      </div>
                <Button onClick={() => {
                  this.setState(state => state.loading = true)
                  setTimeout(() => this.loadFile(), 200)
                }  
                } variant="contained">
Load current file (Warning! Large scores with 200+ bars can freeze the browser)
</Button>
</div>
</div>
  }
      
      /*
      console.log(xmlDoc)
      let measures = xmlDoc.getElementsByTagName("measure")
      let from = 3
      let to = 5
      for (var i = measures.length - 1; i >= 0; i--) {
        // console.log("test number: "+measures[i].getAttribute("number"))
        if (parseInt(measures[i].getAttribute("number"))<from || parseInt(measures[i].getAttribute("number"))>to){
          // console.log("pass number: "+measures[i].getAttribute("number"))
          if (parseInt(measures[i].getAttribute("number"))!==1){
            // console.log("remove number: "+measures[i].getAttribute("number"))
            measures[i].parentNode.removeChild(measures[i])
          }
        }
      }
      console.dirxml(xmlDoc)
      //this.setState(state=>state.osmd="")
*/

    }

    // const trythis = () => {
    //   return extract("bsn", Object.keys(DBinstruments))[0][0]
    // }
    const clearAll = () =>{
      localStorage.clear();
      localStorage.setItem("orchestrations", JSON.stringify([]) );
    }
    document.body.style.backgroundColor = "#fffef0"
    const navClick = (e) => {
      //console.log(e)
      switch (e) {
        case "Score": 
          this.setState(state=>({...state, analyze: "block", about:"none", chord: false, compare: false, search: false, manage:false}))
          break
        case "Chord":
          this.setState(state=>({...state, chord: true, analyze: "none", about:"none", compare: false, search: false, manage:false}))
          break
        case "Compare":
          this.setState(state=>({...state, compare: true, analyze: "none", about:"none", chord: false, search: false, manage:false}))
          break
        case "Search":
          this.setState(state=>({...state, search: true, analyze: "none", about:"none", chord: false, compare: false, manage:false}))
          break
        case "About":
          this.setState(state=>({...state, analyze: "none", about:"block", chord: false, compare: false, search: false, manage:false}))
          break
        case "Manage":
          this.setState(state=>({...state, manage: true, analyze: "none", about:"none", chord: false, compare: false, search: false}))
          break
        default:
          break
      }

    }
    const helpSel = (e) => {
      this.setState(state=>state.help=e)
    }
    return (
      <div className="App">
        <MyNavbar navClick={navClick} help={helpSel}/>
       <Item>
       <div style={{display: this.state.about}}>
        <header className="App-header" style={{padding: 10, borderRadius:20}}>
          <h1 className="App-title" style={{padding: 10, borderRadius:20}}>Score-Tool 2.0</h1>
          <h1 className="App-title" style={{padding: 10, borderRadius:20}}>Psychoacoustic orchestration tool by Uljas Pulkkis 2021</h1>
        </header>
      </div>
{/*}
        <ThemeProvider theme={theme}>
<div style={{padding: 10}}>
<div style={{display: "inline"}}>
        <Button onClick={()=>this.setState(state=>({...state, analyze: "none", about:"block"}))} variant="contained" color="neutral" startIcon={<Info/>} style={{padding: 10, margin: 5}}> About Score-tool</Button>
      </div>   
<div style={{display: "inline"}}>
        <Button onClick={()=>this.setState(state=>({...state, analyze: "block", about:"none"}))} variant="contained" color="neutral" startIcon={<LibraryMusic/>} style={{padding: 10, margin: 5}}> Open score analyzer</Button>
      </div>    
        <div style={{display: "inline"}}>
        <Button onClick={()=>this.setState(state=>({...state, chord: true, analyze: "none", about:"none"}))} variant="contained" color="neutral" startIcon={<QueueMusic/>} style={{padding: 10, margin: 5}}> Open chord editor</Button>
      </div>      
      <div style={{display: "inline"}}>
        <Button onClick={()=>this.setState(state=>({...state, compare: true, analyze: "none", about:"none"}))} variant="contained" color="neutral" startIcon={<CompareArrows/>} style={{padding: 10, margin: 5}}> Open compare editor</Button>
      </div>
      <div style={{display: "inline"}}>
        <Button onClick={()=>this.setState(state=>({...state, search: true, analyze: "none", about:"none"}))} variant="contained" color="neutral" startIcon={<ManageSearch/>} style={{padding: 10, margin: 5}}> Open search panel</Button>
      </div>
      <div style={{display: "inline"}}>
        <Button onClick={()=>this.setState(state=>({...state, manage: true, analyze: "none", about:"none"}))} variant="contained" color="neutral" startIcon={<SettingsApplications/>} style={{padding: 10, margin: 5}}> Manage your orchestrations </Button>
      </div>
      </div>
</ThemeProvider>
    */}
            <ChordDialog help={this.state.help} handleClose = {this.chordClose.bind(this)} open={this.state.chord}/>
            <CompareDialog help={this.state.help} handleClose = {this.compareClose.bind(this)} open={this.state.compare}/>
            <SearchDialog help={this.state.help} handleClose = {this.searchClose.bind(this)} open={this.state.search}/>
            <ManageDialog help={this.state.help} handleClose = {this.manageClose.bind(this)} open={this.state.manage}/>

        <div className="" style={{display: this.state.analyze}}>
        {this.state.load==="none" && <div>
        <Typography style={{textAlign:"center"}}> Select an example score  </Typography>
        <Tooltip title={<Helps help="Examples"/>} disableTouchListener={!this.state.help} disableHoverListener={!this.state.help} placement="top">
      <FormControl sx={{ m: 1, minWidth: 150 }}>
              <InputLabel id="score-select">Scores</InputLabel>
              <Select
                labelId="score-select"
                id={"score-select"+1}
                value={this.state.selected}
                onChange={handleScore}
                autoWidth
                label="score"
              >
                {Scores()}
              </Select>
            </FormControl>
            </Tooltip>
      <Typography style={{textAlign:"center"}}> or  </Typography>
        <Dropzone onDrop={this.onDrop} maxFiles={1} accept=".xml,.musicXml,.mxl">
        {({getRootProps, getInputProps}) => (
          <Tooltip title={<Helps help="Dropzone"/>} disableTouchListener={!this.state.help} disableHoverListener={!this.state.help}>
          <section className="container">
            <div {...getRootProps({className: 'dropzone Upload'})} style={{margin: 20, padding: 10, borderRadius:10, border: "2px dashed #4c4c48", backgroundColor: "#dcc4ac"}}>
              <input {...getInputProps()} />
              <p>Drop musicXML or click</p>
            </div>
            <aside>
              <div>{files}</div>
            </aside>
          </section>
          </Tooltip>
        )}
      </Dropzone>
      </div>
}
      {osmd}
      {this.state.osmd}
      </div>
      <div style={{display: this.state.about, textAlign: "left", textJustify: "left", paddingInline: "20vw"}}>
<AboutScoreTool/>
<Button size="small" onClick={clearAll} variant="contained" color="warning" startIcon={<Clear/>} style={{padding: 10, margin: 5}}> If you get errors, click here to clear all your orchestration data </Button>
</div>
        </Item>
        <Backdrop
        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={this.state.loading}
      >
        <CircularProgress disableShrink color="success"/>
        <Typography> Cutting extra measures from your score. If there's 100s of bars, this can take awhile...</Typography>
      </Backdrop>
      </div>
    );
  }
}

/*
        <select onChange={this.handleClick.bind(this)}>
          <option value="MuzioClementi_SonatinaOpus36No1_Part2.xml">Muzio Clementi: Sonatina Opus 36 No1 Part2</option>
          <option value="Beethoven_AnDieFerneGeliebte.xml">Beethoven: An Die FerneGeliebte</option>
        </select>
*/

export default App;
