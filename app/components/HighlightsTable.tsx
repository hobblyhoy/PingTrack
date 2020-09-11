import React, { useState, useEffect, useRef, useContext } from 'react';
import { TableContainer, Paper, Table, TableHead, TableRow, TableCell, TableBody } from '@material-ui/core';
import { makeStyles } from '@material-ui/core';
import { PingRecord, SettingsUpdate } from '../types';
import { SettingsContext } from '../context/SettingsContext';
import CheckIcon from '@material-ui/icons/Check';
import WarningIcon from '@material-ui/icons/Warning';
import _ from 'lodash';

const useStyles = makeStyles({
   root: {
   },
   header: {
      fontSize: '2rem',
      marginTop: '1rem',
      marginBottom: '1rem',
   },
});

type Props = {
   pingRecordsDebounced: PingRecord[]
}
function HighlightsTable(props: Props) {
   const [highlightRows, setHighlightRows] = useState<PingRecord[]>([]);
   const [settings, setSettings] = useContext<SettingsUpdate>(SettingsContext);

   const classes = useStyles();

   useEffect(() => {
      const pingRecordsDebouncedTemp = [...props.pingRecordsDebounced];
      const rows = pingRecordsDebouncedTemp
         .reverse()
         .filter((record: PingRecord) => {
            return !record.alive || record.time > settings.warningTimeout;
         })
         .slice(0, 15);
      setHighlightRows(rows);
   }, [props.pingRecordsDebounced, settings]);

   let mapValueInRangeToPercent = (min, max, value) => (value - min) / (max - min);
   let mapPercentToValueInRange = (min, max, percent) => ((max - min) * percent) + min;

   let calculateRowColor = (highlightRow: PingRecord) => {
      let minRGB = [255, 255, 255]; //white
      let maxRGB = [255, 132, 0]; //kinda orangy warning color

      if (settings.warningTimeout <= 0) return 'rgb(255, 255, 255)';
      if (!highlightRow.alive || isNaN(highlightRow.time) || highlightRow.time <= 0) return 'rgb(255, 133, 133)'; //randomly chosen light red
      if (highlightRow.time >= 1000) return `rgb(${maxRGB.join(',')})`;

      let finalRGB = [0, 0, 0];
      for (let i = 0; i < finalRGB.length; i++) {
         let percent = mapValueInRangeToPercent(settings.warningTimeout, 1000, highlightRow.time);
         let mapped = mapPercentToValueInRange(minRGB[i], maxRGB[i], percent);
         finalRGB[i] = mapped;
      }

      return `rgb(${finalRGB.join(',')})`;
   }


   return (
      <div>
         <>
            <div className={classes.header}>
               Recent {settings.warningTimeout > 0 ? 'Warnings' : 'Pings'}
            </div>
            <TableContainer component={Paper}>
               <Table size="small" aria-label="a dense table">
                  <TableHead>
                     <TableRow>
                        <TableCell>Host</TableCell>
                        <TableCell align="right">Is Up</TableCell>
                        <TableCell align="right">Request Sent</TableCell>
                        <TableCell align="right">Time</TableCell>
                     </TableRow>
                  </TableHead>
                  <TableBody>
                     {highlightRows.length > 0 ? highlightRows.map((highlightRow: PingRecord, index) => (
                        <TableRow key={index} style={{ backgroundColor: calculateRowColor(highlightRow) }}>
                           <TableCell component="th" scope="row">
                              {highlightRow.host}
                           </TableCell>
                           <TableCell align="right">{highlightRow.alive ? <CheckIcon /> : <WarningIcon />}</TableCell>
                           <TableCell align="right">{(new Date(highlightRow.startTime)).toLocaleString()}</TableCell>
                           <TableCell align="right">{highlightRow.time ? highlightRow.time + ' ms' : 'N/A'}</TableCell>
                        </TableRow>
                     ))
                     : <TableRow>
                           <TableCell align="center" colSpan={4}>Nothing to show yet...</TableCell >
                        </TableRow>
                     }
                  </TableBody>
               </Table>
            </TableContainer>
         </>
      </div>
   );
}

export default HighlightsTable;