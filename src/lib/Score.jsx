import React, { Component } from 'react';
import { ColoringModes, OpenSheetMusicDisplay as OSMD, PointF2D, GraphicalLabel, Label, TextAlignmentEnum, GraphicalObject } from 'opensheetmusicdisplay';
//import * as OSMD from '../opensheetmusicdisplay.min.js';
import Button from '@mui/material/Button';
import Slider from '@mui/material/Slider';
import Helps from '../help/helps';
import RespSlider from './RespSlider';
import Select from '@mui/material/Select';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Switch from '@mui/material/Switch';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Tooltip, FormGroup, FormControlLabel, Checkbox, Box } from '@mui/material';
import { Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import axios from "axios";
import {extract} from 'fuzzball';
import { assignName } from './assignNamesToDatabase';
import { DBinstruments } from '../instruments';
import { noteNumbers } from './noteNumbers';
import AnalysisDialog from './analysisModal';
import InstSelect from './InstSelect';
import { AppBar, Container } from '@mui/material';
import { styled } from '@mui/material/styles';
import Paper from '@mui/material/Paper';
import * as svg from 'save-svg-as-png';
import CircularProgress from '@mui/material/CircularProgress';
import { Backdrop } from '@mui/material';
import { typography } from '@mui/system';
import { address } from './Constants';
import Orchestration from './Orchestration';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import jsPDF  from 'jspdf';
import {svg2pdf} from 'svg2pdf.js';
import ScrollHide from './ScrollHide';
import StatPlots from '../StatPlots';
const theme = createTheme({
  palette: {
  neutral: { 
    main: '#dcc4ac',
    contrastText: 'black'
  }
}
})

const Item = styled(Paper)(({ theme }) => ({
    ...theme.typography.body2,
    backgroundColor: "#fffef0",
    padding: theme.spacing(1),
    textAlign: 'center',
    color: theme.palette.text.secondary,
  }));

const baseURL = address
//const baseURL = "http://127.0.0.1:5000/"; // http://127.0.0.1:5000/databaseInstruments

class Score extends Component {
    constructor(props) {
      super(props);
      this.state = { statisticPlots: "", calculatingState: "", help:false, tooltip:"", showTooltip:true, expanded:true, includeGraphs:true,interruptCalculation:false, dataReady: false, loading:false,loaded: false,cur: false, calculIndications: false, measureTimestamps:[],measureRange: [1,2], maxMeasure:2, instNames:[], scoreNames:[], scoreTechs:[], scoreDyns:[], scoreTgt:[], scoreOnoff:[], scoreModify:[],instData:{}, open: false, time:[], modalData: []};
      this.osmd = undefined;
      this.orchestrationChords = undefined;
      this.barTimestamps = [];
      this.threeDdata = {target: {}, orchestration: {}, locs:[]};
      this.scoregraphs = {distance: {}, homog: {}, centroid: {}};
      this.cursor = undefined;
      this.next = undefined;
      this.show = true;
      this.divRef = React.createRef();
      this.measureHandleChange = this.measureHandleChange.bind(this);
      this.calculateMasking = this.calculateMasking.bind(this);
      this.update = this.update.bind(this);
      this.handleClose = this.handleClose.bind(this);
    }

    setupOsmd() {
      this.setState(state => ({...state, loading: true, help: this.props.help}))
      let measureRangeStart = 1
      let measureRangeEnd = 10
      const options = {
        autoResize: this.props.autoResize !== undefined ? this.props.autoResize : false,
        drawTitle: this.props.drawTitle !== undefined ? this.props.drawTitle : true,
        loadUrlTimeout: 10000,
        drawSlurs: false,
        // drawFromMeasureNumber : measureRangeStart,
        // drawUpToMeasureNumber : measureRangeEnd
      }
      this.osmd = new OSMD(this.divRef.current, options);
      //this.osmd.setLogLevel("trace")
      //this.osmd.drawingParameters = ["compacttight"]
      //console.log(this.state.instData)
      this.osmd.load(this.props.file).then(() => {
        let scale = 0.5
        const numberOfStaves = this.osmd.sheet.staves.length
        if (numberOfStaves>10){
          scale=0.4
        }else if (numberOfStaves>20){
          scale=0.2
        }else if (numberOfStaves>30){
        scale=0.1
      }else if (numberOfStaves>40){
        scale=0.05
      }
        this.osmd.zoom = scale;

        let instNames = []
        let scoreNames = []
        let scoreTechs = []
        let scoreDyns = []
        let scoreTgt = []
        let scoreOnoff = []
        let scoreModify = []
        //console.log(this.props.filename)
        try{
          const savedData = JSON.parse(localStorage.getItem(this.props.filename))
          instNames = savedData.instNames
          scoreNames = savedData.scoreNames
          scoreTechs = savedData.scoreTechs
          scoreDyns = savedData.scoreDyns
          scoreTgt = savedData.scoreTgt
          scoreOnoff = savedData.scoreOnoff
          scoreModify = savedData.scoreModify
          }
        catch{
        instNames = []
        scoreNames = []
        scoreTechs = []
        scoreDyns = []
        scoreTgt = []
        scoreOnoff = []
        scoreModify = []
        this.osmd.sheet.staves.map(p =>{
          instNames.push(p.parentInstrument.nameLabel.text)
          scoreNames.push(assignName(p.parentInstrument.nameLabel.text))
          scoreTechs.push("normal")
          scoreDyns.push("from_score")
          scoreTgt.push(0)
          scoreOnoff.push(1)
          scoreModify.push(0)
        })
      }
        /*
        this.osmd.setOptions({
          //renderSingleHorizontalStaffline: true,
        drawFromMeasureNumber:5,
      drawUpToMeasureNumber: 8})
      */
        // console.log(this.osmd)
        let measureTimestamps = []
        this.osmd.sheet.sourceMeasures.map(msr => measureTimestamps.push(msr.absoluteTimestamp.realValue))
        measureTimestamps.push(999999)
        this.setState(state => {
          state.measureRange=[1,this.osmd.sheet.SourceMeasures.length]
          state.maxMeasure=this.osmd.sheet.SourceMeasures.length
          state.instNames=instNames
          state.scoreNames=scoreNames
          state.scoreTechs=scoreTechs
          state.scoreDyns=scoreDyns
          state.scoreTgt=scoreTgt
          state.scoreOnoff=scoreOnoff
          state.scoreModify=scoreModify
          state.measureTimestamps=measureTimestamps
        })
        //this.osmd.render() 
        //this.renderScore()
        this.forceUpdate()
        // console.log(this.osmd.GraphicSheet.musicSheet.staves[0].voices[0].voiceEntries[0])
        // this.osmd.GraphicSheet.musicSheet.staves[0].voices[0].voiceEntries[0].stemColor = 'red'
        //this.osmd.GraphicSheet.musicSheet.staves[0].voices[0].voiceEntries[0].notes[0].noteheadColor = 'red'
      }).then(()=>this.setState(state => ({...state, loading: false}))
      ).catch(()=>this.setState(state => ({...state, loading: false})))
      
    }

    update(){
      this.osmd.updateGraphic()
    }

    setLoading(){
      this.setState(state => ({...state, loading: true, expanded: false}))
      this.osmd.setOptions({
        drawFromMeasureNumber: this.state.measureRange[0],
      drawUpToMeasureNumber: this.state.measureRange[1],
    })
      // setTimeout(() => this.osmd.render(), 200)
      setTimeout(() => this.renderScore(), 210)
    }

    renderScore(){
      this.osmd.render()
      this.barTimestamps = this.osmd.sheet.sourceMeasures.map(bar=>bar.absoluteTimestamp.realValue) // Get real values of barline positions
      this.setState(state => state.loaded=true)
      let partDyns = []
      /*
      this.osmd.graphic.musicSheet.Parts.map(p =>{
        instNames.push(p.nameLabel.text)
      })
      */
             
      
      for(let i=0;i<this.osmd.graphic.VerticalGraphicalStaffEntryContainers[0].StaffEntries.length;i++){
        partDyns.push({"0":"mf"}) // Set initial dynamics as mf for every staff
      }
      //console.log(this.state.instNames)
      //console.log(partDyns)
      /*
      this.osmd.graphic.VerticalGraphicalStaffEntryContainers[0].StaffEntries.map(startingDyns =>{
        startingDyns.parentMeasure.parentStaffLine.abstractExpressions.map(exp => {
            partDyns.push({[exp.SourceExpression.multiExpression.AbsoluteTimestamp.realValue]: exp.Expression})
          })
        if(!startingDyns.parentMeasure.parentStaffLine.abstractExpressions){partDyns.push([])}
      })
      */

      // Check through score if dynamics change and set the timestamp for new dynamics
      let partNotes = {}
      let xpositions = {}
      let predictions = {}
      let sustainingNotes = []
      sustainingNotes.length = this.state.instNames.length
      /*
      console.log("range")
      console.log(this.state.measureRange)
      console.log(this.state.measureTimestamps)
      console.log(this.state.measureTimestamps[this.state.measureRange[0]-1])
      console.log(this.state.measureTimestamps[this.state.measureRange[1]])
      */
      
      let sustainingDynamics = []
      for(let i=0;i<this.state.instNames.length;i++){
        sustainingDynamics.push("mf")
      }
      //Get dynamics before selected measures
      this.osmd.sheet.sourceMeasures.map(measure=>{
        if(measure.absoluteTimestamp.realValue<this.state.measureTimestamps[this.state.measureRange[0]-1]){
          measure.staffLinkedExpressions.map((expList, index)=>{
            // console.log(expList)
            if (expList.length>0){
              expList.map(ex=>{
                  ex.expressions.map(exp=>{
                  if(exp.expression.dynamicEnum<=5){
                    sustainingDynamics[index] = "p"
                  }else if(exp.expression.dynamicEnum<=7){
                    sustainingDynamics[index] = "mf"
                  }else if(exp.expression.dynamicEnum<=13){
                    sustainingDynamics[index] = "f"
                  }
                })
              })
            }
          })
      }
      })
      this.osmd.graphic.VerticalGraphicalStaffEntryContainers.map(verticals => {
        
        //GATHER ALL DYNAMICS, EVEN BEFORE SELECTED MEASURE 
        //UPDATE, CANNOT DO IT, CANCEL
        /*
        if(verticals.absoluteTimestamp.realValue<this.state.measureTimestamps[this.state.measureRange[0]-1]){
        for(let i=0;i<verticals.StaffEntries.length;i++){
          if(verticals.StaffEntries[i]){
            if (typeof(verticals.StaffEntries[i].parentMeasure.parentStaffLine)!=="undefined"){
              if (verticals.StaffEntries[i].parentMeasure.parentStaffLine.hasOwnProperty("abstractExpressions")){
              verticals.StaffEntries[i].parentMeasure.parentStaffLine.abstractExpressions.map(exp => {
                if(exp.SourceExpression.hasOwnProperty("multiExpression")){
                partDyns[i][String(exp.SourceExpression.multiExpression.AbsoluteTimestamp.realValue)] = exp.Expression
                sustainingDynamics[i] = exp.Expression
                }
              }
            )
              }
          }}}}
          */
          //DYNAMiCS
          
        //  console.log(sustainingDynamics)
        let notesAtPoint = []
        notesAtPoint.length = verticals.StaffEntries.length
        if(verticals.absoluteTimestamp.realValue>=this.state.measureTimestamps[this.state.measureRange[0]-1] && verticals.absoluteTimestamp.realValue<=this.state.measureTimestamps[this.state.measureRange[1]]){
          for(let i=0;i<verticals.StaffEntries.length;i++){
          notesAtPoint[i]=[]
          if(verticals.StaffEntries[i]){
            if (typeof(verticals.StaffEntries[i].parentMeasure.parentStaffLine)!=="undefined"){
              if (verticals.StaffEntries[i].parentMeasure.parentStaffLine.hasOwnProperty("abstractExpressions")){
              verticals.StaffEntries[i].parentMeasure.parentStaffLine.abstractExpressions.map(exp => {
                if(exp.SourceExpression.hasOwnProperty("multiExpression")){
                partDyns[i][String(exp.SourceExpression.multiExpression.AbsoluteTimestamp.realValue)] = exp.Expression
                }
              }
            )
              }
          }

            if (verticals.StaffEntries[i].sourceStaffEntry.voiceEntries){
              verticals.StaffEntries[i].sourceStaffEntry.voiceEntries[0].notes.map(note => {
                if (note.halfTone>0){
                  if(partDyns[i].hasOwnProperty(String(verticals.AbsoluteTimestamp.realValue))){
                    sustainingDynamics[i] = partDyns[i][String(verticals.AbsoluteTimestamp.realValue)]
                  }
                  xpositions[String(verticals.AbsoluteTimestamp.realValue)] = verticals.StaffEntries[i].boundingBox.absolutePosition.x
                  notesAtPoint[i].push({note: Math.round(note.halfTone), dynamic: sustainingDynamics[i]})
                  sustainingNotes[i] = {note: Math.round(note.halfTone), start: verticals.AbsoluteTimestamp.realValue, duration: note.length.realValue}
                }
              })
            }

        } else {
          if (sustainingNotes[i]){
            if (sustainingNotes[i].start+sustainingNotes[i].duration>=verticals.AbsoluteTimestamp.realValue){
              if(partDyns[i].hasOwnProperty(String(verticals.AbsoluteTimestamp.realValue))){
                sustainingDynamics[i] = partDyns[i][String(verticals.AbsoluteTimestamp.realValue)]
              }
              notesAtPoint[i].push({note: sustainingNotes[i]["note"], dynamic: sustainingDynamics[i]})
              
            } else {
              sustainingNotes[i] = []
            }
          }
        }

      }
    }
      partNotes[verticals.AbsoluteTimestamp.realValue] = notesAtPoint
      predictions[verticals.AbsoluteTimestamp.realValue] = -1
      })
      // console.log(partDyns)
      // console.log(partNotes)
      this.orchestrationChords = {instruments: this.state.instNames, databaseEntries: {inst:this.state.scoreNames, tech:this.state.scoreTechs, dyn:this.state.scoreDyns, tgt:this.state.scoreTgt,onoff:this.state.scoreOnoff, modify:this.state.scoreModify},dynamics: partDyns, notes: partNotes, predictions: predictions, maskers: {}, xpos: xpositions}
      this.setState(state => ({...state, loading: false}))
    }
  
    resize() {
      //this.forceUpdate();
    }

    handleClose() {
      this.setState(state => state.open=false);
    };

    calcStop(){
      this.setState(state => state.interruptCalculation=true);
    }

  
    measureHandleChange(event, newValue, activeThumb){
      if (!Array.isArray(newValue)) {
        return;
      }
      //console.log(newValue)
      //let measureRange = [...this.state.measureRange];
      //measureRange = newValue
      //this.setState({measureRange});
      this.setState(state => state = {
        ...this.state,
        measureRange: newValue
      })
    }

    calculateMasking(){

      //Code to color an individual bar in blue:
      //let boundingbox = this.osmd.graphic.measureList[0][1].boundingBox
      // this.osmd.drawer.drawBoundingBox(boundingbox, "rgba(0,255,0,0.2)", false, "TARGET")

      //DRAW TARGET STAFFS IN LIGHT GREEN:
      this.osmd.graphic.musicPages[0].musicSystems.map(system=>{
        system.staffLines.map((SL,ind)=>{
          if(this.state.scoreTgt[ind]){
            this.osmd.drawer.drawBoundingBox(SL.boundingBox, "rgba(255, 0, 0,0.2)", false, "TARGET")

            let newLabel = new Label("Target")
            let GLabel = new GraphicalLabel(newLabel, 4, TextAlignmentEnum.LeftBottom, this.osmd.EngravingRules, SL.boundingBox)
            GLabel.PositionAndShape = SL.boundingBox
            GLabel.PositionAndShape.AbsolutePosition.x =GLabel.PositionAndShape.AbsolutePosition.x-10
            GLabel.setLabelPositionAndShapeBorders()
            //GLabel.TextLines = [{text:"JUBU", xOffset:10, width: 10}]
            //GLabel.TextLines = []
            this.osmd.drawer.drawLabel(GLabel)
          }
        }) 
      })

      

      /*
      let newLabel = new Label("JUBU")
      let GLabel = new GraphicalLabel(newLabel, 4, TextAlignmentEnum.LeftCenter, this.osmd.EngravingRules, boundingbox)
      GLabel.TextLines = [{text:"JUBU", xOffset:10, width: 10}]
      //GLabel.TextLines = []
      this.osmd.drawer.drawLabel(GLabel, 0)
    */

      this.setState(state => state.interruptCalculation=false);
      //console.log(this.orchestrationChords)
      let j = 0
      calc = calc.bind(this)
      const measuresToCalculate = this.state.measureTimestamps.slice(this.state.measureRange[0]-1, this.state.measureRange[1])
      let measuresLeft = 999999999
      calc(j)
      this.setState(state => state.calculIndications=true);

      let calcStarted = false
      
      function calc(p){

        let verticals = this.osmd.graphic.VerticalGraphicalStaffEntryContainers[p]
        // console.log(verticals.absoluteTimestamp.realValue)
      //this.osmd.graphic.VerticalGraphicalStaffEntryContainers.map(verticals =>{
        if(verticals.absoluteTimestamp.realValue>=this.state.measureTimestamps[this.state.measureRange[0]-1] && verticals.absoluteTimestamp.realValue<=this.state.measureTimestamps[this.state.measureRange[1]]){

        if(measuresToCalculate.filter(value=>value>verticals.absoluteTimestamp.realValue).length+1<measuresLeft){
          measuresLeft = measuresToCalculate.filter(value=>value>verticals.absoluteTimestamp.realValue).length+1
          this.setState(state=>({ ...state, calculatingState: <> <Typography> Measures left to calculate: {measuresToCalculate.filter(value=>value>verticals.absoluteTimestamp.realValue).length+1} of {measuresToCalculate.length}</Typography> <Button variant="contained" color="info" onClick={this.calcStop.bind(this)}>Stop calculation</Button> </> }))
        }
        calcStarted = true

        let noteArray = this.orchestrationChords.notes[verticals.absoluteTimestamp.realValue]
        let data = []
        let targets = []
        let tgtPresent = false
        noteArray.map((note,idx) => {
          if(this.orchestrationChords.databaseEntries.tgt[idx]){
            targets.push(idx)
          }
          if(note.length>0){
            let dynamic = []
            if(this.orchestrationChords.databaseEntries.dyn[idx]!=="from_score"){
              dynamic=this.orchestrationChords.databaseEntries.dyn[idx]
            }
            if(this.orchestrationChords.databaseEntries.tgt[idx]){
              tgtPresent = true
            }
            note.map(n => {
              // console.log(n.dynamic)
              // console.log(["ppppp", "pppp", "ppp", "pp", "p"].includes(n.dynamic))
              if(dynamic.length===0 && ["ppppp", "pppp", "ppp", "pp", "p"].includes(n.dynamic)){
                dynamic = "p"
              }else if(dynamic.length===0 && ["fffff", "ffff", "fff", "ff", "f", "sfz", "sf"].includes(n.dynamic)){
              dynamic = "f"
              }else if(dynamic.length===0 && ["mf", "mp", "mfz"].includes(n.dynamic)){
                dynamic = "mf"
                }
          data.push([this.orchestrationChords.databaseEntries.inst[idx], this.orchestrationChords.databaseEntries.tech[idx], dynamic, n.note+12+this.orchestrationChords.databaseEntries.modify[idx], this.orchestrationChords.databaseEntries.tgt[idx], this.orchestrationChords.databaseEntries.onoff[idx], idx])
            })  
        }
        })
        //console.log(data)
        data = data.filter((v,i,a)=> {
          if (v[5]){
            try{
              return v[3]>=noteNumbers[v[0]][v[1]][v[2]][0] && v[3]<=noteNumbers[v[0]][v[1]][v[2]][1]
            }catch{
              return false
            }
          } else return false
        })
        //console.log(data)

        const tgtColor = (val) => {
          let col = "rgba(0,255,0,0.3)"
          if(val>=75){
            const mod= 1 - ((val-74.9)/50)
            col = `rgba(${Math.round(255*mod)},0,0,0.7)`
          } else if (val>=50){
            const mod= 1 - ((val-54.9)/25)
            col = `rgba(255,${Math.round(255*mod)},0,0.5)`
          }else if (val>=25){
            const mod= (val-24.9)/25
            col = `rgba(${Math.round(255*mod)},255,0,0.5)`
          }
          return col
        }

        axios.post(baseURL+"maskingSlice", data).then((response) => {
          //console.log(response)
          var result = response.data
          //console.log(result)
          let Thnote = []
          verticals.StaffEntries.map(entry => Thnote=entry.sourceStaffEntry.voiceEntries[0].notes[0])
          var measureNumber = Thnote.parentStaffEntry.verticalContainerParent.parentMeasure.measureNumber
          const xposition = this.orchestrationChords.xpos[verticals.absoluteTimestamp.realValue]-1
          var GraphicalMusicPage = this.osmd.graphic.MusicPages[0]
          if(result){
            if(true){ //was: if(result[0]), but leads to skip if target is fully audible
              if(this.state.includeGraphs){
              this.threeDdata.target[verticals.AbsoluteTimestamp.realValue] = new Array(107).fill(-20);
              }
              if(tgtPresent){
          targets.map(tgt=>{
            var StaffY = this.osmd.graphic.musicSheet.sourceMeasures[measureNumber-1].verticalMeasureList[tgt].boundingBox.absolutePosition.y+2
            const startPointF2D = new PointF2D(xposition, StaffY); //{x: xpos, y: ypos};
            const endPointF2D = new PointF2D(xposition+2, StaffY); //{x: xpos, y: ypos}
            let col = tgtColor(result[0])

            // console.log(result[0])
            this.osmd.Drawer.DrawOverlayLine(startPointF2D, endPointF2D, GraphicalMusicPage,
              col, 4)    
          })
          if(this.state.includeGraphs){
          this.threeDdata.target[verticals.AbsoluteTimestamp.realValue] = result[5][1]
          }
          this.orchestrationChords.predictions[verticals.AbsoluteTimestamp.realValue] = result[0]
          this.orchestrationChords.maskers[verticals.AbsoluteTimestamp.realValue] = result[1]
        } // "rgba(255,0,0,0.7)"  "rgba(255,255,0,0.5)"  "rgba(0,255,0,0.3)"     "rgba(255,51,255,0.5)"    "rgba(255,153,51,0.5)" "rgba(51,153,355,0.5)"
            }
            if(result[1]){
              result[1].map((ind, i) =>{
                var StaffY = this.osmd.graphic.musicSheet.sourceMeasures[measureNumber-1].verticalMeasureList[ind].boundingBox.absolutePosition.y+2
                
                if(this.state.includeGraphs){
                this.threeDdata.orchestration[verticals.AbsoluteTimestamp.realValue] = result[5][0]
                this.threeDdata.locs = result[5][2]

                this.scoregraphs.distance[verticals.AbsoluteTimestamp.realValue] = result[2]
                this.scoregraphs.homog[verticals.AbsoluteTimestamp.realValue] = result[3]
                this.scoregraphs.centroid[verticals.AbsoluteTimestamp.realValue] = result[4]
                }
                const startPointF2D = new PointF2D(xposition, StaffY); //{x: xpos, y: ypos};
                const endPointF2D = new PointF2D(xposition+2, StaffY); //{x: xpos, y: ypos}
                let col = []
                if(i===0){
                  col = "rgba(255,51,255,0.5)"
                  this.osmd.Drawer.DrawOverlayLine(startPointF2D, endPointF2D, GraphicalMusicPage,
                    col, 4)   
                }else if(i===1){
                  col = "rgba(255,153,51,0.5)" 
                  this.osmd.Drawer.DrawOverlayLine(startPointF2D, endPointF2D, GraphicalMusicPage,
                    col, 4)  
                }else if(i===2){
                  col = "rgba(51,153,355,0.5)"
                  this.osmd.Drawer.DrawOverlayLine(startPointF2D, endPointF2D, GraphicalMusicPage,
                    col, 4)  
                } 
              })
            }

        }

          /*
          //Get absolute y position of first staff:
          var firstStaffY = this.osmd.graphic.musicSheet.sourceMeasures[measureNumber-1].verticalMeasureList[0].boundingBox.absolutePosition.y+2
          var secondStaffY = this.osmd.graphic.musicSheet.sourceMeasures[measureNumber-1].verticalMeasureList[1].boundingBox.absolutePosition.y+2
          
          //console.log(this.orchestrationChords.xpos)
          //Create starting point
          const startPointF2D_1 = new PointF2D(xposition, firstStaffY); //{x: xpos, y: ypos};
          const endPointF2D_1 = new PointF2D(xposition+2, firstStaffY); //{x: xpos, y: ypos}        
          const startPointF2D_2 = new PointF2D(xposition, secondStaffY); //{x: xpos, y: ypos};
          const endPointF2D_2 = new PointF2D(xposition+2, secondStaffY); //{x: xpos, y: ypos}
  
          //Draw thick red line to score:

          this.osmd.Drawer.DrawOverlayLine(startPointF2D_1, endPointF2D_1, GraphicalMusicPage,
            "#FF0000FF", 4)        
            this.osmd.Drawer.DrawOverlayLine(startPointF2D_2, endPointF2D_2, GraphicalMusicPage,
            "rgba(0,255,0,0.5)", 4)

          //console.log(response.data)
          //this.setState(state => state.instData = response.data);
          */
          }).finally(()=>{
            j++
            if(this.osmd.graphic.VerticalGraphicalStaffEntryContainers.length>j){
            //verticals = this.osmd.graphic.VerticalGraphicalStaffEntryContainers[j]
            if(!this.state.interruptCalculation){
              calc(j)
            }else{
              this.setState(state=>({ ...state, interruptCalculation:false, calculatingState: <Typography> Calculation stopped! </Typography>}))
              if(this.state.includeGraphs){
              this.setState(state=>({ ...state, statisticPlots: <StatPlots bars={this.barTimestamps} predictions={this.orchestrationChords.predictions} threeD={this.threeDdata} graphs={this.scoregraphs}/>}))
              }
            }

            }else{
              this.setState(state=>({ ...state, calculatingState: <Typography> Calculation complete! </Typography>}))
              if(this.state.includeGraphs){
              this.setState(state=>({ ...state, statisticPlots: <StatPlots bars={this.barTimestamps} predictions={this.orchestrationChords.predictions} threeD={this.threeDdata} graphs={this.scoregraphs}/>}))
              }
              
            }
            

            
          });  //AXIOS END


          
        } else {
          j++
          if(this.osmd.graphic.VerticalGraphicalStaffEntryContainers.length>j){
          //verticals = this.osmd.graphic.VerticalGraphicalStaffEntryContainers[j]

          if(!this.state.interruptCalculation){
            if(!calcStarted){
              console.log("this fired")
              calc(j)
            }
          }else{
            this.setState(state=>({ ...state, interruptCalculation:false,  calculatingState: <Typography> Calculation stopped! </Typography>}))
          }
        }
        this.setState(state=>({ ...state, calculatingState: <Typography> Calculation complete! </Typography>}))
        if(this.state.includeGraphs){
        this.setState(state=>({ ...state, statisticPlots: <StatPlots bars={this.barTimestamps} predictions={this.orchestrationChords.predictions} threeD={this.threeDdata} graphs={this.scoregraphs}/>}))
        }
      }
      //}) // map loop end
      }


      

      //console.log(this.orchestrationChords)
      
    }

    componentWillUnmount() {
      window.removeEventListener('resize', this.resize)
    }
  
    
    componentDidUpdate(prevProps) {
      if (this.props.drawTitle !== prevProps.drawTitle) {
        this.setupOsmd();

      } else if(this.props.file !== prevProps.file){
        this.setupOsmd();
        //this.osmd.load(this.props.file).then(() => this.setupOsmd());
      }
      var shw = false
      if (this.props.file && typeof(this.osmd)!=='undefined'){
        if (typeof(this.osmd.cursor)!=='undefined'){
      if (typeof(this.osmd.cursor.hidden)==='undefined' || this.osmd.cursor.hidden){
        // console.log(this.osmd.cursor.hidden)
        shw = true
      }
      if (this.props.show && shw) {
        this.osmd.cursor.show();
      }
      if (this.props.next !== prevProps.next) {
        this.osmd.cursor.next();
        console.log(this.osmd.cursor)
        console.log(this.osmd.cursor.NotesUnderCursor())
        console.log(this.osmd.cursor.VoicesUnderCursor())
        console.log(this.osmd.cursor.iterator.currentTimeStamp.RealValue)
      }
      if (this.props.help !== prevProps.help) {
        
        this.setState(state=>({...state, help: this.props.help}))
      }
      window.addEventListener('resize', this.resize)
    }
  }
    }
  
    // Called after render
    componentDidMount() {
      if (this.props.file){
      this.setupOsmd();
      }
      /*
      axios.get(baseURL+"databaseInstruments").then((response) => {
        //console.log(response.data)
        this.setState(state => state.instData = response.data);
      });
      */
    }
  
    render() {
      const instChange = (idx, event) => {
        let scoreNames = {...this.state.scoreNames}
        let item = {...scoreNames[idx]}
        item = event.target.value
        scoreNames[idx] = item
        this.setState({scoreNames})
        //this.setState(state => state.scoreNames[idx] = event.target.value)
      }
      const techChange = (idx, event) => {
        this.setState(state => state.scoreTechs[idx] = event.target.value)
      }
      const dynChange = (idx, event) => {
        this.setState(state => state.scoreDyns[idx] = event.target.value)
      }
      const modChange = (idx, event) => {
        this.setState(state => state.scoreModify[idx] = event.target.value)
      }
      const tgtChange = (idx, event) => {
        event.persist();
        //console.log(event)
        this.setState(state => state.scoreTgt[idx] = event.target.checked)
      }
      const onoffChange = (idx, event) => {
        event.persist();
        //console.log(event)
        this.setState(state => state.scoreOnoff[idx] = event.target.checked)
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
        const instruments = Object.keys(DBinstruments)
        return (
          <div>
            <FormControl sx={{ m: 1, minWidth: 50 }}>
              <InputLabel id="instrument-select">Instr.</InputLabel>
              <Select
                labelId="instrument-select"
                id={"instrument-select"+idx}
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

      const selectTechs = (name, idx) => {
        const techs = DBinstruments[this.state.scoreNames[idx]]
        return (
          <div>
            <FormControl sx={{ m: 1, minWidth: 50 }}>
              <InputLabel id="tech-select">Tech.</InputLabel>
              <Select
                labelId="tech-select"
                id={"tech-select"+idx}
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
        const dyns = ["from_score", "p", "mf", "f"]
        return (
          <div>
            <FormControl sx={{ m: 1, minWidth: 50 }}>
              <InputLabel id="dyn-select">Dyn.</InputLabel>
              <Select
                labelId="dyn-select"
                id={"dyn-select"+idx}
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
                id={"mod-select"+idx}
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
      let showMasking = []
      let showScore = "inline-block"

      const savePDF = () => {
        const backends = this.osmd.drawer.Backends;
        let svgElement = backends[0].getSvgElement();
        let pageWidth = 210;
        let pageHeight = 297;
        const engravingRulesPageFormat = this.osmd.rules.PageFormat;
        if (engravingRulesPageFormat && !engravingRulesPageFormat.IsUndefined) {
            pageWidth = engravingRulesPageFormat.width;
            pageHeight = engravingRulesPageFormat.height;
        } else {
            pageHeight = pageWidth * svgElement.clientHeight / svgElement.clientWidth;
        }
        console.log(svgElement)
        const orientation = pageHeight > pageWidth ? "p" : "l";
        // create a new jsPDF instance
        let pdf = new jsPDF(orientation, "mm", [pageWidth, pageHeight]);
        const scale = pageWidth / svgElement.clientWidth;
        /*
        for (let idx = 0, len = backends.length; idx < len; ++idx) {
            if (idx > 0) { 
                pdf.addPage();
            }

            svgElement = backends[idx].getSvgElement();
            pdf.svg(svgElement)
            // render the svg element
            svg2pdf(svgElement, pdf, {
                scale: scale,
                xOffset: 0,
                yOffset: 0
            });
        }
        */
        pdf.svg(svgElement, {
          x:0,y:0,width:svgElement.clientWidth*scale, height:svgElement.clientHeight*scale
      })
        .then(() => {
          // save the created pdf
          pdf.save('Score-Tool-Score.pdf')
        })
        // simply save the created pdf
        // pdf.save("Score-Tool-Score.pdf");
      }

      const handleShowTooltipChange = () => {
        this.setState(state=>state.showTooltip=!this.state.showTooltip)
      }


      const handleIncludeGraphs = () => {
        this.setState(state=>state.includeGraphs=!this.state.includeGraphs)
      }

      if (this.state.loaded){
        showScore = "none"
        showMasking = <div>
          <Tooltip title={<Helps help="CalcRange"/>}  disableTouchListener={!this.props.help} disableHoverListener={!this.props.help} sx={{zIndex:99999}}>
                <div style={{display:"block", maxWidth:"50%", textAlign:"center", margin:"auto"}}>
      <Typography style={{display:"inline-block"}}> Set calculation bar range:</Typography>
      <div style={{display:"inline-block", width:"30vh", marginInlineStart:"10px"}}>
            <RespSlider style={{display:"inline-block"}} range={this.state.measureRange} max={this.state.maxMeasure} measureHandleChange={this.measureHandleChange}/>
            </div>
            </div>
            </Tooltip>
            <Tooltip title={<Helps help="CalcButton"/>}  disableTouchListener={!this.props.help} disableHoverListener={!this.props.help} sx={{zIndex:99999}}>
          <Button
          size="small"
          sx={{display:"inline-block"}}
        variant="contained"
        color="secondary"
        onClick={() => {
          this.calculateMasking()
        }}
      >
        calculate masking, bars {this.state.measureRange[0]} to {this.state.measureRange[1]} ({this.state.measureRange[1]-this.state.measureRange[0]+1} bars)
      </Button>
      </Tooltip>
      <div style={{display:"inline-block", marginInlineStart:10}}>
                  <FormGroup sx={{display:"inline-block"}}>
                    <FormControlLabel sx={{display:"inline-block"}} control={<Checkbox  style={{display:"inline-block"}} checked={this.state.includeGraphs} onChange={handleIncludeGraphs} />} label="Show graphs (slow for large scores)" />
                  </FormGroup>
                  </div>
      <Tooltip title={<Helps help="Redraw"/>}  disableTouchListener={!this.props.help} disableHoverListener={!this.props.help} sx={{zIndex:99999}}>
      <Button
      size="small"
      style={{marginInline: 10, display:"inline-block"}}
      variant="contained"
      color="warning"
        onClick={() => {

          this.setLoading()
          //this.renderScore()
        }}
      >
        redraw score
      </Button>
      </Tooltip>
      <Tooltip title={<Helps help="DownloadScore"/>} disableTouchListener={!this.props.help}  disableHoverListener={!this.props.help} sx={{zIndex:99999}}>
      <Button size="small" variant="contained" color="primary" onClick={()=> savePDF() /* svg.saveSvgAsPng(document.getElementById('osmdSvgPage1'), 'score.png')*/}>Download score</Button>
      </Tooltip>
      {/* <Typography variant="h5" style={{display:"block"}}> Click any note in score for full analysis.</Typography> */}
      <Tooltip title={<Helps help="UnderMouse"/>}  disableTouchListener={!this.props.help} disableHoverListener={!this.props.help} sx={{zIndex:99999}}>
                  <div style={{display:"inline-block", marginInlineStart:10}}>
                  <FormGroup sx={{display:"inline-block"}}>
                    <FormControlLabel sx={{display:"inline-block"}} control={<Checkbox  style={{display:"inline-block"}} checked={this.state.showTooltip} onChange={handleShowTooltipChange} />} label="Orch. under mouse" />
                  </FormGroup>
                  </div>
</Tooltip>
                  </div>
      }
            
// OLD INSTRUMENT SELECTION
/*

*/
const rowChange = (i, event) => {
  let modified = {
    instNames: [...this.state.instNames],
    scoreNames: [...this.state.scoreNames],
    scoreTechs: [...this.state.scoreTechs],
    scoreDyns: [...this.state.scoreDyns],
    scoreTgt: [...this.state.scoreTgt],
    scoreOnoff: [...this.state.scoreOnoff],
    scoreModify: [...this.state.scoreModify]
  }
  modified.scoreNames[i] = event.scoreNames
  modified.scoreTechs[i] = event.scoreTechs
  modified.scoreDyns[i] = event.scoreDyns
  modified.scoreTgt[i] = event.scoreTgt
  modified.scoreOnoff[i] = event.scoreOnoff
  modified.scoreModify[i] = event.scoreModify


  //console.log(this.state)
  this.setState(state=>{
    state.scoreNames[i] = event.scoreNames
    state.scoreTechs[i] = event.scoreTechs
    state.scoreDyns[i] = event.scoreDyns
    state.scoreTgt[i] = event.scoreTgt
    state.scoreOnoff[i] = event.scoreOnoff
    state.scoreModify[i] = event.scoreModify
  })
  
  localStorage.setItem(this.props.filename, JSON.stringify({
    instNames: modified.instNames,
    scoreNames: modified.scoreNames,
    scoreTechs: modified.scoreTechs,
    scoreDyns: modified.scoreDyns,
    scoreTgt: modified.scoreTgt,
    scoreOnoff: modified.scoreOnoff,
    scoreModify: modified.scoreModify
  }))
}

const handleAccChange = () => {
  this.setState(state=> state.expanded=!this.state.expanded)
}

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
// svg.saveSvgAsPng(document.getElementById('osmdSvgPage1'), 'score.png');
// console.log(this.props.help)
      return (<>
    <ThemeProvider theme={theme}>
      <small>
        <ScrollHide>
      <AppBar color="neutral" style={{overflow:"auto", marginTop:30}}>
        <Container maxWidth="xl" style={{overflow:"auto"}}>
      <Item style={{textAlign: "center", justifyContent: "center", alignItems: "center", alignContent: "center", marginLeft: "auto", marginRight: "auto"}}>
        <Accordion expanded={this.state.expanded} onChange={handleAccChange} style={{backgroundColor: "#f9fff0"}}>
        <Tooltip title={<Helps help="ShowHide"/>}  disableTouchListener={!this.props.help} disableHoverListener={!this.props.help} sx={{zIndex:99999}}>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel1a-content"
          id="panel1a-header"
          style={{textAlign:"center"}}
        >
          <Typography style={{textAlign:"center"}}>Click here to show/hide masking calculation properties</Typography>
        </AccordionSummary>
        </Tooltip>
        <AccordionDetails>
        <Tooltip title={<Helps help="ScoreSlider"/>}  disableTouchListener={!this.props.help} disableHoverListener={!this.props.help} placement="top" sx={{zIndex:99999}}>
          <div>
        <Typography>Select bar range with slider</Typography>
<RespSlider range={this.state.measureRange} max={this.state.maxMeasure} measureHandleChange={this.measureHandleChange}/>
</div>
</Tooltip>
<Tooltip title={<Helps help="Showscore"/>}  disableTouchListener={!this.props.help} disableHoverListener={!this.props.help} sx={{zIndex:99999}}>
<Button style = {{display: showScore, margin:5}} variant="contained" onClick={() => {this.setLoading()}}> Show score</Button>
</Tooltip>
        <div style={{overflow:"auto", maxHeight:"65vh"}}>
<table style={{margin: "auto"}} >
  <tbody>
<tr>
    <th>score name</th>
    <th>instrument</th>
    <th>technique</th>
    <th>dynamic</th>
    <th>orch/target</th>
    <th>on/off</th>
    <th>transpose</th>
  </tr>
{this.state.instNames.map((instName, idx)=>(
    <InstSelect
    idx={idx}       
    instName={instName}
    scoreNames= {this.state.scoreNames[idx]}
    scoreTechs= {this.state.scoreTechs[idx]}
    scoreDyns= {this.state.scoreDyns[idx]}
    scoreTgt= {this.state.scoreTgt[idx]}
    scoreOnoff= {this.state.scoreOnoff[idx]}
    scoreModify= {this.state.scoreModify[idx]}
    onChange= {e => rowChange(idx,e)}
    help={this.props.help}
    />
))}
</tbody>
</table>
</div>
</AccordionDetails>
      </Accordion>
{this.state.loading}
<Tooltip title={<Helps help="Showscore"/>}  disableTouchListener={!this.props.help} disableHoverListener={!this.props.help} sx={{zIndex:99999}}>
            <Button
            style = {{display: showScore, margin:5}}
            variant="contained"
  onClick={() => {
      this.setLoading()
      //this.renderScore()
    //this.renderScore()
  }}
>
  Show score
</Button>
</Tooltip>
{showMasking}
{this.state.calculatingState}
{this.state.calculIndications && <><Tooltip title={<Helps help="Colors"/>}  disableTouchListener={!this.props.help} disableHoverListener={!this.props.help} sx={{zIndex:99999}}>
  <Typography style={{display:"inline"}}>Score colors: 
  <div style={{backgroundImage: `linear-gradient(to right, rgba(120,0,0,0.7) , rgba(255,0,0,0.5))`, display:"inline", marginInline: 2}}> Tgt masked</div> 
  <div style={{backgroundImage: `linear-gradient(to right, rgba(255,0,0,0.5) , rgba(255,255,0,0.5))`, display:"inline", marginInline: 2}}> nearly masked</div> 
  <div style={{backgroundImage: `linear-gradient(to right, rgba(255,255,0,0.5) , rgba(0,255,0,0.3))`, display:"inline", marginInline: 2}}> audible</div> 
  <div style={{backgroundColor: "rgba(255,51,255,0.5)", display:"inline"}}> heaviest masker</div>
  <div style={{backgroundColor: "rgba(255,153,51,0.5)", display:"inline"}}> 2nd masker</div>
  <div style={{backgroundColor: "rgba(51,153,255,0.5)", display:"inline"}}> 3rd masker </div>
  </Typography>
  </Tooltip>
</>
    }
</Item>

        </Container>
      </AppBar>
      </ScrollHide>
      </small>
      </ThemeProvider>
<Item>

<Tooltip title={<div>{this.state.tooltip}</div>} placement="top-start" followCursor>
          
      <div ref={this.divRef} style={{width: window.innerWidth-100, marginTop:240}} onClick={event=>{
        /*
        console.log(event.target.closest('.vf-stavenote'))
        console.log(event.target.parentElement.closest('.vf-stavenote'))
        
        let units = this.osmd.unitInPixels;
        */
       //console.log(event)
        let xpos = event.clientX // / units;
        let ypos = event.clientY // / units;

        
        
        var clickPointF2D = new PointF2D(xpos, ypos); //{x: xpos, y: ypos};
        //console.log(clickPointF2D)
        //console.log(this.osmd.graphic.GetNearestGraphicalObject(clickPointF2D, new GraphicalObject.GraphicalMeasure.name))
        
        let maxDist = {x: 10, y: 10};
        clickPointF2D = this.osmd.graphic.domToSvg(clickPointF2D)
        clickPointF2D = this.osmd.graphic.svgToOsmd(clickPointF2D)
        // console.log(clickPointF2D)
        const Thnote = this.osmd.graphic.GetNearestNote(clickPointF2D, maxDist)
        if (typeof(Thnote)!=='undefined'){
        const absTimeStamp = Thnote.sourceNote.voiceEntry.parentSourceStaffEntry.AbsoluteTimestamp.realValue
        //console.log(absTimeStamp)
        //console.log(this.orchestrationChords.notes[String(absTimeStamp)])
        //console.log("thnote")
        //console.log(Thnote)
        //console.log(Thnote.sourceNote.voiceEntry.timestamp.RealValue)
        
        /*
        if (Thnote.vfnote[0].hasOwnProperty('style')){
          delete(Thnote.vfnote[0].style) 
        } else {
          Thnote.vfnote[0].setStyle({shadowBlur: 70, shadowColor: 'red'})
        }
        
        //Get clicked measure number:
        var measureNumber = Thnote.sourceNote.parentStaffEntry.verticalContainerParent.parentMeasure.measureNumber
        //Get absolute y position of first staff:
        var firstStaffY = this.osmd.graphic.musicSheet.sourceMeasures[measureNumber-1].verticalMeasureList[0].boundingBox.absolutePosition.y+2
        var secondStaffY = this.osmd.graphic.musicSheet.sourceMeasures[measureNumber-1].verticalMeasureList[1].boundingBox.absolutePosition.y+2
        const xposition = this.orchestrationChords.xpos[String(absTimeStamp)]-1
        //console.log(this.orchestrationChords.xpos)
        //Create starting point
        const startPointF2D_1 = new PointF2D(xposition, firstStaffY); //{x: xpos, y: ypos};
        const endPointF2D_1 = new PointF2D(xposition+2, firstStaffY); //{x: xpos, y: ypos}        
        const startPointF2D_2 = new PointF2D(xposition, secondStaffY); //{x: xpos, y: ypos};
        const endPointF2D_2 = new PointF2D(xposition+2, secondStaffY); //{x: xpos, y: ypos}

        //Draw thick red line to score:
        var GraphicalMusicPage = Thnote.ParentMusicPage
        this.osmd.Drawer.DrawOverlayLine(startPointF2D_1, endPointF2D_1, GraphicalMusicPage,
          "#FF0000FF", 4)        
          this.osmd.Drawer.DrawOverlayLine(startPointF2D_2, endPointF2D_2, GraphicalMusicPage,
          "rgba(0,255,0,0.5)", 4)
        */
       //console.log("CLICK POINT")
       //console.log(this.props.file)
       let clickPointText = ""
       try {
        clickPointText = Thnote.ParentMusicPage.labels[0].label.text+", Bar:"+Thnote.vfnote[0].stave.MeasureNumber+", Position:"+Thnote.parentVoiceEntry.parentStaffEntry.relInMeasureTimestamp.realValue
        /*
        clickPointText = {
          bar: Thnote.vfnote[0].stave.MeasureNumber, 
          position: Thnote.parentVoiceEntry.parentStaffEntry.relInMeasureTimestamp.realValue,
          name: Thnote.ParentMusicPage.labels[0].label.text
          }
          */
      } catch {
        clickPointText = "Score orchestral chord"
      }
        //console.log(Thnote)
        this.osmd.cursor.hide();
        this.osmd.cursor.reset();
        while (this.osmd.cursor.iterator.currentTimeStamp.RealValue != absTimeStamp){
          this.osmd.cursor.next()
        }
        this.osmd.cursor.show();

        let noteArray = this.orchestrationChords.notes[absTimeStamp]
        let data = []
        let targets = []
        let tgtPresent = false
        noteArray.map((note,idx) => {
          if(this.orchestrationChords.databaseEntries.tgt[idx]){
            targets.push(idx)
          }
          if(note.length>0){
            let dynamic = []
            if(this.orchestrationChords.databaseEntries.dyn[idx]!=="from_score"){
              dynamic=this.orchestrationChords.databaseEntries.dyn[idx]
            }
            if(this.orchestrationChords.databaseEntries.tgt[idx]){
              tgtPresent = true
            }
            note.map(n => {
              // console.log(n.dynamic)
              // console.log(["ppppp", "pppp", "ppp", "pp", "p"].includes(n.dynamic))
              if(dynamic.length===0 && ["ppppp", "pppp", "ppp", "pp", "p"].includes(n.dynamic)){
                dynamic = "p"
              }else if(dynamic.length===0 && ["fffff", "ffff", "fff", "ff", "f", "sfz", "sf"].includes(n.dynamic)){
              dynamic = "f"
              }else if(dynamic.length===0 && ["mf", "mp", "mfz"].includes(n.dynamic)){
                dynamic = "mf"
                }
          data.push([this.orchestrationChords.databaseEntries.inst[idx], this.orchestrationChords.databaseEntries.tech[idx], dynamic, n.note+12+this.orchestrationChords.databaseEntries.modify[idx], this.orchestrationChords.databaseEntries.tgt[idx], this.orchestrationChords.databaseEntries.onoff[idx], idx, 0])
            })  
        }
        })
        //console.log(data)
        //data = data.filter((v,i,a)=> {return v[3]>=noteNumbers[v[0]][v[1]][v[2]][0] && v[3]<=noteNumbers[v[0]][v[1]][v[2]][1] })
        data = data.filter((v,i,a)=> {
          if (v[5]){
            try{
              return v[3]>=noteNumbers[v[0]][v[1]][v[2]][0] && v[3]<=noteNumbers[v[0]][v[1]][v[2]][1]
            }catch{
              return false
            }
          } else return false
        })
        //console.log(data)
        axios.post(baseURL+"modalSlice", data).then((response) => {
          // console.log(data)
          var result = response.data
          // console.log(result)
          // let Thnote = []
          // verticals.StaffEntries.map(entry => Thnote=entry.sourceStaffEntry.voiceEntries[0].notes[0])
          var measureNumber = Thnote.sourceNote.parentStaffEntry.verticalContainerParent.parentMeasure.measureNumber
          const xposition = this.orchestrationChords.xpos[String(absTimeStamp)]-1
          var GraphicalMusicPage = this.osmd.graphic.MusicPages[0]
          if(result){
            if(true){ //was: if(result[0]), but leads to skip if target is fully audible
              if(tgtPresent){
          targets.map(tgt=>{
            var StaffY = this.osmd.graphic.musicSheet.sourceMeasures[measureNumber-1].verticalMeasureList[tgt].boundingBox.absolutePosition.y+2
            const startPointF2D = new PointF2D(xposition, StaffY); //{x: xpos, y: ypos};
            const endPointF2D = new PointF2D(xposition+2, StaffY); //{x: xpos, y: ypos}
            let col = []
            if(result[0]>=75){
              col = "rgba(255,0,0,0.7)"
            } else if (result[0]>=55){
              col = "rgba(255,255,0,0.5)"
            }else{
              col = "rgba(0,255,0,0.3)"
            }
            // console.log(result[0])
            // this.osmd.Drawer.DrawOverlayLine(startPointF2D, endPointF2D, GraphicalMusicPage,
            //  col, 4)    
          })
        }
            }
            if(result[1]){
              result[1].map((ind, i) =>{
                var StaffY = this.osmd.graphic.musicSheet.sourceMeasures[measureNumber-1].verticalMeasureList[ind].boundingBox.absolutePosition.y+2
                const startPointF2D = new PointF2D(xposition, StaffY); //{x: xpos, y: ypos};
                const endPointF2D = new PointF2D(xposition+2, StaffY); //{x: xpos, y: ypos}
                let col = []
                if(i===0){
                  col = "rgba(255,153,51,0.5)"
                  // this.osmd.Drawer.DrawOverlayLine(startPointF2D, endPointF2D, GraphicalMusicPage,
                  //  col, 4)   
                }else if(i===1){
                  col = "rgba(255,51,255,0.5)"
                  // this.osmd.Drawer.DrawOverlayLine(startPointF2D, endPointF2D, GraphicalMusicPage,
                  //  col, 4)  
                }else if(i===2){
                  col = "rgba(51,153,355,0.5)"
                  // this.osmd.Drawer.DrawOverlayLine(startPointF2D, endPointF2D, GraphicalMusicPage,
                  //  col, 4)  
                } 
              })
            }

        }

          /*
          //Get absolute y position of first staff:
          var firstStaffY = this.osmd.graphic.musicSheet.sourceMeasures[measureNumber-1].verticalMeasureList[0].boundingBox.absolutePosition.y+2
          var secondStaffY = this.osmd.graphic.musicSheet.sourceMeasures[measureNumber-1].verticalMeasureList[1].boundingBox.absolutePosition.y+2
          
          //console.log(this.orchestrationChords.xpos)
          //Create starting point
          const startPointF2D_1 = new PointF2D(xposition, firstStaffY); //{x: xpos, y: ypos};
          const endPointF2D_1 = new PointF2D(xposition+2, firstStaffY); //{x: xpos, y: ypos}        
          const startPointF2D_2 = new PointF2D(xposition, secondStaffY); //{x: xpos, y: ypos};
          const endPointF2D_2 = new PointF2D(xposition+2, secondStaffY); //{x: xpos, y: ypos}
  
          //Draw thick red line to score:

          this.osmd.Drawer.DrawOverlayLine(startPointF2D_1, endPointF2D_1, GraphicalMusicPage,
            "#FF0000FF", 4)        
            this.osmd.Drawer.DrawOverlayLine(startPointF2D_2, endPointF2D_2, GraphicalMusicPage,
            "rgba(0,255,0,0.5)", 4)

          //console.log(response.data)
          //this.setState(state => state.instData = response.data);
          */
          this.setState(state => state.modalData = [result, data, clickPointText])
          }).finally(()=>{
            this.setState(state => {
              state.open = true
              state.time = Date.now()
            })
            this.forceUpdate()
          }) //axios end
      //}) // map loop end
      }





        // console.log(Thnote.vfnote[0].style)
        // console.log(Thnote.vfnote[0].hasOwnProperty('shadowBlur'))
        //this.osmd.graphic.GetNearestNote(clickPointF2D, maxDist).sourceNote.voiceEntry.stemColor = 'red'
        //this.osmd.render()
        // console.log(this.osmd.GraphicSheet (clickPointF2D));// (clickPointF2D));
        //console.log(this.osmd.GraphicSheet.GetVerticalContainerFromTimestamp(clickPointF2D.x).AbsoluteTimestamp);
        // console.log(this.osmd.GraphicSheet.GetNearestNote(clickPointF2D, maxDist));
        }} onMouseOver={event=>{
          if(this.state.showTooltip){
          let xpos = event.clientX // / units;
          let ypos = event.clientY // / units;
          var clickPointF2D = new PointF2D(xpos, ypos)
          clickPointF2D = this.osmd.graphic.domToSvg(clickPointF2D)
          clickPointF2D = this.osmd.graphic.svgToOsmd(clickPointF2D)
          const absTimeStamp = this.osmd.graphic.tryGetTimeStampFromPosition(clickPointF2D)
          if(typeof(absTimeStamp)!=="undefined"){
            this.osmd.cursor.hide();
            this.osmd.cursor.cursorOptions.color = "purple"
            this.osmd.cursor.reset();
            while (this.osmd.cursor.iterator.currentTimeStamp.RealValue != absTimeStamp.realValue){
              this.osmd.cursor.next()
            }
            this.osmd.cursor.show();

            let noteArray = this.orchestrationChords.notes[absTimeStamp.realValue]
            let prediction = this.orchestrationChords.predictions[absTimeStamp.realValue]
            //console.log(this.orchestrationChords)
            let data = []
            let targets = []
            let tgtPresent = false
            noteArray.map((note,idx) => {
              if(this.orchestrationChords.databaseEntries.tgt[idx]){
                targets.push(idx)
              }
              if(note.length>0){
                let dynamic = []
                if(this.orchestrationChords.databaseEntries.dyn[idx]!=="from_score"){
                  dynamic=this.orchestrationChords.databaseEntries.dyn[idx]
                }
                if(this.orchestrationChords.databaseEntries.tgt[idx]){
                  tgtPresent = true
                }
                note.map(n => {
                  // console.log(n.dynamic)
                  // console.log(["ppppp", "pppp", "ppp", "pp", "p"].includes(n.dynamic))
                  if(dynamic.length===0 && ["ppppp", "pppp", "ppp", "pp", "p"].includes(n.dynamic)){
                    dynamic = "p"
                  }else if(dynamic.length===0 && ["fffff", "ffff", "fff", "ff", "f", "sfz", "sf"].includes(n.dynamic)){
                  dynamic = "f"
                  }else if(dynamic.length===0 && ["mf", "mp", "mfz"].includes(n.dynamic)){
                    dynamic = "mf"
                    }
              data.push([this.orchestrationChords.databaseEntries.inst[idx], this.orchestrationChords.databaseEntries.tech[idx], dynamic, n.note+12+this.orchestrationChords.databaseEntries.modify[idx], this.orchestrationChords.databaseEntries.tgt[idx]])
                })  
            }
            })
            let showPrediction = ""
            if (prediction>=0){
              prediction = 100-prediction
              const maskerIdx = this.orchestrationChords.maskers[absTimeStamp.realValue]
              const maskers = <div> <Typography variant="caption" component="div" color="text.secondary"> 
              Possible masker: {this.orchestrationChords.instruments[maskerIdx[0]]}
                 </Typography>
                 </div>

              showPrediction =             <div>
              <Typography variant="caption" component="div" color="text.secondary">
                Target audibility prediction: 
              </Typography>
              <Box sx={{ position: 'relative', display: 'inline-flex' }}>
          <CircularProgress variant="determinate" value={prediction} color={(() => {
                          if(prediction<=30){
                            return "error"
                          }else if(prediction<=50){
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
              {`${Math.round(prediction)}%`}
            </Typography>
          </Box>
        </Box>
        {maskers}
        </div>
            }

            data.sort(function(a, b){return a[3]-b[3]})
            let notes=data.map(l=>mid2note(l[3]))
            let instruments=data.map(l=>l[0])
            let tgts = data.map((l,i)=>{if(l[4]){return i}})

            const TOOLTIP = <div style={{textAlign:"center", margin:"auto", verticalAlign:"bottom", backgroundColor:"#fffef0cc", width:200}}>
              <div style={{color:"black"}}>Orchestration under mouse pointer, target on green. Click to see detailed analysis.</div>
              {showPrediction}
              <Orchestration
                notes={notes}
                instruments={instruments}
                target={tgts}
                target_color="green"
                height={250}
                width={160}
                scale={0.7}/>
                </div>

          this.setState(state => state.tooltip = TOOLTIP)
            //console.log(data)

          }
        } else{
          this.setState(state => state.tooltip = "click any note for orchestration details")
          this.osmd.cursor.hide()
        }
          /*
          this.osmd.cursor.hide();
          this.osmd.cursor.reset();
          while (this.osmd.cursor.iterator.currentTimeStamp.RealValue != absTimeStamp){
            this.osmd.cursor.next()
          }
          this.osmd.cursor.show();
          */

        }}
        onMouseLeave={()=>{this.osmd.cursor.hide()}}
        />
        </Tooltip>
        </Item>
        <div> {this.state.statisticPlots} </div>
        <AnalysisDialog handleClose={this.handleClose} help={this.props.help} open={this.state.open} time={this.state.time} data={this.state.modalData}/>
        <Backdrop
        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={this.state.loading}
      >
        <CircularProgress disableShrink color="success"/>
        <Typography> Calculating... (for large scores, 30+ staves and 100+ measures, this can take several minutes)</Typography>
      </Backdrop>
      <div style={{display:"none"}}>
      {this.state.tooltip}
      </div>

      </>);
    }
  }

  export default Score;
