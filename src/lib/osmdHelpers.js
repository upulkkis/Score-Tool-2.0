//------------------------------------------------------------------------------
// Third-Party Libraries
//------------------------------------------------------------------------------
// N/A
//------------------------------------------------------------------------------
// Personal Components
//------------------------------------------------------------------------------
// N/A

// TODO: Remove this.ensembles
// This is just a hold over and bad code smell until I find a way to convert
// all logic to open sheet music display
export function parseOpenSheetMusicDisplayVexflowNotes(open_sheet_music_display_object) {
    // TODO: Reconsider how much you want to surface with this
    //       May want to make it so that ensemble[ensemble_index] returns the open sheet music display class
    //       May want to make it so that stave[stave_index] returns the open sheet music display class
    //       May want to make it so that note[note_index] returns the open sheet music display class

    // What's being targeted here
    // o.graphic.measureList[0][0]
    // o.graphic.measureList[stave_index][ensemble_index].staffEntries[note_index].vfNotes{random_key_value}
    // console.log("Beginning note parsing");
    let staves = open_sheet_music_display_object.graphic.measureList;

    // This just parses out the ensemble formatting from the open sheet
    // music display object. It returns
    // ensemble{ensemble_index}{stave_index}[note_index] = vexflow
    let parsed_ensembles = {};
    for (let stave_index = 0; stave_index < staves.length; stave_index++) {
        // console.log("----------------------");
        let stave = staves[stave_index];
        let ensemble_length = stave.length;
        // console.log("-- stave");
        // console.log(stave);

        for (let ensemble_index = 0; ensemble_index < ensemble_length; ensemble_index++) {
            let ensemble = stave[ensemble_index];
            // console.log("- ensemble");
            // console.log(ensemble);

            for (let note_index = 0; note_index < ensemble.staffEntries.length; note_index++) {
                let note = ensemble.staffEntries[note_index];
                // console.log("--- note");
                // console.log(note);

                for (const [key, vexflow_note] of Object.entries(note.vfNotes)) {
                    // console.log("---- vex flow note");
                    // console.log(key);
                    // console.log(vexflow_note);
                    let does_ensemble_exist = ensemble_index in parsed_ensembles;
                    if (!does_ensemble_exist) {
                        parsed_ensembles[ensemble_index] = {};
                    }
                    let does_stave_exist = stave_index in parsed_ensembles[ensemble_index];
                    if (!does_stave_exist) {
                        parsed_ensembles[ensemble_index][stave_index] = [];
                    }

                    parsed_ensembles[ensemble_index][stave_index].push(vexflow_note);
                }
            }
        }
    }

    // This just converts the dictionaries used to parse out the ensembles
    // into an array format so it can be:
    // ensembles[ensemble_index][stave_index][note_index] = vexflow_note
    let ensembles_to_return = [];
    for (const [ensemble_key, ensemble] of Object.entries(parsed_ensembles)) {
        let ensemble_to_add = [];
        // console.log("ensemble key: " + ensemble_key);
        for (const [stave_key, stave] of Object.entries(ensemble)) {
            let stave_to_add = [];
            // console.log("stave key: " + stave_key);
            for (var note_index = 0; note_index < stave.length; note_index++) {
                let note = stave[note_index];
                // console.log("note");
                // console.log(note);
                stave_to_add.push(note);
            }
            ensemble_to_add.push(stave_to_add);
        }
        ensembles_to_return.push(ensemble_to_add);
    }

    // console.log("ensembles_to_return");
    // console.log(ensembles_to_return);

    return ensembles_to_return;
}

export function getCurrentTimestamp() {
    return new Date();
}

// TODO: I don't think this is needed?
export function dateToTimeString(date) {
    return date.toISOString().split("T")[1];
}

export function calculateVexflowNoteCenterPosition(vexflow_note) {
    return vexflow_note.getBoundingBox().x + vexflow_note.getBoundingBox().w / 2;
}

export function calculateTotalStaves(open_sheet_music_display_object, ensemble_index) {
    // TODO: I forget why I wanted ensembles, keep it for now, but re-examine it later
    let total_staves = open_sheet_music_display_object.graphic.measureList.length;
    // console.log("Total staves: " + total_staves);
    return total_staves;
}

