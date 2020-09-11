// General
import React, { useState, useEffect, useContext, SyntheticEvent } from 'react';
import { ipcRenderer } from 'electron';
import { Host, SettingsUpdate } from '../types';
// Components
import HostRow from './HostRow';
// Contexts
import { HostsContext } from '../context/HostsContext';
import { SettingsContext } from '../context/SettingsContext';
// UI
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import AddCircleOutlineIcon from '@material-ui/icons/AddCircleOutline';
import Typography from '@material-ui/core/Typography';
import Slider from '@material-ui/core/Slider';
import { useDebounce } from '../utils/useDebounce';

const useStyles = makeStyles({
    root: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        height: '100vh'
    },
    header: {
        fontSize: '2rem',
        marginTop: '1rem',
        marginBottom: '1rem',
        textAlign: 'center'
    },
    newButtonContainer: {
        display: 'flex',
        justifyContent: 'center'
    },
    settingsBody: {
        margin: '1rem'
    }
});

type PTSidePaneProps = {
}
function PTSidePane(props: PTSidePaneProps) {
    const [hosts, setHosts] = useContext(HostsContext);
    const [settings, setSettings] = useContext<SettingsUpdate>(SettingsContext);
    const [timeBetweenPingsLocal_selectorValue, setTimeBetweenPingsLocal_selectorValue] = useState(4);
    const timeBetweenPingsDebounced_selectorValue = useDebounce(timeBetweenPingsLocal_selectorValue, 1000);

    const fibonacci = [1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144, 233, 377, 610, 987, 1597, 2584, 4181];
    const classes = useStyles();

    // New button
    const handleClickNew = () => {
        let newHost: Host = {
            id: (new Date()).getTime(),
            name: '',
            isEnabled: false,
            isBrandNew: true
        }
        let hostsCopy = [...hosts];
        hostsCopy.push(newHost);
        setHosts(hostsCopy);
    }

    //Settings - time between pings
    useEffect(() => {
        let settingsCopy = { ...settings };
        settingsCopy.timeBetweenPings_ms = fibonacci[timeBetweenPingsDebounced_selectorValue-1] * 1000;
        setSettings(settingsCopy);
    }, [timeBetweenPingsDebounced_selectorValue]);


    // Settings - warning timeout
    const handleWarningTimeoutUpdate = (event:SyntheticEvent, newValue:number) => {
        let settingsCopy = { ...settings };
        settingsCopy.warningTimeout = newValue;
        setSettings(settingsCopy);
    }

    // settings - chartNodesToDisplayLocal
    const handleChartNodesToDisplayUpdate = (event:SyntheticEvent, newValue:number) => {
        let settingsCopy = { ...settings };
        settingsCopy.chartNodesToDisplay = newValue;
        setSettings(settingsCopy);
    }

    return (
        <div className={classes.root}>
            <div>
                <div className={classes.header}>Hosts</div>
                {hosts.map((host: Host) =>
                    <HostRow
                        key={host.id}
                        id={host.id}
                        isEnabled={host.isEnabled}
                        name={host.name}
                        isBrandNew={host.isBrandNew}
                    />
                )}
                <div className={classes.newButtonContainer}>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleClickNew}
                        startIcon={<AddCircleOutlineIcon />}
                    >
                        New
                    </Button>
                </div>
            </div>
            <div>
                <div className={classes.header}>Settings</div>
                <div className={classes.settingsBody}>
                    <Typography id="non-linear-slider" gutterBottom>
                        Time Between Pings (seconds)
                    </Typography>
                    <Slider
                        value={timeBetweenPingsLocal_selectorValue}
                        min={1}
                        step={1}
                        max={fibonacci.length}
                        scale={x => fibonacci[x-1]}
                        onChange={(event, newValue:number) => setTimeBetweenPingsLocal_selectorValue(newValue)}
                        valueLabelDisplay="auto"
                    />
                    <Typography gutterBottom>
                        Warning timeout length (milliseconds)
                    </Typography>
                    <Slider
                        value={settings.warningTimeout}
                        min={0}
                        step={25}
                        max={1000}
                        onChange={handleWarningTimeoutUpdate}
                        valueLabelDisplay="auto"
                    />

                    <Typography gutterBottom>
                        Chart nodes to display
                    </Typography>
                    <Slider
                        value={settings.chartNodesToDisplay}
                        min={5}
                        step={5}
                        max={150}
                        onChange={handleChartNodesToDisplayUpdate}
                        valueLabelDisplay="auto"
                    />
                </div>
            </div>
        </div>
    );
}

export default PTSidePane;