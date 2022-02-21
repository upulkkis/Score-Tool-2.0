import { DBinstruments } from './../instruments';
import {extract} from 'fuzzball';

export const assignName = (name) =>{
    let searchName = name
    if (name.toLowerCase().startsWith("clarinet in b")){
        searchName="clarinet"
    }
    if (name.toLowerCase().startsWith("bass clarinet")){
        searchName="bass_cl"
    }
    if (name.toLowerCase().startsWith("solo")){
        searchName=name.substr(5)
    }
    if (name.toLowerCase().startsWith("trombone")){
        searchName="tenor_trombone"
    }
    if (name.toLowerCase().startsWith("contrabass")){
        searchName="double_bass"
    }
    if (name.toLowerCase()==="baritone"){
        searchName="tuba"
    }
    if (searchName.toLowerCase().startsWith("natural")){
        searchName="horn"
    }
    if (searchName.toLowerCase().startsWith("lana,")){
        searchName="soprano_generic"
    }
    if (searchName.toLowerCase().startsWith("allura,")){
        searchName="soprano_generic"
    }
    if (searchName.toLowerCase().startsWith("max,")){
        searchName="tenor_generic"
    }

    const DBname = extract(searchName, Object.keys(DBinstruments))[0][0]
    return DBname
}