export function calculateSongDurationInSeconds(open_sheet_music_display_object, tempo) {
    let beats_per_a_measure = 4;
    let total_beats = calculateTotalStaves(open_sheet_music_display_object, 0) * beats_per_a_measure;
    let seconds_per_a_beat = 60 / tempo;
    let total_song_duration = seconds_per_a_beat * total_beats;

    return total_song_duration;
}

export function calculateSongDurationInMilliseconds(open_sheet_music_display_object, tempo) {
    return calculateSongDurationInSeconds(open_sheet_music_display_object, tempo) * 1000;
}

export function calculatePercentageThroughSongByTime(
    open_sheet_music_display_object,
    song_start_timestamp,
    current_timestamp,
    tempo
) {
    let song_start_time_in_milliseconds = song_start_timestamp.getTime();
    let current_time_in_milliseconds = current_timestamp.getTime();
    let total_song_time_in_milliseconds = calculateSongDurationInMilliseconds(open_sheet_music_display_object, tempo);
    let current_song_timestamp = current_time_in_milliseconds - song_start_time_in_milliseconds;
    let current_song_percentage = current_song_timestamp / total_song_time_in_milliseconds;

    // ---------------------------------------------------------------------
    // Debugging
    // ---------------------------------------------------------------------
    // console.log("song_start_timestamp: " + song_start_time_in_milliseconds);
    // console.log("current_timestamp: " + current_time_in_milliseconds);
    // console.log("total_song_time_in_milliseconds: " + total_song_time_in_milliseconds);
    // console.log("current_song_timestamp: " + current_song_timestamp);
    // console.log("current_song_percentage: " + current_song_percentage);

    return current_song_percentage;
}

export function convertTimeStampToStaveIndex(
    open_sheet_music_display_object,
    song_start_timestamp,
    current_timestamp,
    tempo
) {
    let current_song_percentage = calculatePercentageThroughSongByTime(
        open_sheet_music_display_object,
        song_start_timestamp,
        current_timestamp,
        tempo
    );
    let total_staves = calculateTotalStaves(open_sheet_music_display_object, 0);

    // Boundary guards for > length and returns the last index
    // TODO: Make this not so ... bad
    let current_stave_index = null;
    if (current_song_percentage < 0) {
        current_stave_index = 0;
    } else if (current_song_percentage > 1) {
        current_stave_index = total_staves - 1;
    } else {
        current_stave_index = Math.floor(total_staves * current_song_percentage);
    }

    // boundary guarding - if over total staves possible, then return the last one
    // console.log("current_song_percentage: " + current_song_percentage);
    // console.log("current_stave_index: " + current_stave_index);

    return current_stave_index;
}

