import React, { useState, useEffect, useRef, useContext } from 'react';
import { ipcRenderer } from 'electron';
import { PingRecord, PingResponseDecorated, Host, SettingsUpdate } from '../types';
import CanvasJSReact from '../assets/canvasjs.react'; //add full version or rename canvasjs.trial.react to canvasjs.react
import { useDebounce } from '../utils/useDebounce';
import _ from 'lodash';
import { SettingsContext } from '../context/SettingsContext';
import HighlightsTable from './HighlightsTable';
import { makeStyles } from '@material-ui/core/styles';
let CanvasJSChart = CanvasJSReact.CanvasJSChart;

const useStyles = makeStyles({
    root: {},
    basicMargin: {
        margin: '0.5rem'
    }
})

function PTChartPane() {
    // Record collection and storage
    const [pingRecords, setPingRecords] = useState<PingRecord[]>([]);
    const pingRecordsDebounced: PingRecord[] = useDebounce(pingRecords, 100);
    const classes = useStyles();

    useEffect(() => {
        ipcRenderer.on('pingResponse', (event, resp: PingResponseDecorated) => {
            let newPingRecord: PingRecord = {
                host: resp.host,
                time: resp.time,
                alive: resp.alive,
                startTime: resp.startTime
            }

            setPingRecords(pingRecords => pingRecords.concat(newPingRecord));
        });
    }, []);


    // CHART
    const chart = useRef();
    //ref for options since it's tracked by the chart outside of React
    const optionsRef = useRef(
        {
            data: [],
            backgroundColor: '#e1e8f1',
            axisX: {
                lineColor: '#B4BAC1',
            },
            axisY: {
                suffix: ' ms',
                lineColor: '#B4BAC1',
                gridColor: '#B4BAC1',
            },
            toolTip: {
                enabled: true,
                shared: true,
                content: '{name}: {y} ms',
                borderThickness: 0,
                cornerRadius: 4,
            },
            legend: {
                horizontalAlign: 'center',
                verticalAlign: 'bottom'
            },
            exportEnabled: true,
            zoomEnabled: true,
        }
    );

    const [settings, setSettings] = useContext<SettingsUpdate>(SettingsContext);

    useEffect(() => {
        const chartMinimumDifference = settings.chartNodesToDisplay * settings.timeBetweenPings_ms;
        const chartMinimum = (new Date()).getTime() - chartMinimumDifference;

        const grouped = _(pingRecordsDebounced)
            .filter((record: PingRecord) => record.startTime > chartMinimum)
            .groupBy((record: PingRecord) => record.host)
            .value();

        const dataReady = Object.keys(grouped).map(hostname => {
            return {
                type: 'line',
                name: hostname,
                showInLegend: true,
                legendText: hostname,
                connectNullData: true,
                nullDataLineDashType: "dot",
                markerSize: 5,
                dataPoints: grouped[hostname].map((record: PingRecord) => {
                    return { x: new Date(record.startTime), y: record.time };
                })
            }
        });

        chart.current.options.data = dataReady;
        chart.current.render();

    }, [pingRecordsDebounced]);




    return (
        <div>
            <div className={classes.basicMargin}>
                <CanvasJSChart options={optionsRef.current}
                    onRef={ref => chart.current = ref}
                />
            </div>
            <div className={classes.basicMargin}>
                <HighlightsTable
                    pingRecordsDebounced={pingRecordsDebounced}
                />
            </div>
        </div>
    );
}

export default PTChartPane;