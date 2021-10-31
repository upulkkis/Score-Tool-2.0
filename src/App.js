import React, { Component, Suspense, lazy } from 'react';
import Dropzone from 'react-dropzone';
import './App.css';
import Score from './lib/Score'
import Button from '@mui/material/Button';
import { styled } from '@mui/material/styles';
import Paper from '@mui/material/Paper';
import { Typography } from '@mui/material';
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
import CompareArrows from '@mui/icons-material/CompareArrows';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { ManageSearch, ScoreSharp } from '@mui/icons-material';
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
    this.state = { file: "", cursor:false, next:0, files: [], load:"none", chord:false, compare:false, search:false, manage:false,analyze: "none", about:"block", osmd:""};
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
    //localStorage.setItem("orchestrations", JSON.stringify([]))
    if(items===null){
      localStorage.setItem("orchestrations", JSON.stringify([]) )
    }
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
      const reader = new FileReader()
      //console.log(file)
      reader.onabort = () => console.log('file reading was aborted')
      reader.onerror = () => console.log('file reading has failed')
      reader.onload = () => {
      // Do whatever you want with the file contents
        const txtStr = reader.result
        //console.log(binaryStr)
        this.setState(state => {
          state.file = txtStr
          state.load = "inline-block"
        });
        this.forceUpdate()
      }
      //reader.readAsArrayBuffer(file)
      reader.readAsText(file)

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
      this.setState(state => state.osmd = <Score file={file} show={this.state.cursor} next={this.state.next} />);
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
      let hide = "inline-block"
      if(this.state.load==="inline-block"){
hide = "none"
      }
      osmd= <div>
        <div style={{display: hide}}>
                    <Button onClick={this.loadFile} variant="contained">
Load current file
</Button>
</div>
<div style={{display: this.state.load}}>
<Score file={this.state.file} show={this.state.cursor} next={this.state.next} />
</div>
</div>
    }

    // const trythis = () => {
    //   return extract("bsn", Object.keys(DBinstruments))[0][0]
    // }
    document.body.style.backgroundColor = "#fffef0"
    return (
      <div className="App">
       <Item>
        <header className="App-header" style={{padding: 10, borderRadius:20}}>
          <h1 className="App-title" style={{padding: 10, borderRadius:20}}>Score-Tool 2.0</h1>
          <h1 className="App-title" style={{padding: 10, borderRadius:20}}>Psychoacoustic orchestration tool by Uljas Pulkkis 2021</h1>
        </header>
 
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

            <ChordDialog handleClose = {this.chordClose.bind(this)} open={this.state.chord}/>
            <CompareDialog handleClose = {this.compareClose.bind(this)} open={this.state.compare}/>
            <SearchDialog handleClose = {this.searchClose.bind(this)} open={this.state.search}/>
            <ManageDialog handleClose = {this.manageClose.bind(this)} open={this.state.manage}/>

        <div className="" style={{display: this.state.analyze}}>
        <Typography style={{textAlign:"center"}}> Select an example score  </Typography>
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
      <Typography style={{textAlign:"center"}}> or  </Typography>
        <Dropzone onDrop={this.onDrop} maxFiles={1} accept="text/xml">
        {({getRootProps, getInputProps}) => (
          <section className="container">
            <div {...getRootProps({className: 'dropzone Upload'})} style={{margin: 20, padding: 10, borderRadius:10, border: "2px dashed #4c4c48", backgroundColor: "#dcc4ac"}}>
              <input {...getInputProps()} />
              <p>Drop musicXML or click</p>
            </div>
            <aside>
              <div>{files}</div>
            </aside>
          </section>
        )}
      </Dropzone>
      {osmd}
      {this.state.osmd}
      </div>
      <div style={{display: this.state.about, textAlign: "left", textJustify: "left", paddingInline: "20vw"}}>
<AboutScoreTool/>
</div>
        </Item>
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