// TODO: Remove reliance of ensembles and abstract out support to pull that when
// needed from open sheet music display object
export function convertTimeStampToNoteIndex(
    open_sheet_music_display_object,
    song_start_timestamp,
    current_timestamp,
    tempo,
    ensembles
) {
    let seconds_per_a_beat = 60 / tempo;
    let milliseconds_per_a_beat = seconds_per_a_beat * 1000;
    let beats_per_a_measure = 4;

    let stave_duration_in_seconds = seconds_per_a_beat * beats_per_a_measure;
    let stave_duration_in_milliseconds = stave_duration_in_seconds * 1000;

    let current_song_percentage = calculatePercentageThroughSongByTime(
        open_sheet_music_display_object,
        song_start_timestamp,
        current_timestamp,
        tempo
    );
    let current_stave_index = convertTimeStampToStaveIndex(
        open_sheet_music_display_object,
        song_start_timestamp,
        current_timestamp,
        tempo
    );

    // TODO: Change this to support different ensembles? I don't think this
    //       is a big deal, or needed at all
    // TODO: Change this so that the current stave elements are pulled from
    //       open sheet music display
    let current_stave = ensembles[0][current_stave_index];
    let current_percentage_through_stave =
        (current_timestamp.getTime() - song_start_timestamp.getTime()) % stave_duration_in_milliseconds;
    let current_stave_percentage = current_percentage_through_stave / stave_duration_in_milliseconds;

    let current_note_index = null;
    let beat_time = 0;

    if (current_song_percentage < 0) {
        return 0;
    }
    if (current_song_percentage > 1) {
        return current_stave.length - 1;
    } else {
        for (var note_index = 0; note_index < current_stave.length; note_index++) {
            // note_duration_in_milliseconds
            // let note = current_stave[note_index]
            let beat_modifier = convertVexflowDurationToBeatModifier(current_stave[note_index].duration);
            beat_time += milliseconds_per_a_beat * beat_modifier;
            if (current_stave_percentage < beat_time / stave_duration_in_milliseconds) {
                current_note_index = note_index;
                break;
            }
        }
    }

    // ---------------------------------------------------------------------
    // Debug
    // ---------------------------------------------------------------------
    // console.log("seconds_per_a_beat: " + seconds_per_a_beat);
    // console.log("beats_per_a_measure: " + beats_per_a_measure);
    // console.log("stave_duration_in_seconds: " + stave_duration_in_seconds);
    // console.log("stave_duration_in_milliseconds: " + stave_duration_in_milliseconds);
    // console.log("----------------------------------------------------");
    // console.log("current_song_percentage: " + current_song_percentage);
    // console.log("current_stave_index: " + current_stave_index);
    // console.log("current_stave");
    // console.log(current_stave);
    // console.log("current_percentage_through_stave: " + current_percentage_through_stave);
    // console.log("current_stave_percentage: " + current_stave_percentage);
    // console.log("current_note_index: " + current_note_index);

    return current_note_index;
}

// Calculates the next note's stave index. It's basically the hey, "I need to
// know which stave the next note is in" of functions
// TODO: Remove usage of ensembles, rely on open sheet music object and correct function
export function calculateNextNoteStaveIndex(ensembles, ensemble_index, stave_index, note_index) {
    // boundary guarding against any index being  < 0
    ensemble_index = ensemble_index >= 0 ? ensemble_index : 0;
    stave_index = stave_index >= 0 ? stave_index : 0;
    note_index = note_index >= 0 ? note_index : 0;

    let is_last_stave_note = note_index >= ensembles[ensemble_index][stave_index].length - 1;
    let is_final_note = is_last_stave_note && stave_index >= ensembles[ensemble_index].length - 1;

    let next_note_stave_index = null;

    // song is over
    if (is_final_note) {
        // do nothing - return null
    } else if (is_last_stave_note) {
        // stave is finished
        next_note_stave_index = stave_index + 1;
    } else {
        // still in stave
        next_note_stave_index = stave_index;
    }

    return next_note_stave_index;
}

// TODO: Remove usage of ensembles, rely on open sheet music object and correct function
export function calculateNextNoteIndex(ensembles, ensemble_index, stave_index, note_index) {
    // boundary guarding against any index being  < 0
    ensemble_index = ensemble_index >= 0 ? ensemble_index : 0;
    stave_index = stave_index >= 0 ? stave_index : 0;
    note_index = note_index >= 0 ? note_index : 0;

    let is_last_stave_note = note_index >= ensembles[ensemble_index][stave_index].length - 1;
    let is_final_note = is_last_stave_note && stave_index >= ensembles[ensemble_index].length - 1;

    let next_note_index = null;

    // song is over
    if (is_final_note) {
        // do nothing - return null
    } else if (is_last_stave_note) {
        // stave is finished
        next_note_index = 0;
    } else {
        // still in stave
        next_note_index = note_index + 1;
    }

    return next_note_index;
}

export function convertVexflowDurationToBeatModifier(vexflow_duration) {
    let beat_modifier_to_return = 1;
    switch (vexflow_duration) {
        // I have no idea if this is right!
        case "64":
            beat_modifier_to_return = 1 / 16;
            break;
        // I have no idea if this is right!
        case "32":
            beat_modifier_to_return = 1 / 8;
            break;
        // I have no idea if this is right!
        case "16":
            beat_modifier_to_return = 1 / 4;
            break;
        // I have no idea if this is right!
        case "8":
            beat_modifier_to_return = 1 / 2;
            break;
        case "q":
            beat_modifier_to_return = 1;
            break;
        case "h":
            beat_modifier_to_return = 2;
            break;
        case "w":
            beat_modifier_to_return = 4;
            break;
        default:
            beat_modifier_to_return = 1;
            break;
    }
    return beat_modifier_to_return;
}

