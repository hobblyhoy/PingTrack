export type Host = {
    id: number,
    name: string,
    isEnabled: boolean,
    isBrandNew: boolean,
}

export type SettingsUpdate = {
    timeBetweenPings_ms: number,
    chartNodesToDisplay: number,
    warningTimeout: number
}

export type PingResponse = {
    host: string,
    numeric_host: string,
    alive: boolean,
    output: string,
    time: number,
    times: Array<number>,
    min: string,
    max: string,
    avg: string,
    packetLoss: string,
    stddev: string,
}

export type PingResponseDecorated = PingResponse & {
    startTime: number
}

export type PingRecord = {
    host: string,
    time: number,
    alive: boolean,
    startTime: number,
}