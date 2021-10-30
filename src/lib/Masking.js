import Vex from 'vexflow';
import React, {Component} from 'react';
import PropTypes from 'prop-types';

const VF = Vex.Flow;

export default class Masking extends Component {

    constructor(props) {
        super(props);
        this.state = {
            x: 0,
            y: 0,

        };
    };
    
    setupScore() {
                const svgContainer = document.createElement('div');
                const {id, masking_notevalues, masking_notesizes, masking_colors, target_notevalues, target_notesizes, target_colors, setProps} = this.props;
                //const svgContainer = document.getElementById(id);
// console.log(this.props)
                var renderer = new VF.Renderer(svgContainer, VF.Renderer.Backends.SVG);
                renderer.resize(100, 250);
                var context = renderer.getContext();

                //Do Treble and Bass Clefs
        
                var stave_t = new VF.Stave(10, 60, 100);
                stave_t.addClef("treble") //.addTimeSignature("4/4");
                stave_t.setContext(context).draw();
        
                var stave_b = new VF.Stave(10, 120, 100);
                stave_b.addClef("bass") //.addTimeSignature("4/4");
                stave_b.setContext(context).draw();
                
                //Do connectors
                var connector = new VF.StaveConnector(stave_t, stave_b);
                connector.setType(VF.StaveConnector.type.SINGLE_LEFT);
                connector.setContext(context);
                connector.draw();
                // var connector2 = new VF.StaveConnector(stave_t, stave_b);
                // connector2.setType(VF.StaveConnector.type.SINGLE_RIGHT);
                // connector2.setContext(context);
                //connector2.draw();
                var connector3 = new VF.StaveConnector(stave_t, stave_b);
                connector3.setType(VF.StaveConnector.type.BRACKET);
                connector3.setContext(context);
                //connector3.setText('Orch.');
                connector3.draw();
        
                //Erotetaan nuotit viivastoille
                var treble_maskings = []
                var treble_maskings_notesize = []
                var treble_maskings_colors = []
                var bass_maskings = []
                var bass_maskings_notesize = []
                var bass_maskings_colors = []

                for (var i=0;i<masking_notevalues.length;i++){
                    if (masking_notevalues[i]>59){
                        treble_maskings.push(masking_notevalues[i])
                        treble_maskings_notesize.push(masking_notesizes[i])
                        treble_maskings_colors.push(masking_colors[i])
                    } else {
                        bass_maskings.push(masking_notevalues[i])
                        bass_maskings_notesize.push(masking_notesizes[i])
                        bass_maskings_colors.push(masking_colors[i])
                    }
                }

                var treble_targets = []
                var treble_targets_notesize = []
                var treble_targets_colors = []
                var bass_targets = []
                var bass_targets_notesize = []
                var bass_targets_colors = []

                for (var i=0;i<target_notevalues.length;i++){
                    if (target_notevalues[i]>59){
                        treble_targets.push(target_notevalues[i])
                        treble_targets_notesize.push(target_notesizes[i])
                        treble_targets_colors.push(target_colors[i])
                    } else {
                        bass_targets.push(target_notevalues[i])
                        bass_targets_notesize.push(target_notesizes[i])
                        bass_targets_colors.push(target_colors[i])
                    }
                }
                
                //Funktio jolla piirretään nuotin viereen
                function viereen(num, pos) { return new VF.FretHandFinger(num).setPosition(pos); }
            var maskings_t = new Array();
            var maskings_b = new Array();
            var targets_t = new Array();
            var targets_b = new Array();
        
            function midinote2treblestaff(midinote, offset){
                //Offset for treble middle-c4=60, bass-e2=40
                //set middle = 0, 4 steps= one line
                var line_offset=0;
                if (offset === 40){
                    line_offset=-1;
                }
                midinote=(midinote-offset)/4;

                if (midinote>1+line_offset){
                    midinote=midinote+0.25
                }
                if (midinote>3+line_offset){
                    midinote=midinote+0.25
                }
                if (midinote>4.5+line_offset){
                    midinote=midinote+0.25
                }
                if (midinote>6.5+line_offset){
                    midinote=midinote+0.25
                }
                if (midinote>8+line_offset){
                    midinote=midinote+0.25
                }
                if (midinote>10+line_offset){
                    midinote=midinote+0.25
                }
                if (midinote>13.5+line_offset){
                    midinote=midinote+0.25
                }
                if (midinote>15.5+line_offset){
                    midinote=midinote+0.25
                }
                return midinote
            }

            // Init masking notes y-coordinate array
            var masking_y_coords = []

            //If there's orchestration stuff for bass clef:

            if (Array.isArray(bass_maskings) && bass_maskings.length){
            
                for (var i=0; i<bass_maskings.length; i++){
                    //Draw custom noteheads
                    //line 0=middle c on treble, 1=e etc., font scale 40=about normal note, fillstyle = note color 
                    var linenote = midinote2treblestaff(bass_maskings[i], 40)
                    var notehead = new VF.NoteHead({duration:'128', line: linenote, custom_glyph_code:"vd2", glyph_font_scale: bass_maskings_notesize[i], style:{fillStyle: 'none'}}) //bass_maskings_colors[i]
                    notehead.setCenterAlignment(true)
                    //console.log(notehead)
                    maskings_b.push(notehead)
                }
                
            
            var voice2 = new VF.Voice({num_beats: 1,  beat_value: 1}).setMode(2);
            voice2.addTickables(maskings_b);
            // console.log(voice2)
            var formatter2 = new VF.Formatter().joinVoices([voice2]).format([voice2], 1);
            voice2.draw(context, stave_b);
            }

            //Check if there's orchestration stuff for treble staff and append:


            if (Array.isArray(treble_maskings) && treble_maskings.length){

                for (var i=0; i<treble_maskings.length; i++){
                    //Draw custom noteheads
                    //line 0=middle c on treble, 1=e etc., font scale 40=about normal note, fillstyle = note color 
                    var linenote = midinote2treblestaff(treble_maskings[i], 60)
                    var notehead = new VF.NoteHead({duration:'128', line: linenote, custom_glyph_code:"vd2", glyph_font_scale: treble_maskings_notesize[i], style:{fillStyle: 'none'}}) //treble_maskings_colors[i] 
                    notehead.setCenterAlignment(true)
                    //console.log(notehead)
                    maskings_t.push(notehead)
                }

            //maskings_t=[]
            //maskings_t.push(new VF.NoteHead({duration:'128', line: 2.3, custom_glyph_code:"vd2", glyph_font_scale: 100, style:{fillStyle: 'red'}}) )
            //maskings_t.push(new VF.NoteHead({duration:'128', line: 5.3, custom_glyph_code:"vd2", glyph_font_scale: 100, style:{fillStyle: 'red'}}) )
            var voice = new VF.Voice({num_beats: 1,  beat_value: 1}).setMode(2);
            voice.addTickables(maskings_t);
            var formatter = new VF.Formatter().joinVoices([voice]).format([voice], 1);
            voice.draw(context, stave_t);
            }


            //Check if there's target stuff for treble staff and append:

            if (Array.isArray(treble_targets) && treble_targets.length){
                targets_t.push(new VF.GhostNote('q'))
                for (var i=0; i<treble_targets.length; i++){
                    //Draw custom noteheads
                    //line 0=middle c on treble, 1=e etc., font scale 40=about normal note, fillstyle = note color 
                    var linenote = midinote2treblestaff(treble_targets[i], 60)
                    var notehead = new VF.NoteHead({duration:'128', displaced:false, line: linenote, custom_glyph_code:"vb", glyph_font_scale: treble_targets_notesize[i], style:{fillStyle: treble_targets_colors[i]}}) 
                    notehead.setCenterAlignment(true) //.set
                    targets_t.push(notehead)
                }
                
            //maskings_t=[]
            //maskings_t.push(new VF.NoteHead({duration:'128', line: 2.3, custom_glyph_code:"vd2", glyph_font_scale: 100, style:{fillStyle: 'red'}}) )
            //maskings_t.push(new VF.NoteHead({duration:'128', line: 5.3, custom_glyph_code:"vd2", glyph_font_scale: 100, style:{fillStyle: 'red'}}) )
            var voice3 = new VF.Voice({num_beats: 1,  beat_value: 1}).setMode(2);
            voice3.addTickables(targets_t);
            var formatter = new VF.Formatter().joinVoices([voice3]).format([voice3], 10);

            voice3.draw(context, stave_t);
            }

             //Check if there's target stuff for vass staff and append:

             if (Array.isArray(bass_targets) && bass_targets.length){
                targets_b.push(new VF.GhostNote('q'))
                for (var i=0; i<bass_targets.length; i++){
                    //Draw custom noteheads
                    //line 0=middle c on treble, 1=e etc., font scale 40=about normal note, fillstyle = note color 
                    var linenote = midinote2treblestaff(bass_targets[i], 60)
                    var notehead = new VF.NoteHead({duration:'128', displaced:false, line: linenote, custom_glyph_code:"vb", glyph_font_scale: bass_targets_notesize[i], style:{fillStyle: bass_targets_colors[i]}}) 
                    notehead.setCenterAlignment(true) //.set
                    targets_b.push(notehead)
                }
                
            //maskings_t=[]
            //maskings_t.push(new VF.NoteHead({duration:'128', line: 2.3, custom_glyph_code:"vd2", glyph_font_scale: 100, style:{fillStyle: 'red'}}) )
            //maskings_t.push(new VF.NoteHead({duration:'128', line: 5.3, custom_glyph_code:"vd2", glyph_font_scale: 100, style:{fillStyle: 'red'}}) )
            var voice4 = new VF.Voice({num_beats: 1,  beat_value: 1}).setMode(2);
            voice4.addTickables(targets_b);
            var formatter = new VF.Formatter().joinVoices([voice4]).format([voice4], 10);

            voice4.draw(context, stave_t);
            }

            if (Array.isArray(bass_maskings) && bass_maskings.length){
            
                for (var i=0; i<bass_maskings.length; i++){
                    //Get y coordinate of the note nad push to array
                    masking_y_coords.push(voice2.tickables[i].y)
                }}
            
            if (Array.isArray(treble_maskings) && treble_maskings.length){

                for (var i=0; i<treble_maskings.length; i++){
                    //Get y coordinate of the note nad push to array
                    masking_y_coords.push(voice.tickables[i].y)
                }}
        
            // console.log(masking_y_coords)

            for(var j=0;j<masking_y_coords.length-1;j++) {
                // console.log(masking_y_coords[j])
                context.beginPath() // start recording our pen's moves
                .moveTo(40, masking_y_coords[j]) // pickup the pen and set it down at X=0, Y=0. NOTE: Y=0 is the top of the screen.
                .lineTo(90, masking_y_coords[j]) // now add a line to the right from (0, 0) to (50, 0) to our path
                .lineTo(90, masking_y_coords[j+1]) // add a line to the left and down from (50, 0) to (25, 50)
                .lineTo(40, masking_y_coords[j+1])
                .closePath() // now add a line back to wherever the path started, in this case (0, 0), closing the triangle.
                .fill({ fill: masking_colors[j]}); // now fill our box in masking_colors[j]
            }

            // console.log(context)
            context.beginPath()
            .closePath()

                this.refs.outer2.appendChild(svgContainer);
    }

    componentDidMount() {
        this.setupScore();
    }

    componentDidUpdate(prevProps) {
        //if (this.notes !== prevProps.notes || this.instruments !== prevProps.instruments || this.target !== prevProps.target){
        //const {id} = this.props;
        var element = this.refs.outer2
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
        const{id}=this.props;
        return <div id={id} ref="outer2" style={{
            border: "none",
            padding: 0,
            borderRadius: 0,
            display: "inline-block",
        }}         
        >
        </div>;
    }

}

Masking.defaultProps = {};

Masking.propTypes = {
    /**
     * The ID used to identify this component in Dash callbacks.
     */
    id: PropTypes.string,

    /**
     * A label that will be printed when this component is rendered.
     */
    masking_notevalues: PropTypes.array,
    masking_notesizes: PropTypes.array,
    masking_colors: PropTypes.array,
    target_notevalues: PropTypes.array,
    target_notesizes: PropTypes.array,
    target_colors: PropTypes.array,


    /**
     * Dash-assigned callback that should be called to report property changes
     * to Dash, to make them available for callbacks.
     */
    setProps: PropTypes.func
};