// This will generate the position on the sheet music relative to the time
// and the note of the song. This means that if the notes are not uniformly
// distributed between staves such that they line up with the time, this
// will return the correct position
// This will draw return the position relative to the end bars of a stave
// and the beginning bars of the new stave
// To indicate that the last note is being drawn pass in null for the
// next_note_index and next_note_stave_index
export function convertTimestampToSheetMusicPositionRelativeToNotes(
    open_sheet_music_display_object,
    song_start_timestamp,
    current_timestamp,
    start_note_ensemble_index,
    start_note_stave_index,
    start_note_index,
    next_note_ensemble_index,
    next_note_stave_index,
    next_note_index,
    tempo,
    ensembles
) {
    // for now, ensemble is always assumed to be == 0

    // TODO: fix bug when index elements are out of bounds
    let is_next_note_null = next_note_stave_index === null || next_note_index === null;
    let total_staves = calculateTotalStaves(open_sheet_music_display_object, 0);
    let total_notes_in_start_note_stave = ensembles[start_note_ensemble_index][start_note_stave_index].length;
    let total_notes_in_next_note_stave = !is_next_note_null
        ? ensembles[start_note_ensemble_index][next_note_stave_index].length
        : null;

    // boundary guarding
    start_note_stave_index = start_note_stave_index < 0 ? 0 : start_note_stave_index;
    start_note_stave_index = start_note_stave_index > total_staves ? total_staves - 1 : start_note_stave_index;

    start_note_index = start_note_index < 0 ? 0 : start_note_index;
    start_note_index =
        start_note_index > total_notes_in_start_note_stave ? total_notes_in_start_note_stave - 1 : start_note_index;

    if (next_note_stave_index !== null) {
        next_note_stave_index = next_note_stave_index < 0 ? 0 : next_note_stave_index;
        next_note_stave_index = next_note_stave_index > total_staves ? total_staves - 1 : next_note_stave_index;
    }

    if (next_note_index !== null) {
        next_note_index = next_note_index < 0 ? 0 : next_note_index;
        next_note_index =
            next_note_stave_index > total_staves && next_note_index > total_notes_in_next_note_stave
                ? total_notes_in_next_note_stave - 1
                : next_note_index;
    }
    // ---------
    // next_note_stave_index is null when it is the final note
    // next_note_index is null when it is the final note

    // check if line change is happening
    //      start bar -> next_note
    // check if last part of song
    //      current_note -> end bar
    // other wise
    //      current_note -> next_note

    let song_percentage = calculatePercentageThroughSongByTime(
        open_sheet_music_display_object,
        song_start_timestamp,
        current_timestamp,
        tempo
    );

    // ---------
    // Start note configurations
    let start_note_vexflow_stave = retrieveVexflowStave(
        open_sheet_music_display_object,
        start_note_ensemble_index,
        start_note_stave_index
    );
    let start_stave_end_x = start_note_vexflow_stave.end_x;

    let start_vexflow_note = retrieveVexflowNote(
        open_sheet_music_display_object,
        start_note_ensemble_index,
        start_note_stave_index,
        start_note_index
    );
    let start_note_x = calculateVexflowNoteCenterPosition(start_vexflow_note);

    // Next note configurations
    let next_note_vexflow_stave =
        next_note_stave_index === null
            ? null
            : retrieveVexflowStave(open_sheet_music_display_object, next_note_ensemble_index, next_note_stave_index);
    let next_stave_start_x = next_note_vexflow_stave === null ? null : next_note_vexflow_stave.start_x;

    let next_vexflow_note =
        next_note_stave_index === null || next_note_index === null
            ? null
            : retrieveVexflowNote(
                  open_sheet_music_display_object,
                  next_note_ensemble_index,
                  next_note_stave_index,
                  next_note_index
              );
    let next_note_x =
        next_note_stave_index === null || next_note_index === null
            ? null
            : calculateVexflowNoteCenterPosition(next_vexflow_note);

    // ---
    let seconds_per_a_beat = 60 / tempo;
    // TODO: Bug, make sure this is pulled from the open sheet music display
    //       object
    let beat_modifier = convertVexflowDurationToBeatModifier(start_vexflow_note.duration);
    let milliseconds_per_a_beat = seconds_per_a_beat * 1000;
    let total_beat_duration = milliseconds_per_a_beat * beat_modifier;
    let current_time_through_song = current_timestamp.getTime() - song_start_timestamp.getTime();
    let current_beat_duration = current_time_through_song % total_beat_duration;
    let current_beat_percentage = current_beat_duration / total_beat_duration;

    // ---
    let start_x_position = null;
    let end_x_position = null;
    // let is_line_change_happening = start_note_line !== next_note_line;
    let is_line_change_happening = is_next_note_null ? false : start_note_vexflow_stave.y !== next_note_vexflow_stave.y;
    let is_last_stave_note = start_note_index >= total_notes_in_start_note_stave - 1;
    let is_final_note = is_last_stave_note && start_note_stave_index >= total_staves - 1;

    // BUG! - This is an intentional hard-coded bug, I have no idea how
    // to determine how far along in the current beat being played
    // without being able to compare it to time, fix this so that it
    // based on the display distance of the notes and the timestamp,
    // instead of the position in time
    let is_on_next_line = is_last_stave_note && current_beat_percentage >= 0.5 ? true : false;
    if (is_line_change_happening) {
        if (is_on_next_line) {
            start_x_position = next_stave_start_x;
            end_x_position = next_note_x;
        } else {
            start_x_position = start_note_x;
            end_x_position = start_stave_end_x;
        }
    } else if (is_final_note) {
        // Note on left, staff line on right
        start_x_position = start_note_x;
        end_x_position = start_stave_end_x;
    } else {
        // Default just get position
        start_x_position = start_note_x;
        end_x_position = next_note_x;
    }

    // TODO: Make sure this respects any beat configuration outside of 4/4
    let distance_between_start_and_next = end_x_position - start_x_position;
    let distance_through_beat =
        song_percentage < 1
            ? current_beat_percentage * distance_between_start_and_next
            : distance_between_start_and_next;

    let x_position = start_x_position + distance_through_beat;

    let y_position = start_note_vexflow_stave.getBottomLineY() - start_note_vexflow_stave.height;
    // This was lazy, but it worked
    if (is_next_note_null && is_on_next_line && !is_final_note) {
        y_position = next_note_vexflow_stave.getBottomLineY() - start_note_vexflow_stave.height;
    }

    let position_to_return = {
        // x: 10,
        x: x_position,
        // y: 0
        // y: 165
        y: y_position,
    };

    // --------------------
    // Debug
    // --------------------
    // console.log("----------------------------------------------");
    // console.log("start_note_stave_index: " + start_note_stave_index);
    // console.log("start_note_index: " + start_note_index);
    // console.log("next_note_stave_index: " + next_note_stave_index);
    // console.log("next_note_index: " + next_note_index);
    // console.log("song_start_timestamp: " + song_start_timestamp.getTime());
    // console.log("current_timestamp: " + current_timestamp.getTime());
    // console.log("------");
    // console.log("song_percentage: " + song_percentage);
    // console.log("------");
    // console.log("start_note_vexflow_stave");
    // console.log(start_note_vexflow_stave);
    // console.log("start_stave_end_x: " + start_stave_end_x);
    // console.log("start_vexflow_note");
    // console.log(start_vexflow_note);
    // console.log("start_vexflow_note_duration: " + start_vexflow_note.duration);
    // console.log("start_note_x: " + start_note_x);
    // console.log("------");
    // console.log("next_note_vexflow_stave");
    // console.log(next_note_vexflow_stave);
    // console.log("next_stave_start_x: " + next_stave_start_x);
    // console.log("next_vexflow_note");
    // console.log(next_vexflow_note);
    // console.log("next_vexflow_note_duration: " + next_vexflow_note.duration);
    // console.log("next_note_x: " + next_note_x);
    // console.log("------");
    // console.log("seconds_per_a_beat: " + seconds_per_a_beat);
    // console.log("beats_per_a_measure: " + beats_per_a_measure);
    // console.log("beat_modifier: " + beat_modifier);
    // console.log("milliseconds_per_a_beat: " + milliseconds_per_a_beat);
    // console.log("total_beat_duration: " + total_beat_duration);
    // console.log("current_time_through_song: " + current_time_through_song);
    // console.log("current_beat_duration: " + current_beat_duration);
    // console.log("current_beat_percentage: " + current_beat_percentage);
    // console.log("------");
    // console.log("is_line_change_happening: " + is_line_change_happening);
    // console.log("is_last_stave_note: " + is_last_stave_note);
    // console.log("is_final_note: " + is_final_note);
    // console.log("------");
    // console.log("x_position: " + x_position);
    // console.log("y_position: " + y_position);
    // console.log("------------------------------------------------------");
    // console.log("start_note_x: " + start_note_x);
    // console.log("next_stave_start_x: " + next_stave_start_x);
    // console.log("next_note_x: " + next_note_x);
    // console.log("start_x_position: " + start_x_position);
    // console.log("end_x_position: " + end_x_position);
    // console.log("distance_between_start_and_next: " + distance_between_start_and_next);
    // console.log("distance_through_beat: " + distance_through_beat);

    return position_to_return;
}

