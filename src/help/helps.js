import * as React from 'react';
import { Tooltip } from '@mui/material';

export default function Helps({help}) {
    switch (help) {
        case "Scoretool":
            return "An orchestration psychoacoustic analysis web app for composers, conductors and musicians."
        case "Score":
            return "This the primary component of the Score-Tool App, where you can upload your own score."
    }
}