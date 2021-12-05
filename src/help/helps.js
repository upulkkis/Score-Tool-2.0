import * as React from 'react';
import { Tooltip } from '@mui/material';

export default function Helps({help}) {
    switch (help) {
        case "Scoretool":
            return "An orchestration psychoacoustic analysis web app for composers, conductors and musicians."
        case "Score":
            return "This the primary component of the Score-Tool App, where you can upload your own score."
        case "Chord":
            return "Here you can create, modify, load and save orchestral chords and see the psychoacoustic analysis results as graphs."
        case "Compare":
            return "Here you can compare two timbres and see the overtone structure of them in musical staff."
        case "Search":
            return "If you have saved orchestral chords, here you can search matching timbres from database using various algorithms."
        case "Manage":
            return "Here you can delete, download, and upload your own orchestral chords."
        case "Examples":
            return "Choose here and example score. 'Test Score' is a small and short example you can use to try the features of the Score-Tool App."
        case "Dropzone":
            return "Drop an MusicXml file here, or click to choose one from your filesystem. You can find plenty of MusicXml orchestral scores for example from Musescore site."
        case "ScoreSlider":
            return "Choose here the bar range of the score. Only the selected range will be visible when you click 'Show score'. This can be useful if you have a very large score, because visual rendering takes time."
        case "ShowHide":
            return "Click here to alter the masking calculation parameters of the score. If they are visible, clicking here will hide them."
        }
    return ""
}