export function convertTimestampToVexflowSheetMusicPosition(
    open_sheet_music_display_object,
    song_start_timestamp,
    current_timestamp,
    tempo,
    ensembles
) {
    // console.log("open_sheet_music_display:");
    // console.log("song_start_timestamp: " + song_start_timestamp.getTime());
    // console.log("current_timestamp: " + current_timestamp.getTime());

    let current_stave_index = convertTimeStampToStaveIndex(
        open_sheet_music_display_object,
        song_start_timestamp,
        current_timestamp,
        tempo
    );
    let current_note_index = convertTimeStampToNoteIndex(
        open_sheet_music_display_object,
        song_start_timestamp,
        current_timestamp,
        tempo,
        ensembles
    );

    let next_note_stave_index = calculateNextNoteStaveIndex(ensembles, 0, current_stave_index, current_note_index);
    let next_note_index = calculateNextNoteIndex(ensembles, 0, current_stave_index, current_note_index);

    // Setup finished, now get the position
    // console.log("==========================================");
    // console.log("current_stave_index: " + current_stave_index);
    // console.log("current_note_index: " + current_note_index);
    // console.log("next_note_stave_index: " + next_note_stave_index);
    // console.log("next_note_index: " + next_note_index);

    let position = convertTimestampToSheetMusicPositionRelativeToNotes(
        open_sheet_music_display_object,
        song_start_timestamp,
        current_timestamp,
        0,
        current_stave_index,
        current_note_index,
        0,
        next_note_stave_index,
        next_note_index,
        tempo,
        ensembles
    );

    let position_to_return = {
        // x: 10,
        // y: 165
        x: position.x,
        y: position.y,
    };

    return position_to_return;
}

