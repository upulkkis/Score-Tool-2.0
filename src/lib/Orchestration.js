import Vex from 'vexflow';
import React, {Component} from 'react';
import PropTypes from 'prop-types';

const VF = Vex.Flow;

export default class Orchestration extends Component {

    constructor(props) {
        super(props);
        this.notes=0;
        this.target=0;
        this.instruments=0;
        this.renderer=0;
        this.context=0;
        this.scale=1
        this.state = {
            x: 0,
            y: 0,

        };
    };
    
    setupScore() {
                const svgContainer = document.createElement('div');
                const {id, notes, target, instruments, setProps, width, height, t_score_y, b_score_y, target_color, text_space, highlights, indexing, scale} = this.props;
                //const svgContainer = document.getElementById(id);
                this.notes = notes;
                this.target = target;
                this.instruments = instruments;
                this.scale = scale

                this.renderer = new VF.Renderer(svgContainer, VF.Renderer.Backends.SVG);
                this.renderer.resize(width+text_space, height);
                
                var context = this.renderer.getContext();
                this.context = context
                this.context.scale(this.scale, this.scale)
                //Do Treble and Bass Clefs
        
                var stave_t = new VF.Stave(20, t_score_y, width);
                stave_t.addClef("treble") //.addTimeSignature("4/4"); 
                stave_t.setContext(this.context).draw();
                //console.log(stave_t)
                //this.context.fillText('15ma', stave_t.x+6, stave_t.y+26)
                //var stave_t2 = new VF.Stave(20+width, t_score_y, 50);
                //stave_t2.setContext(this.context).draw();
        
                var stave_b = new VF.Stave(20, b_score_y, width);
                stave_b.addClef("bass") //.addTimeSignature("4/4");
                stave_b.setContext(this.context).draw();

        
                function separate(notes, instruments,target) {
                    var i;
                    var treble_n = [];
                    var treble_a = [];
                    var treble_t = [];
                    var treble_i = [];
                    var treble_h = [];
                    var bass_n = [];
                    var bass_a = [];
                    var bass_t = [];
                    var bass_i = [];
                    var bass_h = [];
                    var ultra_n = [];
                    var ultra_a = [];
                    var ultra_t = [];
                    var ultra_i = [];
                    var ultra_h = [];
                    var new_key;
                    var new_octave;
                    var new_accidential;
                    var entry;
                    var new_note;
                    var inst;
                    var tgt
                    for (i=0; i<notes.length; i++) {
                        entry = notes[i];
                        //Add index to the name for mouse click
                        if (indexing){
                            inst = i+': '+instruments[i]
                        } else {
                            inst = instruments[i]
                        }
                        var highlight = ''

                        if(typeof highlights[i] !== 'undefined'){
                            highlight = highlights[i]
                        }
                        new_key = entry[0];
                        new_octave = entry[entry.length-1];
                        if (entry.length>2){
                            new_accidential = entry[1]; 
                        } else {
                            new_accidential = "n";
                        }
                       new_note = new_key.concat("/",new_octave)
                       tgt = target[i];
                      if (parseInt(new_octave) >= 4 && parseInt(new_octave) < 6) {
                          treble_n.push(new_note);
                          treble_a.push(new_accidential)
                          treble_i.push(inst)
                          treble_h.push(highlight)
        
                          //Tällä katsotaan onko juuri tämä targetlistalla
                          //Alla oleva ottaa vain ekan huomioon, tarkista!!
                          var tgt = 0;
                          for (var j=0; j<target.length; j++) {
                            if (target[j]===i){
                                tgt=1;
                            }
                         }
                         treble_t.push(tgt);
                      } else if (parseInt(new_octave) >= 6){
                        new_octave-=2
                        new_note = new_key.concat("/",new_octave)
                        ultra_n.push(new_note);
                        ultra_a.push(new_accidential)
                        ultra_i.push(inst)
                        ultra_h.push(highlight)

                        var tgt = 0;
                        for (var j=0; j<target.length; j++) {
                          if (target[j]===i){
                              tgt=1;
                          }
                       }
                       ultra_t.push(tgt);

                      } else{
                          bass_n.push(new_note);
                          bass_a.push(new_accidential);
                          bass_i.push(inst);
                          bass_h.push(highlight)

                          var tgt = 0;
                          for (var j=0; j<target.length; j++) {
                            if (target[j]===i){
                                tgt=1;
                            }
                        }
                        bass_t.push(tgt);
                      }
                      
                    } 
        
                    return [treble_n, treble_a, treble_t, bass_n, bass_a, bass_t, treble_i, bass_i, treble_h, bass_h, ultra_n, ultra_a, ultra_t, ultra_i, ultra_h];
                }
                
                var note_data = separate(this.notes, this.instruments, this.target)
                

                //Check if score contains ultra high notes, and do an ultra high staff:

                if (Array.isArray(note_data[10]) && note_data[10].length){

                var stave_u = new VF.Stave(20, 40, width);
                stave_u.addClef("treble");
                stave_u.setContext(this.context).draw();
                this.context.fillText('15ma', stave_u.x+6, stave_u.y+26)

                var ultra_textnotes = []
                for (var i=0; i<note_data[10].length; i++){
                    ultra_textnotes.push('c/4')
                }
                var textnote_u = new VF.StaveNote({clef: "treble", keys: ultra_textnotes, duration: "q" }) // ignore_ticks: true
                textnote_u.setStemStyle({strokeStyle: 'none'})
                textnote_u.setLedgerLineStyle({strokeStyle: 'none'})
                for (var i=0; i<note_data[10].length; i++) {
                    textnote_u.setKeyLine(i, i-1.5)
                }

                var ultra_notes = new VF.StaveNote({clef: "treble", keys: note_data[10], duration: "q" })
                var ultra_inst = note_data[13]
                var ultra_highlights = note_data[14]

                for (var i=0; i<note_data[11].length; i++){
                    ultra_notes.addAccidental(i, new VF.Accidental(note_data[11][i]));
                    var tekstiu = viereen(ultra_inst[i], VF.Modifier.Position.RIGHT)
                    tekstiu.setOffsetX(-10)
                    //console.log(teksti) // 
                    //teksti.setAttribute('id', 'JEBU_teksti'+i)
                    //teksti.setOffsetY(0)
                    textnote_u.note_heads[i].glyph_code = 'v23'
                    textnote_u.addModifier(i, tekstiu)
                    //console.log(textnote)
                    //textnote.setAttribute('id', 'JEBU_teksti'+i)
                    if (ultra_highlights[i]){
                        ultra_notes.setKeyStyle(i, {shadowColor: ultra_highlights[i], shadowBlur:100})
                        //textnote.setKeyStyle(i, {shadowColor: treble_highlights[i], shadowBlur:100});
                    }
                    if (note_data[12][i]===1){
                        ultra_notes.setKeyStyle(i, {fillStyle: target_color});
                        textnote_u.setKeyStyle(i, {fillStyle: target_color});
                    } 
                }

                var connector = new VF.StaveConnector(stave_u, stave_b);
                var connector3 = new VF.StaveConnector(stave_u, stave_b);
                } else {
                var connector = new VF.StaveConnector(stave_t, stave_b);
                var connector3 = new VF.StaveConnector(stave_t, stave_b);
                }

                //Ultra high staff stuff ends

                //Do connectors
                
                connector.setType(VF.StaveConnector.type.SINGLE_LEFT);
                connector.setContext(this.context);
                connector.draw();
                // var connector2 = new VF.StaveConnector(stave_t, stave_b);
                // connector2.setType(VF.StaveConnector.type.SINGLE_RIGHT);
                // connector2.setContext(context);
                //connector2.draw();   
                connector3.setType(VF.StaveConnector.type.BRACKET);
                connector3.setContext(this.context);
                //connector3.setText('Orch.');
                connector3.draw();

                var treble_textnotes = []
                for (var i=0; i<note_data[0].length; i++){
                    treble_textnotes.push('c/4')
                }
                var textnote = new VF.StaveNote({clef: "treble", keys: treble_textnotes, duration: "q" }) // ignore_ticks: true
                textnote.setStemStyle({strokeStyle: 'none'})
                textnote.setLedgerLineStyle({strokeStyle: 'none'})
                //console.log(textnote)
                for (var i=0; i<note_data[0].length; i++) {
                    //var textnote = new VF.TextNote({text: 'jebu', duration: '32', ignore_ticks: true}) // ignore_ticks: true
                    textnote.setKeyLine(i, i-1.5)
                    
                    //textnote.setKeyStyle(i, {fillStyle: 'rgba(0,0,0,0)'})
                    //.setStave(stave_t)
                    //.setLine(i)
                    //.setJustification(VF.TextNote.Justification.LEFT)
                    //textnote.x_shift = 100
                    //textnote.tickContext.extraLeftPx = 100;
                    //console.log(textnote)
                    //treble_textnotes.push(textnote)
                }

                var bass_textnotes = []
                for (var i=0; i<note_data[3].length; i++){
                    bass_textnotes.push('c/3')
                }
                var textnote_b = new VF.StaveNote({clef: "bass", keys: bass_textnotes, duration: "q" }) // ignore_ticks: true
                textnote_b.setStemStyle({strokeStyle: 'none'})
                textnote_b.setLedgerLineStyle({strokeStyle: 'none'})
                
                //console.log(textnote_b)
                for (var i=0; i<note_data[3].length; i++) {
                    //var textnote = new VF.TextNote({text: 'jebu', duration: '32', ignore_ticks: true}) // ignore_ticks: true
                    textnote_b.setKeyLine(i, i-1.5)
                    
                    //textnote.setKeyStyle(i, {fillStyle: 'rgba(0,0,0,0)'})
                    //.setStave(stave_t)
                    //.setLine(i)
                    //.setJustification(VF.TextNote.Justification.LEFT)
                    //textnote.x_shift = 100
                    //textnote.tickContext.extraLeftPx = 100;
                    //console.log(textnote_b)
                    //treble_textnotes.push(textnote)
                }
                
                var treble_notes = new VF.StaveNote({clef: "treble", keys: note_data[0], duration: "q" })
                var bass_notes = new VF.StaveNote({clef: "bass", keys: note_data[3], duration: "q" })
                var treble_inst = note_data[6]
                var bass_inst = note_data[7]
                var treble_highlights = note_data[8]
                var bass_highlights = note_data[9]


                //Funktio jolla piirretään nuotin viereen
                function viereen(num, pos) { 
                    var inst_text = new VF.FretHandFinger(num).setPosition(pos);
                    //inst_text.setXShift(-50);
                    return inst_text; 
                }
                //console.log(treble_notes)
                for (var i=0; i<note_data[1].length; i++){
                    treble_notes.addAccidental(i, new VF.Accidental(note_data[1][i]));
                    var teksti = viereen(treble_inst[i], VF.Modifier.Position.RIGHT)
                    teksti.setOffsetX(-10)
                    //console.log(teksti) // 
                    //teksti.setAttribute('id', 'JEBU_teksti'+i)
                    //teksti.setOffsetY(0)
                    textnote.note_heads[i].glyph_code = 'v23'
                    textnote.addModifier(i, teksti)
                    //console.log(textnote)
                    //textnote.setAttribute('id', 'JEBU_teksti'+i)
                    if (treble_highlights[i]){
                        treble_notes.setKeyStyle(i, {shadowColor: treble_highlights[i], shadowBlur:100})
                        //textnote.setKeyStyle(i, {shadowColor: treble_highlights[i], shadowBlur:100});
                    }
                    if (note_data[2][i]===1){
                        treble_notes.setKeyStyle(i, {fillStyle: target_color});
                        textnote.setKeyStyle(i, {fillStyle: target_color});
                    } 
                }
                for (var i=0; i<note_data[3].length; i++){
                    bass_notes.addAccidental(i, new VF.Accidental(note_data[4][i]));

                    var bteksti = viereen(bass_inst[i], VF.Modifier.Position.RIGHT)
                    bteksti.setOffsetX(-10)
                    textnote_b.note_heads[i].glyph_code = 'v23'
                    textnote_b.addModifier(i, bteksti)
                    if (bass_highlights[i]){
                        bass_notes.setKeyStyle(i, {shadowColor: bass_highlights[i], shadowBlur:100})
                        //textnote_b.setKeyStyle(i, {shadowColor: bass_highlights[i], shadowBlur:100});
                    }
                    if (note_data[5][i]===1){
                        bass_notes.setKeyStyle(i, {fillStyle: target_color});
                        textnote_b.setKeyStyle(i, {fillStyle: target_color});
                    }
                }
                
                  // Create a voice in 4/4 and add the notes from above
                if (Array.isArray(note_data[0]) && note_data[0].length){
                    var voice_t = new VF.Voice({num_beats: 1,  beat_value: 4}).setMode(2);
                    var voice_t_text = new VF.Voice({num_beats: 1,  beat_value: 4}).setMode(2);
                    voice_t.addTickables([treble_notes]);
                    voice_t_text.addTickables([textnote]);
                    //console.log(voice_t_text)
                    //voice_t_text.tickables[0].tickContext.xOffset = 50
                    var formatter = new VF.Formatter().joinVoices([voice_t]).format([voice_t], width);
                    var formatter_t = new VF.Formatter().joinVoices([voice_t_text]).format([voice_t_text], width);
                    formatter_t.tickContexts.array[0].x = width-40
                    //console.log(formatter_t)
                    voice_t.draw(this.context, stave_t);
                    voice_t_text.draw(this.context, stave_t);
                }
                    var voice_b = new VF.Voice({num_beats: 1,  beat_value: 4});
                    var voice_b_text = new VF.Voice({num_beats: 1,  beat_value: 4});
                    voice_b_text.addTickables([textnote_b]);

                if (Array.isArray(note_data[3]) && note_data[3].length){
                    voice_b.addTickables([bass_notes]);
                    var formatter = new VF.Formatter().joinVoices([voice_b]).format([voice_b], width);
                    var formatter_b = new VF.Formatter().joinVoices([voice_b_text]).format([voice_b_text], width);
                    formatter_b.tickContexts.array[0].x = width-40
                    voice_b.draw(this.context, stave_b);
                    voice_b_text.draw(this.context, stave_b);
                }

                if (Array.isArray(note_data[10]) && note_data[10].length){
                    var voice_u = new VF.Voice({num_beats: 1,  beat_value: 4}).setMode(2);
                    var voice_u_text = new VF.Voice({num_beats: 1,  beat_value: 4}).setMode(2);
                    voice_u.addTickables([ultra_notes]);
                    voice_u_text.addTickables([textnote_u]);
                    //console.log(voice_t_text)
                    //voice_t_text.tickables[0].tickContext.xOffset = 50
                    var formatter = new VF.Formatter().joinVoices([voice_u]).format([voice_u], width);
                    var formatter_u = new VF.Formatter().joinVoices([voice_u_text]).format([voice_u_text], width);
                    formatter_u.tickContexts.array[0].x = width-40
                    //console.log(formatter_t)
                    voice_u.draw(this.context, stave_u);
                    voice_u_text.draw(this.context, stave_u);

                    var stave_linesu = []
                    for(var i=0; i<ultra_textnotes.length; i++){
                            var stavelineu = new VF.StaveLine({first_note: ultra_notes, last_note: textnote_u, first_indices: [i], last_indices:[i]})
                            stavelineu.render_options.line_width = 3
                            stavelineu.render_options.padding_right = -4
                            if (ultra_highlights[i]){
                                stavelineu.render_options.color = ultra_highlights[i]
                            }
                            if (note_data[12][i]===1){
                            stavelineu.render_options.color = target_color
                            }
                
                            stave_linesu.push(stavelineu)
                        
                    }

                    for (var k=0; k<stave_linesu.length; k++){
                        stave_linesu[k].setContext(context)
                        stave_linesu[k].draw()
                    }

                }

                var stave_lines = []
                for(var i=0; i<treble_textnotes.length; i++){
                            //    last_note: Note,
                            //    first_indices: [n1, n2, n3],
                            //    last_indices: [n1, n2, n3]
                            //  }
                        var staveline = new VF.StaveLine({first_note: treble_notes, last_note: textnote, first_indices: [i], last_indices:[i]})
                        staveline.render_options.line_width = 3
                        staveline.render_options.padding_right = -4
                        if (treble_highlights[i]){
                            staveline.render_options.color = treble_highlights[i]
                        }
                        if (note_data[2][i]===1){
                        staveline.render_options.color = target_color
                        }
                        //staveline.render_options.padding_left = -4
                        //staveline.render_options.padding_right = -4
                        //addNote.addModifier(0, new VF.Modifier(staveline))
            
                        stave_lines.push(staveline)
                    
                }

                var stave_linesb = []
                for(var i=0; i<bass_textnotes.length; i++){
                            //    last_note: Note,
                            //    first_indices: [n1, n2, n3],
                            //    last_indices: [n1, n2, n3]
                            //  }
                        var stavelineb = new VF.StaveLine({first_note: bass_notes, last_note: textnote_b, first_indices: [i], last_indices:[i]})
                        stavelineb.render_options.line_width = 3
                        stavelineb.render_options.padding_right = -4
                        if (bass_highlights[i]){
                            stavelineb.render_options.color = bass_highlights[i]
                        }
                        if (note_data[5][i]===1){
                            stavelineb.render_options.color = target_color
                        }
                        //staveline.render_options.padding_left = -4
                        //staveline.render_options.padding_right = -4
                        //addNote.addModifier(0, new VF.Modifier(staveline))
            
                        stave_linesb.push(stavelineb)
                    
                }
                for (var k=0; k<stave_lines.length; k++){
                    stave_lines[k].setContext(context)
                    stave_lines[k].draw()
                }
                for (var k=0; k<stave_linesb.length; k++){
                    stave_linesb[k].setContext(context)
                    stave_linesb[k].draw()
                }

                this.refs.outer.appendChild(svgContainer);
                this.refs.outer.addEventListener("click", this.orchClick.bind(this), false)
            }

