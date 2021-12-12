import * as React from 'react';
import useScrollTrigger from '@mui/material/useScrollTrigger';
import Slide from '@mui/material/Slide';

export default function ScrollHide(props) {
    const trigger = useScrollTrigger();
    return (
        <Slide in={!trigger}>
        {props.children}
      </Slide>
    )
}