export function calculateTotalBeatsBeforeNote(
    open_sheet_music_display_object,
    ensemble_index,
    stave_index,
    note_index
) {
    // retrieveVexflowNote(open_sheet_music_display_object, ensemble_index, stave_index, note_index);
    // retrieveVexflowNote
    let open_sheet_music_display_measures = open_sheet_music_display_object.graphic.measureList;
    let open_sheet_music_display_stave = open_sheet_music_display_measures[stave_index];
    let open_sheet_music_display_ensemble_stave = open_sheet_music_display_stave[ensemble_index];
    let stave_notes = open_sheet_music_display_ensemble_stave.staffEntries;
    // o.graphic.measureList[stave_index][ensemble_index].staffEntries[note_index].vfNotes

    let beats_in_current_stave_before_note = 0;
    for (let index = 0; index < note_index; index++) {
        let current_vexflow_note = retrieveVexflowNote(
            open_sheet_music_display_object,
            ensemble_index,
            stave_index,
            index
        );
        beats_in_current_stave_before_note += convertNoteToBeatValue(
            "4/4",
            current_vexflow_note.duration // this is the music note itself
        );
    }
    return beats_in_current_stave_before_note;
}

// TODO: Make this less terrible - This is a terrible name
export function convertEnsembleStaveAndNoteIndexToTimestamp(
    open_sheet_music_display_object,
    song_start_timestamp,
    beats_per_a_measure,
    tempo,
    ensemble_index,
    stave_index,
    note_index
) {
    let beats_from_previous_staves_before_note = stave_index * beats_per_a_measure;
    // let beats_in_current_stave_before_note = 0;
    let beats_in_current_stave_before_note = calculateTotalBeatsBeforeNote(
        open_sheet_music_display_object,
        ensemble_index,
        stave_index,
        note_index
    );
    let total_beats = beats_from_previous_staves_before_note + beats_in_current_stave_before_note;

    let seconds_per_a_beat = 60 / tempo;
    let milliseconds_per_a_beat = 1000 * seconds_per_a_beat;

    let total_milliseconds_before_current_note = total_beats * milliseconds_per_a_beat;

    let note_play_timestamp_in_milliseconds = song_start_timestamp.getTime() + total_milliseconds_before_current_note;
    let date_to_return = new Date(note_play_timestamp_in_milliseconds);

    // -----------------------------
    // Debugging
    // -----------------------------
    // console.log("-----------------------------");
    // console.log(
    //     "song_start_timestamp milliseconds: " + this.props.song_start_timestamp.getTime()
    // );
    // console.log(
    //     "beats_from_previous_staves_before_note: " + beats_from_previous_staves_before_note
    // );
    // console.log("beats_in_current_stave_before_note: " + beats_in_current_stave_before_note);
    // console.log("total_beats: " + total_beats);
    // console.log("seconds_per_a_beat: " + seconds_per_a_beat);
    // console.log("milliseconds_per_a_beat: " + milliseconds_per_a_beat);
    // console.log(
    //     "total_milliseconds_before_current_note: " + total_milliseconds_before_current_note
    // );
    // console.log("note_play_timestamp_in_milliseconds: " + note_play_timestamp_in_milliseconds);
    // console.log("date_to_return: " + date_to_return.getTime());
    // -----------------------------

    return date_to_return;
}

