import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import ToggleButton from '@mui/material/ToggleButton';

const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '70vw',
    height: '70vh',
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
    overflow: 'auto',
  };

export default function AboutScoreTool(props) {
    const [open, setOpen] = React.useState(false);
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);
    return(
        <>
        <div style={{marginTop:10, textAlign:'center', width:'100%', height:'100vh', display:'flex', justifyContent: 'center', alignItems: 'normal'}}> 
        <ToggleButton
        fullWidth="true"
        size="small"
      value="check"
      selected={open}
      onChange={handleOpen}
      sx={{backgroundColor:'rgba(220,196,172,0.6)', width:150, height:40}}
    > Quick guide
        </ToggleButton>
 </div>

        <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
        <div style={{marginTop:10}}>
                        <Typography variant="h4" style={{border: "1px solid", padding: 5}}>This is a completely new version of Score-Tool. If you want to use the old version, visit <a href="https://old.score-tool.com" target="_blank">old.score-tool.com</a> </Typography>
            
<Typography variant="h5">About</Typography>
<Typography>
    Score-Tool is an analysis tool for music orchestration. The purpose of the tool is to help composers, conductors and other musicians to extract information about audibility and timbre from the score. The analysis results are showed on graphs, and there is also a possibility to listen any orchestration chord in a real binaural simulation of the concert hall.
</Typography>
<Typography variant="h5">Score</Typography>
<Typography>
    For analysis, the score must be in musicXML or mxl (compressed musicXML) format. All current notation programs can export musicXML from the "SaveAs" menu. 
    Drag and drop, or click drop area to upload your score to Score-Tool. Click "load score". Analyzed score can be downloaded as PNG file.
    </Typography>
    <Typography variant="h5">Chord</Typography>
<Typography>
    The Chord editor can be used without any files. Click any instrument name to add it to your orchestration. Click the notation stave and add notes with piano keyboard. After editing the instrumentation press "Update graphs" to view the analysis information.
    </Typography>
    <Typography variant="h5">Compare</Typography>
<Typography>
    The Compare editor lets you compare two individual timbres. Click the mini-staff to select pitch for each instrument. The graphs show the overtone structure and timbre data of both instruments.
    </Typography>
    <Typography variant="h5">Search</Typography>
<Typography>
    The Search feature requires you to save some orchestrations first. Orchestrations can be saved in Score and Chord editors. Select the search source from your saved orchestrations, select search space from orchestra instruments, select search method(s) and click SEARCH. As result you will get the closest match from database, which can be added to your saved orchestration.
    </Typography>
    <Typography variant="h5">Manage</Typography>
<Typography>
    Here you can manage your saved orchestrations. You can listen individual chords, and delete the ones you don't need anymore.
    The saved chords are already in your machine, in browser's local storage, but here you can also download them as file, or upload your orchestratrions to browser. 
    </Typography>
    <Typography variant="h6" style={{padding:10}}>Created in 2021 by <a href="https://uljaspulkkis.com" target="_blank">Uljas Pulkkis</a> </Typography>
        </div>
        </Box>
        </Modal>
        </>
    )
}