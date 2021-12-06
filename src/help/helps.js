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
        case "Colors":
            return "In the masking calculation the score will be color-coded according to these indications. Once the calculation begin, the target staff will be highlighted, and colored reddish if target audibility is poor, yellowish if audibility is moderate, and green if audibility is good. The surrounding orchestral instruments are colored according to their masking properties. Magenta is the heaviest, brownish yellow the 2nd heaviest and light blue the 3rd heaviest masker."
        case "AnScorenames":
            return "This is the name if the staff in your score where this entry of current orchestral chord reside."
        case "AnTech":
            return "Here you can modify the playing technique of the current entry. Click the text to browse through different techniques."
        case "AnDyn":
            return "Click the dynamic to browse through three dynamic levels, p, mf, and f. Play with these first to find possible solution to the audibility issues."
        case "AnMicro":
            return "Here you can tune your orchestral chord entry. Tuning range is +-25 cents."
        case "AnTgt":
            return "click here to toggle entry target status on/off."
        case "AnOnoff":
            return "Click here to temporarely switch entry on/off. This is handy if you want to try if this instrument is causing the masking; switch it off and see if target audibility is better."
        case "AnMo":
            return "This toggles transposition level between 0, -12 and +12. This can also be used to find solution to the audibility issues; try your target an octave higher, or masker octave lower."
        case "Maskers":
            return "This column indicates the heaviest maskers in you orchestration chord. The red indicates the heaviest, yellow 2nd and magenta 3rd masker. Try to alter dynamics, playing techniques, transpositions etc... and see if the masking order changes."
        case "Prediction":
            return "This is one of the most important parameters on this page. The audibility prediction value is the result of an algorithm that takes the masking, blending and timbre similarity prameters into account. If this value is low, it moght be wise to revise the orchestration, if you like to have an audible target."
        case "SaveOrch":
            return "Here you can save the orchestration chord for yourself. The chord will be saved in your browser cache so, that when you start the Score-Tool App again, your chord is there. Saved orchestrations can be used, for example, in Search panel. The App suggest a name, but you can alter it or write your own."
        case "QuickListen":
            return "Click here to quickly listen how your orchestration chord sounds like."
        case "Listen":
            return "Here is implemented an acoustic model of Helsinki Music Centre hall. You can drag your orchestration instruments to pre-marked places in the picture to see how the placement affects the timbre and audibility. You can also change the listening position between conductor and audience. The conductor hears, for example, the nearest players louder than the audience."
        case "Orchestration":
            return "This is your orchestration on musical staff. The target is colored green, heaviest masker on red, second magenta and third yellow."
        case "Centroid":
            return "Here you can see the spectral centroids, i.e. the brightness value of your target and orchestration. Values under 2 kHz can be concidered 'dark'"
        case "Distance":
            return "Here you see the timbre distance value in percentage, i.e. how different your target's timbre is from orchestration. Similar timbres tend to blend together. The orhcestration homogeneity value tells you is the orchestration timbre sounds like a one entity or like a collection of different timbres."
        case "MaskStaff":
            return "In this graph you see the masking curve as colors of musical staff. The target overtones are marked on black noteheads, and the faintness indicates the loudness of the partial. The red color indictes heavy masking on vurrent frequency band, yellow moderate masking and green light masking."
        case "MaskCurve":
            return "This is the 'Main' graph of the Score-Tool App. Here you see the result of masking curve calculation along with the overtones of the target. Target peak overtone above the masking curve means, in theorym, that the partial is audible. Above the graph you also see the mix engineer classifications for different frequency areas. These can be useful to estimate, for example, muddiness or ear tiring properties of the orchestration. Clicking 'Orchestration formant' text shows the 'ideal orchestration formant', i.e. the big orchestral timbre graph against the graph of your orchestration. If they match, you propably have a 'big' sounding orchestration chord."
        case "Glyph":
            return "This is a visual representation of the timbre. This glyph shows the formant structure of your orchestration. If you have, for example, a nasal sounding timbre, it shows here as a peak on low formant area. This can be used also to quickly see how different your target and orchestration timbres are."
        case "Summary":
            return "This is a automatically generated summary of your orchestration. Here you see at a glance some properties, that can be read also from the graphs."
        }
    return ""
}