export function generateNotesToGradeFromOpenSheetMusicDisplay(
    open_sheet_music_display_object,
    start_timestamp,
    ensemble_index,
    tempo,
    grading_timing_window_in_milliseconds
) {
    console.log("Generating notes!");
    // Configure notes to be graded
    let new_notes_to_grade = [];

    let open_sheet_music_display_staves = open_sheet_music_display_object.graphic.measureList;
    for (var stave_index = 0; stave_index < open_sheet_music_display_staves.length; stave_index++) {
        let open_sheet_music_display_stave = open_sheet_music_display_staves[stave_index];
        let open_sheet_music_display_ensemble_stave = open_sheet_music_display_stave[ensemble_index];
        for (
            var note_index = 0;
            note_index < open_sheet_music_display_ensemble_stave.staffEntries.length;
            note_index++
        ) {
            let note_play_timestamp = convertEnsembleStaveAndNoteIndexToTimestamp(
                open_sheet_music_display_object,
                start_timestamp,
                4, // TODO: pull beats per a measure from vexflow object
                tempo,
                ensemble_index,
                stave_index,
                note_index
            );

            let current_vexflow_note = retrieveVexflowNote(
                open_sheet_music_display_object,
                ensemble_index,
                stave_index,
                note_index
            );

            let note = {
                stave_index: stave_index,
                note_index: note_index,
                grading_start_timestamp: new Date(
                    note_play_timestamp.getTime() - grading_timing_window_in_milliseconds / 2
                ), // MUST be calculated here
                grading_stop_timestamp: new Date(
                    note_play_timestamp.getTime() + grading_timing_window_in_milliseconds / 2
                ), // MUST be calculated here
                play_in_song_timestamp: note_play_timestamp, // MUST be calculated here, when it should play in the song
                note_played_by_player_timestamp: null, // Simple value null or timestamp
                vexflow_note: current_vexflow_note,
            };

            new_notes_to_grade.push(note);

            // Assumes only one vexflow note is stored in the `vfNotes` object
            // console.log("ensemble_index: " + ensemble_index);
            // console.log("stave_index: " + stave_index);
            // console.log("note_index: " + note_index);
            // console.log("note_play_timestamp: " + note_play_timestamp.getTime());
        }
    }

    // console.log("new_notes_to_grade: " + new_notes_to_grade);

    return new_notes_to_grade;
}

