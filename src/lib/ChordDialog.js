import * as React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Slide from '@mui/material/Slide';
import ChordEditor from './ChordEditor';
import { address } from './Constants';
const baseURL = address

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export default function ChordDialog(props) {
    const [open, setOpen] = React.useState(false);

    React.useEffect(() => {
        setOpen(state => state = props.open)
    }, [props])

    return(
        <div>
        <Dialog
          fullScreen
          open={open}
          onClose={props.handleClose}
          TransitionComponent={Transition}
          PaperProps={{style:{backgroundColor: "#fffef0"}}}
        >
          {/* 
          <AppBar sx={{ position: 'relative', backgroundColor: "#dcc4ac", color:"#4c4c48" }}>
            <Toolbar>
              <IconButton
                edge="start"
                color="inherit"
                onClick={props.handleClose}
                aria-label="close"
              >
                <div>Click here, or press ESC to close Chord Editor</div>
              </IconButton>
            </Toolbar>
          </AppBar>
          */} 
          <ChordEditor help={props.help}/>
          </Dialog>
          </div>
    )
}