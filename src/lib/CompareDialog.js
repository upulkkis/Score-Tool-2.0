import * as React from 'react';
import axios from 'axios';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Slide from '@mui/material/Slide';
import ChordEditor from './ChordEditor';
import AddInstCompare from './AddInstCompare';
import CompareGraphs from './CompareGraphs';
import Plot from 'react-plotly.js';
import Orchestration from './Orchestration';
import { styled } from '@mui/material/styles';
import Paper from '@mui/material/Paper';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { address } from './Constants';
const baseURL = address
const Item = styled(Paper)(({ theme }) => ({
    ...theme.typography.body2,
    backgroundColor: '#fffef0',
    padding: theme.spacing(1),
    textAlign: 'center',
    color: theme.palette.text.secondary,
  }));

const theme = createTheme({
  palette: {
  neutral: {
    main: '#dcc4ac',
    contrastText: '#black'
  }
}
})

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export default function CompareDialog(props) {
    const [open, setOpen] = React.useState(false);

    const [list, setList] = React.useState([["flute", "normal", "mf", 60, 0, 1, 0], ["flute", "normal", "mf", 60, 0, 1, 1]])

    const [data, setData] = React.useState([])
    React.useEffect(() => {
        setOpen(state => state = props.open)
    }, [props])

    React.useEffect(()=>{
      if(sessionStorage.getItem("LastCompare")!=null){
        const instList = JSON.parse(sessionStorage.getItem("LastCompare"))
        setList(()=>instList)
        fetchAnalysisData(instList)
      }
    },[])

    const handleChange = (newData) => {
      let temp = [...list]
      temp[newData[6]] = newData
      setList(()=>temp)
      sessionStorage.setItem("LastCompare", JSON.stringify(temp))
      fetchAnalysisData(temp)
    }

    const fetchAnalysisData = (updList) => {
      let analyseList = []
      let index = 0
      updList.map(elem=>{
          analyseList.push([elem[0], elem[1], elem[2], elem[3]])
        })

      axios.post(baseURL+"compare", analyseList).then((response) => {
        //console.log(response)
        var result = response.data
        setData(()=>result)
      })
    }

    const updateGraphs = () => fetchAnalysisData(list)
    //console.log(localStorage.getItem("orchestrations"))
    return(
        <div>
        <Dialog
          fullScreen
          open={open}
          onClose={props.handleClose}
          TransitionComponent={Transition}
          PaperProps={{style:{backgroundColor: "#fffef0"}}}
        >
          <AppBar sx={{ position: 'relative', backgroundColor: "#dcc4ac", color:"#4c4c48" }}>
            <Toolbar>
              <IconButton
                edge="start"
                color="inherit"
                onClick={props.handleClose}
                aria-label="close"
              >
                <div>Click here, or press ESC to close Compare Editor</div>
              </IconButton>
            </Toolbar>
          </AppBar>
          <Typography style={{textAlign:"center"}}>
              Compare two instrument timbres. Select instruments to compare below.
          </Typography>
          <table style={{marginInline:"20vw"}}>
            <tbody>
          <AddInstCompare data={list[0]} onChange={handleChange}/>
          <AddInstCompare data={list[1]} onChange={handleChange}/>
          </tbody>
          </table>
          <ThemeProvider theme={theme}>
      <Button variant="contained" color="neutral" onClick={updateGraphs} style={{display:"none"}}> Click to compare</Button>
      </ThemeProvider>
          <CompareGraphs data={data}/>
          </Dialog>
          </div>
    )
}