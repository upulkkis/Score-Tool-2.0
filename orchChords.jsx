import React, { Component } from 'react';
import { ColoringModes, OpenSheetMusicDisplay as OSMD, PointF2D } from 'opensheetmusicdisplay';
// import '../opensheetmusicdisplay.min.js';

class OpenSheetMusicDisplay extends Component {
    constructor(props) {
      super(props);
      this.state = { dataReady: false, cur: false };
      this.osmd = undefined;
      this.orchestrationChords = undefined;
      this.cursor = undefined;
      this.next = undefined;
      this.show = true;
      this.divRef = React.createRef();
    }

    setupOsmd() {
      const options = {
        autoResize: this.props.autoResize !== undefined ? this.props.autoResize : false,
        drawTitle: this.props.drawTitle !== undefined ? this.props.drawTitle : true,
      }
      this.osmd = new OSMD(this.divRef.current, options);
      
      this.osmd.load(this.props.file).then(() => {
        this.osmd.zoom = 0.5;

        /*
        this.osmd.setOptions({
          //renderSingleHorizontalStaffline: true,
        drawFromMeasureNumber:5,
      drawUpToMeasureNumber: 8})
      */
        console.log(this.osmd)
        console.log(this.osmd.GraphicSheet.musicSheet.staves[0].voices[0].voiceEntries[0])
        this.osmd.GraphicSheet.musicSheet.staves[0].voices[0].voiceEntries[0].stemColor = 'red'
        //this.osmd.GraphicSheet.musicSheet.staves[0].voices[0].voiceEntries[0].notes[0].noteheadColor = 'red'
        this.osmd.render()
        let instNames = []
        let partDyns = []
        this.osmd.graphic.musicSheet.Parts.map(p =>{
          instNames.push(p.Name)
          partDyns.push({"0":"mf"}) // Set initial dynamics as mf for every instrument
        })
        console.log(instNames)
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
        let sustainingNotes = []
        sustainingNotes.length = instNames.length
        let sustainingDynamics = []
        for(let i=0;i<instNames.length;i++){
          sustainingDynamics.push("mf")
        }
        this.osmd.graphic.VerticalGraphicalStaffEntryContainers.map(verticals => {
          let notesAtPoint = []
          notesAtPoint.length = verticals.StaffEntries.length
          for(let i=0;i<verticals.StaffEntries.length;i++){
            notesAtPoint[i]=[]
            if(verticals.StaffEntries[i]){
              verticals.StaffEntries[i].parentMeasure.parentStaffLine.abstractExpressions.map(exp => {
                partDyns[i][String(exp.SourceExpression.multiExpression.AbsoluteTimestamp.realValue)] = exp.Expression
              })

              if (verticals.StaffEntries[i].sourceStaffEntry.voiceEntries){
                verticals.StaffEntries[i].sourceStaffEntry.voiceEntries[0].notes.map(note => {
                  if (note.halfTone>0){
                    if(partDyns[i].hasOwnProperty(String(verticals.AbsoluteTimestamp.realValue))){
                      sustainingDynamics[i] = partDyns[i][String(verticals.AbsoluteTimestamp.realValue)]
                    }
                    notesAtPoint[i].push({note: note.halfTone, dynamic: sustainingDynamics[i]})
                    sustainingNotes[i] = {note: note.halfTone, start: verticals.AbsoluteTimestamp.realValue, duration: note.length.realValue}
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
        partNotes[verticals.AbsoluteTimestamp.realValue] = notesAtPoint
        })
        console.log(partDyns)
        console.log(partNotes)
        this.orchestrationChords = {instruments: instNames, dynamics: partDyns, notes: partNotes}
      });
      
    }
  
    resize() {
      this.forceUpdate();
    }
  
    componentWillUnmount() {
      window.removeEventListener('resize', this.resize)
    }
  
    
    componentDidUpdate(prevProps) {
      if (this.props.drawTitle !== prevProps.drawTitle) {
        this.setupOsmd();

      } else if(this.props.file !== prevProps.file){
        this.osmd.load(this.props.file).then(() => this.osmd.render());
      }
      var shw = false
      if (typeof(this.osmd.cursor.hidden)==='undefined' || this.osmd.cursor.hidden){
        console.log(this.osmd.cursor.hidden)
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
      window.addEventListener('resize', this.resize)

    }
  
    // Called after render
    componentDidMount() {
      this.setupOsmd();
      
    }
  
    render() {
      /*
      static domToSvg(svg, point){
        var pt = svg.createSVGPoint();
        pt.x = point.x
        pt.y = point.y
        var sp = pt.matrixTransform(svg.getScreenCTM().inverse());
        return{x: sp.x, y: sp.y}
      }
      */

      return (<>
      <div ref={this.divRef} onClick={event=>{
        /*
        console.log(event.target.closest('.vf-stavenote'))
        console.log(event.target.parentElement.closest('.vf-stavenote'))
        
        let units = this.osmd.unitInPixels;
        */
        let xpos = event.pageX // / units;
        let ypos = event.pageY // / units;
        
        var clickPointF2D = new PointF2D(xpos, ypos); //{x: xpos, y: ypos};
        console.log(clickPointF2D)
        let maxDist = {x: 15, y: 15};
        clickPointF2D = this.osmd.graphic.domToSvg(clickPointF2D)
        clickPointF2D = this.osmd.graphic.svgToOsmd(clickPointF2D)
        // console.log(clickPointF2D)
        const Thnote = this.osmd.graphic.GetNearestNote(clickPointF2D, maxDist)
        const absTimeStamp = Thnote.sourceNote.voiceEntry.parentSourceStaffEntry.AbsoluteTimestamp.realValue
        console.log(absTimeStamp)
        console.log(this.orchestrationChords.notes[String(absTimeStamp)])
        console.log(Thnote)
        console.log(Thnote.sourceNote.voiceEntry.timestamp.RealValue)
        if (Thnote.vfnote[0].hasOwnProperty('style')){
          delete(Thnote.vfnote[0].style) 
        } else {
          Thnote.vfnote[0].setStyle({shadowBlur: 70, shadowColor: 'red'})
        }
        
        this.osmd.cursor.hide();
        this.osmd.cursor.reset();
        while (this.osmd.cursor.iterator.currentTimeStamp.RealValue != absTimeStamp){
          this.osmd.cursor.next()
        }
        this.osmd.cursor.show();


        console.log(Thnote.vfnote[0].style)
        console.log(Thnote.vfnote[0].hasOwnProperty('shadowBlur'))
        //this.osmd.graphic.GetNearestNote(clickPointF2D, maxDist).sourceNote.voiceEntry.stemColor = 'red'
        //this.osmd.render()
        // console.log(this.osmd.GraphicSheet (clickPointF2D));// (clickPointF2D));
        //console.log(this.osmd.GraphicSheet.GetVerticalContainerFromTimestamp(clickPointF2D.x).AbsoluteTimestamp);
        // console.log(this.osmd.GraphicSheet.GetNearestNote(clickPointF2D, maxDist));
        }}/>
      </>);
    }
  }

  export default OpenSheetMusicDisplay;
