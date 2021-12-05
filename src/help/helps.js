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
            return "Choose here an example score. 'Test Score' is a small and short example you can use to try the features of the Score-Tool App."
        case "Dropzone":
            return "Drop an MusicXml file here, or click to choose one from your filesystem. You can find plenty of MusicXml orchestral scores for example from Musescore site."
        case "ScoreSlider":
            return "Choose here the bar range of the score. Only the selected range will be visible when you click 'Show score'. This can be useful if you have a very large score, because visual rendering takes time."
        case "ShowHide":
            return "Click here to alter the masking calculation parameters of the score. If they are visible, clicking here will hide them."
        case "Instruments":
            return "Here you assign the orchestration from your score to instruments on Score-Tool database. The Score-Tool App tries to guess the most suitable database instrument according to the name of your staff, but it may fail."
        case "Scorename":
            return "Here is the text on the staff of your score. Compare this to the instrument selection on right. Select the most suitable instrument from database, i.e. if you have a Baritone horn in socre, the closest instrument on database might be Tuba."
        case "Techs":
            return "Select playing technique. Unfortunately Score-Tool cannot read for example pizzicato indication from score. You must select it manually, and do the masking calculation separately for the pizzicato section."
        case "Dyns":
            return "Score-Tool reads the dynamics from the score, but if you want to try, for example, to set all the trumpets to play p, you can do it here."
        case "Target":
            return "This is an important parameter. Here you select the current staff as target, i.e. the staff who's audibility is tested."
        case "Onoff":
            return "Here you can swith the staff off, i.e. omit it from the masking calculation."
        case "Transpose":
            return "Here you can set the transposition for the whole staff. You can, for example, try to set the target to play an octave higher to see if that helps for the audibility issues."
        case "Showscore":
            return "Click here to render the score on screen. This can take several minutes for a big score. Only the bar range you set is rendered."
        case "CalcRange":
            return "Set range for masking calculation. This does not have to be the range of the whole score. You can calculate, for example, one bar here, two bars there etc. This affects also to rendered range, if you click 'Redraw' button."
        case "CalcButton":
            return "Clicking here starts the masking calculation. You can follow the progress on score, and even use other features of the App while the calculation advances. The calculation can be stopped and resumed at will."
        case "Redraw":
            return "Clicking here will redraw the score, which might be a lengthy process. Note that redraw will erase all the masking calculation color codes from the score."
        case "DownloadScore":
            return "Clicking here will initiate the download of your rendered score with masking indications. The downloaded score will be in PNG from, which can be opened with usual photo viewer programs."
        case "UnderMouse":
            return "This toggles the view of the orchestration under the mouse cursor in score. This is checked by default, because with this feature it is quick and easy to check which instruments are playing together at any point in the score."
        }
    return ""
}