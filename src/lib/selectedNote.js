import React, { useEffect } from 'react'
import { Stave } from 'vexflow/src/stave'
import Vex from 'vexflow'

const VF = Vex.Flow;
const SelectedNote = ({note}) => {
  // if(note.length===0){
  //   return <div/>
  // }
  const drawCanvas = (ref) => {
    if (ref) {

  const svgContainer = ref;
  while (svgContainer.hasChildNodes()) {
    svgContainer.removeChild(svgContainer.lastChild);
  }
  //const svgContainer = <div/>
    const renderer = new VF.Renderer(svgContainer, VF.Renderer.Backends.SVG);
    renderer.resize(100, 100)
    var context = renderer.getContext();
    context.scale(0.5,0.5)
    const stave = new Stave(20, 40, 150);
    stave.setContext(context);
    
    //Count low and high octave notes
    const low = note.filter(function(value, index, arr){  return parseInt(value.slice(-1))<4 })
    const high = note.filter(function(value, index, arr){  return parseInt(value.slice(-1))>=4 })

    let clef = 'treble'
    if (low.length>high.length){
           clef='bass'
    } 

    stave.setClef(clef);
    let keys = []
    let accs = []
    note.map(n=>{
      var key = n.slice(0,1) + "/" + n.slice(-1)
      var acc = n.slice(-2,-1)
      if (!/[#db+n]/.test(acc)) {
          acc = 'n'
      }
      keys.push(key)
      accs.push(acc)
    })

    if(note.length===0){
      stave.draw();
    } else {
    const notes = new VF.StaveNote({clef: clef, keys: keys, duration: "4" })
    accs.map((a,i)=>notes.addAccidental(i, new VF.Accidental(a)))
    

    const voice = new VF.Voice({num_beats: 1,  beat_value: 4});
    voice.addTickables([notes]);
    stave.draw();
   
    const formatter = new VF.Formatter().joinVoices([voice]).formatToStave([voice], stave);

    // Render voice
    voice.draw(context, stave);
    }
    //stave.setTimeSignature('4/4');
    //context.render()
     // refs.selNot.appendChild(svgContainer);
     //parentRef.current appendChild(svgContainer);
  }}
      return (
        //<View style={styles.staffi}>
        <div ref={drawCanvas}>
        </div>
      )
  }
export default SelectedNote