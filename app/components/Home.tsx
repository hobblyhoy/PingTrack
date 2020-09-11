import React, { useState, useEffect } from 'react';
import PTSidePane from './PTSidePane';
import PTChartPane from './PTChartPane';
import { makeStyles } from '@material-ui/core';

const useStyles = makeStyles({
   root: {
      display: 'flex'
   },
   sidePaneContainer: {
      width: '300px', 
      height: '100vh', 
      overflowY: 'auto', 
      overflowX: 'hidden'
   },
   chartPaneContainer: {
      width: '100%', 
      height: '100vh', 
      overflowY: 'auto'
   }
});

function Home() {
   const classes = useStyles();

   return (
      <div className={classes.root}>
         <div className={classes.sidePaneContainer}>
            <PTSidePane />
         </div>
         <div className={classes.chartPaneContainer}>
            <PTChartPane />
         </div>
      </div>
   );
}

export default Home;