// TODO: Use to account for different time signatures when calculating beat
// time values
// I.E. Quarter notes work for 4/4 as a single beat, but that changes for
// 3/4 etc
// convert_vexflow_beat_to_time(tempo, beat_type) {
// }

export function convertNoteToBeatValue(time_signature, beat_type) {
    // From music notation to beat amount
    // time_signature is always 4/4 for now
    // in 4/4 all quarter notes are 1 beat
    return convertVexflowDurationToBeatModifier(beat_type);
}

export function retrieveVexflowStave(open_sheet_music_display_object, ensemble_index, stave_index) {
    let does_stave_exist = open_sheet_music_display_object.graphic.measureList.length > stave_index;
    let does_ensemble_exist =
        does_stave_exist && open_sheet_music_display_object.graphic.measureList[stave_index].length > ensemble_index;

    let vexflow_stave_to_return = null;
    if (does_stave_exist && does_ensemble_exist) {
        vexflow_stave_to_return =
            open_sheet_music_display_object.graphic.measureList[stave_index][ensemble_index].stave;
    }

    return vexflow_stave_to_return;
}

export function retrieveVexflowNotes(open_sheet_music_display_object, stave_index, note_index) {
    let does_stave_exist = open_sheet_music_display_object.graphic.measureList.length > stave_index;
    // TODO: Move this to a function to retrieve an ensemble
    let ensembles = open_sheet_music_display_object.graphic.measureList[stave_index];
    let vexflow_notes_to_return = [];

    for (var ensemble_index = 0; ensemble_index < ensembles.length; ensemble_index++) {
        let vexflow_note_found = retrieveVexflowNote(
            open_sheet_music_display_object,
            ensemble_index,
            stave_index,
            note_index
        );

        vexflow_notes_to_return.push(vexflow_note_found);
    }

    return vexflow_notes_to_return;
}

export function retrieveVexflowNote(open_sheet_music_display_object, ensemble_index, stave_index, note_index) {
    let does_stave_exist = open_sheet_music_display_object.graphic.measureList.length > stave_index;
    let does_ensemble_exist =
        does_stave_exist && open_sheet_music_display_object.graphic.measureList[stave_index].length > ensemble_index;
    let does_note_exist =
        does_stave_exist &&
        does_ensemble_exist &&
        open_sheet_music_display_object.graphic.measureList[stave_index][ensemble_index].staffEntries.length >
            note_index &&
        Object.keys(
            open_sheet_music_display_object.graphic.measureList[stave_index][ensemble_index].staffEntries[note_index]
                .vfNotes
        ).length > 0;

    // For now this should scream when it is flagged, because I don't now
    // when more than one note would be there
    let more_than_one_note_detected =
        does_note_exist &&
        Object.keys(
            open_sheet_music_display_object.graphic.measureList[stave_index][ensemble_index].staffEntries[note_index]
                .vfNotes
        ).length > 1;
    if (more_than_one_note_detected) {
        throw new Error(`"Ensemble [${ensemble_index}]
                        - Stave [${stave_index}]
                        - Note [${note_index}]
                        has more than 1 vexflow note, and I don't know what to do.`);
    }

    // o.graphic.measureList[stave_index][ensemble_index].staffEntries[note_index].vfNotes{random_key_value}

    let vexflow_note_to_return = null;
    if (does_ensemble_exist && does_stave_exist && does_note_exist) {
        let vexflow_note_key = Object.keys(
            open_sheet_music_display_object.graphic.measureList[stave_index][ensemble_index].staffEntries[note_index]
                .vfNotes
        )[0];

        vexflow_note_to_return =
            open_sheet_music_display_object.graphic.measureList[stave_index][ensemble_index].staffEntries[note_index]
                .vfNotes[vexflow_note_key];
    }

    return vexflow_note_to_return;
}

export function getEnsembleLength(open_sheet_music_display) {
    return open_sheet_music_display.graphic.numberOfStaves;
}