    orchClick(event) {
        const {setProps, indexing} = this.props

        //if (!event.target.closest('.vf-stavenote')) {return;} 
        //if (!event.target.parentElement.closest('.vf-stavenote')) {return;} 
        if (!event.target.closest('text')) {return;} 
        //console.log(event)
        if(indexing){
            var value = event.target.innerHTML
            var res = value.split(':')
            var idx = parseInt(res[0])
            if (setProps) setProps({onClick: idx})
            console.log(idx)
        }
    }

    componentDidMount() {
        this.setupScore();
    }

    componentDidUpdate(prevProps) {
        //if (this.notes !== prevProps.notes || this.instruments !== prevProps.instruments || this.target !== prevProps.target){
        //const {id} = this.props;
        var element = this.refs.outer
        while (element.hasChildNodes()) {
            element.removeChild(element.lastChild);
        }
        this.setupScore()
        //}
        }
    
    /*
    componentWillReceiveProps(nextProps) {   
        if (this.notes !== nextProps.notes || this.instruments !== nextProps.instruments || this.target !== nextProps.target){
            this.notes = nextProps.notes
            this.instruments = nextProps.instruments
            this.target = nextProps.target

        } 
    }


shouldComponentUpdate(nextProps){
        return (this.props.notes !== nextProps.notes || this.props.instruments !== nextProps.instruments || this.props.target !== nextProps.target);
}
  */

    render() {
        const{id, notes, instruments, target}=this.props;
        return <div id={id} ref="outer" style={{
            border: "none",
            padding: 0,
            borderRadius: 0,
            display: "inline-block",
        }}         
        >
        </div>;
    }

}

Orchestration.defaultProps = {width: 200, height: 400, t_score_y: 110, b_score_y: 200, text_space: 120, target_color: 'red', highlights: [], indexing: true};

Orchestration.propTypes = {
    /**
     * The ID used to identify this component in Dash callbacks.
     */
    id: PropTypes.string,

    /**
     * A label that will be printed when this component is rendered.
     */
    notes: PropTypes.array,
    target: PropTypes.array,
    instruments: PropTypes.array,
    highlights: PropTypes.array,
    width: PropTypes.number,
    height: PropTypes.number,
    t_score_y: PropTypes.number,
    b_score_y: PropTypes.number,
    target_color: PropTypes.string,
    text_space: PropTypes.number,
    indexing: PropTypes.bool,
    onClick: PropTypes.number,
    scale: PropTypes.number,

    /**
     * Dash-assigned callback that should be called to report property changes
     * to Dash, to make them available for callbacks.
     */
    setProps: PropTypes.func
};
