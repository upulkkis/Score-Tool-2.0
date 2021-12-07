import * as React from 'react';
import Helps from './help/helps';
import Typography from '@mui/material/Typography';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuIcon from '@mui/icons-material/Menu';
import Container from '@mui/material/Container';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import Info from '@mui/icons-material/Info';
import Help from '@mui/icons-material/Help';
import { createTheme, ThemeProvider } from '@mui/material/styles';
const theme = createTheme({
  palette: {
  neutral: { 
    main: '#dcc4ac',
    contrastText: 'black'
  }
}
})

const pages = ['Score', 'Chord', 'Compare', "Search", "Manage"];
const settings = ['Profile', 'Account', 'Dashboard', 'Logout'];

export default function MyNavbar(props) {
    const [anchorElNav, setAnchorElNav] = React.useState(null);
    const [anchorElUser, setAnchorElUser] = React.useState(null);
    const [help, setHelp] = React.useState(false);
  
    const handleOpenNavMenu = (event) => {
      setAnchorElNav(event.currentTarget);
    };
    const handleOpenUserMenu = (event) => {
      setAnchorElUser(event.currentTarget);
    };
  
    const handleCloseNavMenu = (e) => {
      console.log(e)
      if(e==="Help"){
        props.help(!help)
        setHelp((state)=>state=!help)
      }
      props.navClick(e)
      setAnchorElNav(null);
      handleCloseUserMenu()
    };
  
    const handleCloseUserMenu = (e) => {
      setAnchorElUser(null);
    };
  
    return (
        <ThemeProvider theme={theme}>
      <AppBar color="neutral" sx={{height:50}}>
        <Container maxWidth="xl">
          <Toolbar disableGutters>
            <Tooltip title={<Helps help="Scoretool"/>} disableHoverListener={!help} disableTouchListener={!help}>
            <Typography
              variant="h6"
              noWrap
              component="div"
              sx={{ mr: 2, display: { xs: 'none', md: 'flex' }, cursor:"pointer" }}
              onClick={()=>props.navClick("About")}
            >
              Score-Tool 2.0
            </Typography>
            </Tooltip>
            <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
              <IconButton
                size="large"
                aria-label="account of current user"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleOpenNavMenu}
                color="inherit"
              >
                <MenuIcon />
              </IconButton>
              <Menu
                id="menu-appbar"
                anchorEl={anchorElNav}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'left',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'left',
                }}
                open={Boolean(anchorElNav)}
                onClose={handleCloseNavMenu}
                sx={{
                  display: { xs: 'block', md: 'none' },
                }}
              >
                {pages.map((page) => (
                  <Tooltip title={<Helps help={page}/>} disableHoverListener={!help}>
                  <MenuItem key={page} onClick={(e)=>handleCloseNavMenu(page, e)}>
                    <Typography textAlign="center">{page}</Typography>
                  </MenuItem>
                  </Tooltip>
                ))}
              </Menu>
            </Box>
            <Typography
              variant="h6"
              noWrap
              component="div"
              sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}
            >
              Score-Tool
            </Typography>
            <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
              {pages.map((page) => (
                <Tooltip title={<Helps help={page}/>} disableHoverListener={!help}>
                <Button
                  key={page}
                  onClick={(e)=>handleCloseNavMenu(page, e)}
                  sx={{ my: 2, display: 'block', color: 'black' }}
                >
                  {page}
                </Button>
                </Tooltip>
              ))}
            </Box>
  
            <Box sx={{ flexGrow: 0 }}>
              <Tooltip title="Toggle help">
                <IconButton onClick={(e)=>handleCloseNavMenu("Help", e)} sx={{ p: 0 }}>
                  <Help/>
                  {help ? "on" : "off"}
                </IconButton>
              </Tooltip>
              <Menu
                sx={{ mt: '45px' }}
                id="menu-appbar"
                anchorEl={anchorElUser}
                anchorOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                open={Boolean(anchorElUser)}
                onClose={handleCloseUserMenu}
              >
                  <MenuItem key={"About Score-Tool"} onClick={(e)=>handleCloseNavMenu("About", e)}>
                    <Typography textAlign="center">About Score-Tool</Typography>
                  </MenuItem>
                  <MenuItem key={"Enable help"} onClick={(e)=>handleCloseNavMenu("Help", e)}>
                    <Typography textAlign="center">{help ? "Disable help":"Enable help"}</Typography>
                  </MenuItem>
              </Menu>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>
      </ThemeProvider>
    );
}