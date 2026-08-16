// ==========================================
// AM/FM SIGNAL SIMULATOR - WEB VERSION
// ==========================================

const SAMPLE_RATE = 100000;
const DURATION = 0.01;
const TOTAL_SAMPLES = Math.floor(
    SAMPLE_RATE * DURATION
);


// ==========================================
// GLOBAL RESULTS
// ==========================================

window.amResults = null;
window.fmResults = null;


// ==========================================
// BASIC SIGNAL FUNCTIONS
// ==========================================

function normalizeSignal(signal) {

    let maxValue = 0;

    for (const value of signal) {
        maxValue = Math.max(
            maxValue,
            Math.abs(value)
        );
    }

    if (maxValue === 0) {
        return signal.slice();
    }

    return signal.map(
        value => value / maxValue
    );
}


function calculateMSE(original, recovered) {

    const n = Math.min(
        original.length,
        recovered.length
    );

    if (n === 0) {
        return 0;
    }

    let sum = 0;

    for (let i = 0; i < n; i++) {

        const error =
            original[i] -
            recovered[i];

        sum += error * error;
    }

    return sum / n;
}


function calculateRMSE(original, recovered) {

    return Math.sqrt(
        calculateMSE(
            original,
            recovered
        )
    );
}


function calculateCorrelation(original, recovered) {

    const n = Math.min(
        original.length,
        recovered.length
    );

    if (n === 0) {
        return 0;
    }

    let sumOriginal = 0;
    let sumRecovered = 0;

    for (let i = 0; i < n; i++) {
        sumOriginal += original[i];
        sumRecovered += recovered[i];
    }

    const meanOriginal =
        sumOriginal / n;

    const meanRecovered =
        sumRecovered / n;

    let numerator = 0;
    let denominatorOriginal = 0;
    let denominatorRecovered = 0;

    for (let i = 0; i < n; i++) {

        const x =
            original[i] -
            meanOriginal;

        const y =
            recovered[i] -
            meanRecovered;

        numerator += x * y;

        denominatorOriginal += x * x;
        denominatorRecovered += y * y;
    }

    const denominator =
        Math.sqrt(
            denominatorOriginal *
            denominatorRecovered
        );

    if (denominator === 0) {
        return 0;
    }

    return numerator / denominator;
}


// ==========================================
// SEEDED RANDOM GENERATOR
// ==========================================

let randomSeed = 42;


function seededRandom() {

    randomSeed =
        (
            randomSeed * 1664525 +
            1013904223
        ) %
        4294967296;

    return randomSeed / 4294967296;
}


function gaussianRandom() {

    let u1 = seededRandom();
    let u2 = seededRandom();

    if (u1 <= 0) {
        u1 = 0.000001;
    }

    return Math.sqrt(
        -2 * Math.log(u1)
    ) *
    Math.cos(
        2 * Math.PI * u2
    );
}


// ==========================================
// AWGN NOISE
// ==========================================

function addNoise(signal, snrDb) {

    let signalPower = 0;

    for (const value of signal) {
        signalPower += value * value;
    }

    signalPower /=
        signal.length;

    const snrLinear =
        Math.pow(
            10,
            snrDb / 10
        );

    const noisePower =
        signalPower /
        snrLinear;

    const noiseStd =
        Math.sqrt(noisePower);

    const noisySignal = [];

    for (
        let i = 0;
        i < signal.length;
        i++
    ) {

        noisySignal.push(
            signal[i] +
            gaussianRandom() *
            noiseStd
        );
    }

    return noisySignal;
}


// ==========================================
// MOVING AVERAGE LOW-PASS FILTER
// ==========================================

function movingAverage(
    signal,
    windowSize
) {

    const output =
        new Array(
            signal.length
        ).fill(0);

    let sum = 0;

    for (
        let i = 0;
        i < signal.length;
        i++
    ) {

        sum += signal[i];

        if (i >= windowSize) {
            sum -=
                signal[i - windowSize];
        }

        output[i] =
            sum /
            Math.min(
                i + 1,
                windowSize
            );
    }

    return output;
}


// ==========================================
// AM DEMODULATION
// ==========================================

function demodulateAM(
    amSignal,
    carrierFrequency
) {

    const mixed = [];

    for (
        let i = 0;
        i < amSignal.length;
        i++
    ) {

        const t =
            i / SAMPLE_RATE;

        const carrier =
            Math.cos(
                2 * Math.PI *
                carrierFrequency *
                t
            );

        mixed.push(
            2 *
            amSignal[i] *
            carrier
        );
    }

    const filtered =
        movingAverage(
            mixed,
            20
        );

    return normalizeSignal(
        filtered
    );
}


// ==========================================
// FM DEMODULATION
// ==========================================

function demodulateFM(
    fmSignal,
    carrierFrequency
) {

    const phase = [];

    for (
        let i = 0;
        i < fmSignal.length;
        i++
    ) {

        const value =
            Math.max(
                -1,
                Math.min(
                    1,
                    fmSignal[i]
                )
            );

        phase.push(
            Math.acos(value)
        );
    }


    // Resolve phase direction
    for (
        let i = 1;
        i < phase.length - 1;
        i++
    ) {

        const slope =
            fmSignal[i + 1] -
            fmSignal[i - 1];

        if (slope > 0) {

            phase[i] =
                2 * Math.PI -
                phase[i];
        }
    }


    // Phase unwrapping
    const unwrapped =
        new Array(
            phase.length
        ).fill(0);

    unwrapped[0] =
        phase[0];


    for (
        let i = 1;
        i < phase.length;
        i++
    ) {

        let difference =
            phase[i] -
            phase[i - 1];

        while (
            difference > Math.PI
        ) {

            phase[i] -=
                2 * Math.PI;

            difference =
                phase[i] -
                phase[i - 1];
        }

        while (
            difference < -Math.PI
        ) {

            phase[i] +=
                2 * Math.PI;

            difference =
                phase[i] -
                phase[i - 1];
        }

        unwrapped[i] =
            phase[i];
    }


    // Differentiate phase
    const instantaneousFrequency =
        new Array(
            fmSignal.length
        ).fill(0);

    for (
        let i = 1;
        i < fmSignal.length;
        i++
    ) {

        instantaneousFrequency[i] =
            (
                unwrapped[i] -
                unwrapped[i - 1]
            ) *
            SAMPLE_RATE /
            (2 * Math.PI);
    }


    // Remove carrier frequency
    const recovered =
        instantaneousFrequency.map(
            value =>
                value -
                carrierFrequency
        );


    const filtered =
        movingAverage(
            recovered,
            15
        );

    return normalizeSignal(
        filtered
    );
}


// ==========================================
// GENERATE MESSAGE
// ==========================================

function generateMessage(
    messageFrequency,
    time
) {

    return time.map(
        t =>
            Math.sin(
                2 * Math.PI *
                messageFrequency *
                t
            )
    );
}


// ==========================================
// GENERATE CARRIER
// ==========================================

function generateCarrier(
    carrierFrequency,
    time
) {

    return time.map(
        t =>
            Math.cos(
                2 * Math.PI *
                carrierFrequency *
                t
            )
    );
}


// ==========================================
// GENERATE AM DATA
// ==========================================

function generateAMData() {

    randomSeed = 42;

    const messageFrequency =
        Number(
            document.getElementById(
                "messageFrequency"
            ).value
        );

    const carrierFrequency =
        Number(
            document.getElementById(
                "carrierFrequency"
            ).value
        );

    const amIndex =
        Number(
            document.getElementById(
                "amIndex"
            ).value
        );

    const snr =
        Number(
            document.getElementById(
                "snr"
            ).value
        );


    const time = [];

    for (
        let i = 0;
        i < TOTAL_SAMPLES;
        i++
    ) {

        time.push(
            i / SAMPLE_RATE
        );
    }


    const message =
        generateMessage(
            messageFrequency,
            time
        );


    const carrier =
        generateCarrier(
            carrierFrequency,
            time
        );


    const amSignal = [];

    for (
        let i = 0;
        i < time.length;
        i++
    ) {

        amSignal.push(
            (
                1 +
                amIndex *
                message[i]
            ) *
            carrier[i]
        );
    }


    const noisyAM =
        addNoise(
            amSignal,
            snr
        );


    const demodulatedAM =
        demodulateAM(
            amSignal,
            carrierFrequency
        );


    const noisyDemodulatedAM =
        demodulateAM(
            noisyAM,
            carrierFrequency
        );


    const bandwidth =
        2 *
        messageFrequency;


    const mse =
        calculateMSE(
            message,
            demodulatedAM
        );


    const rmse =
        calculateRMSE(
            message,
            demodulatedAM
        );


    const correlation =
        calculateCorrelation(
            message,
            demodulatedAM
        );


    const noisyMSE =
        calculateMSE(
            message,
            noisyDemodulatedAM
        );


    const noisyRMSE =
        calculateRMSE(
            message,
            noisyDemodulatedAM
        );


    const noisyCorrelation =
        calculateCorrelation(
            message,
            noisyDemodulatedAM
        );


    window.amResults = {

        messageFrequency,
        carrierFrequency,
        amIndex,
        snr,
        bandwidth,

        time,
        message,
        carrier,
        amSignal,
        noisyAM,

        demodulatedAM,
        noisyDemodulatedAM,

        mse,
        rmse,
        correlation,

        noisyMSE,
        noisyRMSE,
        noisyCorrelation
    };
}


// ==========================================
// GENERATE FM DATA
// ==========================================

function generateFMData() {

    randomSeed = 42;

    const messageFrequency =
        Number(
            document.getElementById(
                "messageFrequency"
            ).value
        );

    const carrierFrequency =
        Number(
            document.getElementById(
                "carrierFrequency"
            ).value
        );

    const frequencyDeviation =
        Number(
            document.getElementById(
                "frequencyDeviation"
            ).value
        );

    const snr =
        Number(
            document.getElementById(
                "snr"
            ).value
        );


    const time = [];

    for (
        let i = 0;
        i < TOTAL_SAMPLES;
        i++
    ) {

        time.push(
            i / SAMPLE_RATE
        );
    }


    const message =
        generateMessage(
            messageFrequency,
            time
        );


    const carrier =
        generateCarrier(
            carrierFrequency,
            time
        );


    const fmSignal = [];

    let integral = 0;

    for (
        let i = 0;
        i < time.length;
        i++
    ) {

        integral +=
            message[i] /
            SAMPLE_RATE;


        const phase =
            2 * Math.PI *
            carrierFrequency *
            time[i]
            +
            2 * Math.PI *
            frequencyDeviation *
            integral;


        fmSignal.push(
            Math.cos(phase)
        );
    }


    const modulationIndex =
        frequencyDeviation /
        messageFrequency;


    const bandwidth =
        2 *
        (
            frequencyDeviation +
            messageFrequency
        );


    const noisyFM =
        addNoise(
            fmSignal,
            snr
        );


    const demodulatedFM =
        demodulateFM(
            fmSignal,
            carrierFrequency
        );


    const noisyDemodulatedFM =
        demodulateFM(
            noisyFM,
            carrierFrequency
        );


    const mse =
        calculateMSE(
            message,
            demodulatedFM
        );


    const rmse =
        calculateRMSE(
            message,
            demodulatedFM
        );


    const correlation =
        calculateCorrelation(
            message,
            demodulatedFM
        );


    const noisyMSE =
        calculateMSE(
            message,
            noisyDemodulatedFM
        );


    const noisyRMSE =
        calculateRMSE(
            message,
            noisyDemodulatedFM
        );


    const noisyCorrelation =
        calculateCorrelation(
            message,
            noisyDemodulatedFM
        );


    window.fmResults = {

        messageFrequency,
        carrierFrequency,
        frequencyDeviation,
        modulationIndex,
        snr,
        bandwidth,

        time,
        message,
        carrier,
        fmSignal,
        noisyFM,

        demodulatedFM,
        noisyDemodulatedFM,

        mse,
        rmse,
        correlation,

        noisyMSE,
        noisyRMSE,
        noisyCorrelation
    };
}


// ==========================================
// DRAW AM GRAPHS
// ==========================================

function drawAMGraphs() {

    const am =
        window.amResults;


    drawGraph(
        "messageGraph",
        am.time,
        am.message
    );


    drawGraph(
        "amGraph",
        am.time,
        am.amSignal
    );


    drawGraph(
        "amNoiseGraph",
        am.time,
        am.noisyAM
    );


    drawGraph(
        "amDemodulatedGraph",
        am.time,
        am.demodulatedAM
    );


    drawGraph(
        "amNoisyDemodulatedGraph",
        am.time,
        am.noisyDemodulatedAM
    );
}


// ==========================================
// DRAW FM GRAPHS
// ==========================================

function drawFMGraphs() {

    const fm =
        window.fmResults;


    drawGraph(
        "fmMessageGraph",
        fm.time,
        fm.message
    );


    drawGraph(
        "fmGraph",
        fm.time,
        fm.fmSignal
    );


    drawGraph(
        "fmNoiseGraph",
        fm.time,
        fm.noisyFM
    );


    drawGraph(
        "fmDemodulatedGraph",
        fm.time,
        fm.demodulatedFM
    );


    drawGraph(
        "fmNoisyDemodulatedGraph",
        fm.time,
        fm.noisyDemodulatedFM
    );
}


// ==========================================
// RUN AM
// ==========================================

function runAM() {

    document.getElementById(
        "amSection"
    ).style.display = "block";

    document.getElementById(
        "fmSection"
    ).style.display = "none";

    document.getElementById(
        "comparisonSection"
    ).style.display = "none";


    generateAMData();

    drawAMGraphs();

    displayAMResults(
        window.amResults
    );
}


// ==========================================
// RUN FM
// ==========================================

function runFM() {

    document.getElementById(
        "amSection"
    ).style.display = "none";

    document.getElementById(
        "fmSection"
    ).style.display = "block";

    document.getElementById(
        "comparisonSection"
    ).style.display = "none";


    generateFMData();

    drawFMGraphs();

    displayFMResults(
        window.fmResults
    );
}


// ==========================================
// RUN BOTH
// ==========================================

function runBoth() {

    document.getElementById(
        "amSection"
    ).style.display = "none";

    document.getElementById(
        "fmSection"
    ).style.display = "none";

    document.getElementById(
        "comparisonSection"
    ).style.display = "block";


    generateAMData();

    generateFMData();


    drawComparisonGraphs();

    displayCombinedResults();
}


// ==========================================
// AM RESULTS
// ==========================================

function displayAMResults(data) {

    document.getElementById(
        "results"
    ).innerHTML = `

        <h2>📡 AM Signal Analysis</h2>

        <div class="result-grid">

            <div class="result-card">
                <span>Message Frequency</span>
                <strong>
                    ${data.messageFrequency} Hz
                </strong>
            </div>

            <div class="result-card">
                <span>Carrier Frequency</span>
                <strong>
                    ${data.carrierFrequency} Hz
                </strong>
            </div>

            <div class="result-card">
                <span>AM Modulation Index</span>
                <strong>
                    ${data.amIndex}
                </strong>
            </div>

            <div class="result-card">
                <span>AM Bandwidth</span>
                <strong>
                    ${data.bandwidth} Hz
                </strong>
            </div>

            <div class="result-card">
                <span>MSE</span>
                <strong>
                    ${data.mse.toFixed(6)}
                </strong>
            </div>

            <div class="result-card">
                <span>RMSE</span>
                <strong>
                    ${data.rmse.toFixed(6)}
                </strong>
            </div>

            <div class="result-card">
                <span>Correlation</span>
                <strong>
                    ${data.correlation.toFixed(6)}
                </strong>
            </div>

            <div class="result-card">
                <span>Noisy Correlation</span>
                <strong>
                    ${data.noisyCorrelation.toFixed(6)}
                </strong>
            </div>

        </div>
    `;
}


// ==========================================
// FM RESULTS
// ==========================================

function displayFMResults(data) {

    document.getElementById(
        "results"
    ).innerHTML = `

        <h2>📻 FM Signal Analysis</h2>

        <div class="result-grid">

            <div class="result-card">
                <span>Message Frequency</span>
                <strong>
                    ${data.messageFrequency} Hz
                </strong>
            </div>

            <div class="result-card">
                <span>Carrier Frequency</span>
                <strong>
                    ${data.carrierFrequency} Hz
                </strong>
            </div>

            <div class="result-card">
                <span>Frequency Deviation</span>
                <strong>
                    ${data.frequencyDeviation} Hz
                </strong>
            </div>

            <div class="result-card">
                <span>FM Modulation Index</span>
                <strong>
                    ${data.modulationIndex.toFixed(2)}
                </strong>
            </div>

            <div class="result-card">
                <span>FM Bandwidth</span>
                <strong>
                    ${data.bandwidth} Hz
                </strong>
            </div>

            <div class="result-card">
                <span>MSE</span>
                <strong>
                    ${data.mse.toFixed(6)}
                </strong>
            </div>

            <div class="result-card">
                <span>RMSE</span>
                <strong>
                    ${data.rmse.toFixed(6)}
                </strong>
            </div>

            <div class="result-card">
                <span>Correlation</span>
                <strong>
                    ${data.correlation.toFixed(6)}
                </strong>
            </div>

            <div class="result-card">
                <span>Noisy Correlation</span>
                <strong>
                    ${data.noisyCorrelation.toFixed(6)}
                </strong>
            </div>

        </div>
    `;
}


// ==========================================
// COMBINED ANALYSIS
// ==========================================

function displayCombinedResults() {

    const am =
        window.amResults;

    const fm =
        window.fmResults;


    const amNoiseChange =
        am.noisyCorrelation -
        am.correlation;

    const fmNoiseChange =
        fm.noisyCorrelation -
        fm.correlation;


    const conclusion =
        fm.correlation >
        am.correlation
            ? "FM shows better signal recovery based on correlation."
            : "AM shows better signal recovery based on correlation.";


    // Dynamic winner card

    const finalResult =
        document.getElementById(
            "finalResult"
        );

    const finalResultText =
        document.getElementById(
            "finalResultText"
        );


    if (
        finalResult &&
        finalResultText
    ) {

        if (
            fm.correlation >
            am.correlation
        ) {

            finalResult.className =
                "final-result fm-winner";

            finalResultText.innerHTML = `

                <strong>
                    FM wins this simulation.
                </strong>

                <br><br>

                FM shows better signal recovery
                based on correlation.

                <br><br>

                AM correlation:
                <strong>
                    ${am.correlation.toFixed(6)}
                </strong>

                <br>

                FM correlation:
                <strong>
                    ${fm.correlation.toFixed(6)}
                </strong>
            `;

        } else {

            finalResult.className =
                "final-result am-winner";

            finalResultText.innerHTML = `

                <strong>
                    AM wins this simulation.
                </strong>

                <br><br>

                AM shows better signal recovery
                based on correlation.

                <br><br>

                AM correlation:
                <strong>
                    ${am.correlation.toFixed(6)}
                </strong>

                <br>

                FM correlation:
                <strong>
                    ${fm.correlation.toFixed(6)}
                </strong>
            `;
        }
    }


    document.getElementById(
        "results"
    ).innerHTML = `

        <h2>📊 AM vs FM Comparison</h2>

        <div class="comparison-table">

            <table>

                <thead>
                    <tr>
                        <th>Parameter</th>
                        <th>AM</th>
                        <th>FM</th>
                    </tr>
                </thead>

                <tbody>

                    <tr>
                        <td>Modulation Index</td>
                        <td>
                            ${am.amIndex}
                        </td>
                        <td>
                            ${fm.modulationIndex.toFixed(2)}
                        </td>
                    </tr>

                    <tr>
                        <td>Bandwidth</td>
                        <td>
                            ${am.bandwidth} Hz
                        </td>
                        <td>
                            ${fm.bandwidth} Hz
                        </td>
                    </tr>

                    <tr>
                        <td>MSE</td>
                        <td>
                            ${am.mse.toFixed(6)}
                        </td>
                        <td>
                            ${fm.mse.toFixed(6)}
                        </td>
                    </tr>

                    <tr>
                        <td>RMSE</td>
                        <td>
                            ${am.rmse.toFixed(6)}
                        </td>
                        <td>
                            ${fm.rmse.toFixed(6)}
                        </td>
                    </tr>

                    <tr>
                        <td>Correlation</td>
                        <td>
                            ${am.correlation.toFixed(6)}
                        </td>
                        <td>
                            ${fm.correlation.toFixed(6)}
                        </td>
                    </tr>

                    <tr>
                        <td>Noisy Correlation</td>
                        <td>
                            ${am.noisyCorrelation.toFixed(6)}
                        </td>
                        <td>
                            ${fm.noisyCorrelation.toFixed(6)}
                        </td>
                    </tr>

                </tbody>

            </table>

        </div>

        <div class="comparison-message">

            <h3>🌧️ Noise Impact</h3>

            <p>
                AM correlation change:
                <strong>
                    ${amNoiseChange.toFixed(6)}
                </strong>
            </p>

            <p>
                FM correlation change:
                <strong>
                    ${fmNoiseChange.toFixed(6)}
                </strong>
            </p>

            <h3>
                🏆 Simulation Conclusion
            </h3>

            <p>
                ${conclusion}
            </p>

            <p>
                AM bandwidth:
                <strong>
                    ${am.bandwidth} Hz
                </strong>
            </p>

            <p>
                FM bandwidth:
                <strong>
                    ${fm.bandwidth} Hz
                </strong>
            </p>

            <p>
                AM correlation:
                <strong>
                    ${am.correlation.toFixed(6)}
                </strong>
            </p>

            <p>
                FM correlation:
                <strong>
                    ${fm.correlation.toFixed(6)}
                </strong>
            </p>

        </div>
    `;
}


// ==========================================
// COMPARISON GRAPHS
// ==========================================

function drawComparisonGraphs() {

    const am =
        window.amResults;

    const fm =
        window.fmResults;


    // Original vs recovered

    drawMultiGraph(
        "comparisonGraph",
        am.time,
        [
            {
                signal: am.message,
                label: "Original Message"
            },
            {
                signal: am.demodulatedAM,
                label: "AM Demodulated"
            },
            {
                signal: fm.demodulatedFM,
                label: "FM Demodulated"
            }
        ]
    );


    // Noisy recovered signals

    drawMultiGraph(
        "fmComparisonGraph",
        am.time,
        [
            {
                signal: am.message,
                label: "Original Message"
            },
            {
                signal: am.noisyDemodulatedAM,
                label: "Noisy AM Demodulated"
            },
            {
                signal: fm.noisyDemodulatedFM,
                label: "Noisy FM Demodulated"
            }
        ]
    );


    // MSE

    drawMetricGraph(
        "mseComparisonGraph",
        am.mse,
        fm.mse
    );


    // RMSE

    drawMetricGraph(
        "rmseComparisonGraph",
        am.rmse,
        fm.rmse
    );


    // Correlation

    drawMetricGraph(
        "correlationComparisonGraph",
        am.correlation,
        fm.correlation
    );


    // Noise impact

    drawMetricGraph(
        "noiseImpactGraph",
        Math.abs(
            am.noisyCorrelation -
            am.correlation
        ),
        Math.abs(
            fm.noisyCorrelation -
            fm.correlation
        )
    );
}


// ==========================================
// DRAW NORMAL GRAPH
// ==========================================

function drawGraph(
    canvasId,
    time,
    signal
) {

    const canvas =
        document.getElementById(
            canvasId
        );

    if (!canvas) {
        return;
    }


    const ctx =
        canvas.getContext(
            "2d"
        );


    canvas.width =
        canvas.clientWidth || 900;

    canvas.height = 300;


    ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    );


    let minValue =
        Math.min(...signal);

    let maxValue =
        Math.max(...signal);


    if (
        maxValue === minValue
    ) {

        maxValue += 1;
        minValue -= 1;
    }


    // --------------------------------------
    // Layout
    // --------------------------------------

    const paddingLeft = 55;
    const paddingRight = 20;

    const plotTop = 20;
    const plotBottom = 245;

    const plotWidth =
        canvas.width -
        paddingLeft -
        paddingRight;

    const plotHeight =
        plotBottom -
        plotTop;


    // --------------------------------------
    // Background
    // --------------------------------------

    ctx.fillStyle =
        "#efefd7fb";

    ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
    );


    // --------------------------------------
    // Border
    // --------------------------------------

    ctx.strokeStyle =
        "#0a0a0a";

    ctx.strokeRect(
        paddingLeft,
        plotTop,
        plotWidth,
        plotHeight
    );


    // --------------------------------------
    // Waveform
    // --------------------------------------

    ctx.strokeStyle =
        "#2563eb";

    ctx.lineWidth = 1;

    ctx.beginPath();


    const step =
        Math.max(
            1,
            Math.floor(
                signal.length /
                plotWidth
            )
        );


    let firstPoint = true;


    for (
        let i = 0;
        i < signal.length;
        i += step
    ) {

        const x =
            paddingLeft +
            (
                i /
                (signal.length - 1)
            ) *
            plotWidth;


        const normalized =
            (
                signal[i] -
                minValue
            ) /
            (
                maxValue -
                minValue
            );


        const y =
            plotBottom -
            normalized *
            plotHeight;


        if (firstPoint) {

            ctx.moveTo(
                x,
                y
            );

            firstPoint = false;

        } else {

            ctx.lineTo(
                x,
                y
            );
        }
    }


    ctx.stroke();


    // --------------------------------------
    // X-axis tick values
    // --------------------------------------

    const timeLabels = [
        0,
        2,
        4,
        6,
        8,
        10
    ];


    ctx.fillStyle =
        "#4b5563";

    ctx.font =
        "11px Arial";

    ctx.textAlign =
        "center";


    timeLabels.forEach(
        value => {

            const x =
                paddingLeft +
                (
                    value / 10
                ) *
                plotWidth;


            ctx.fillText(
                value.toString(),
                x,
                265
            );
        }
    );


    // --------------------------------------
    // X-axis title
    // --------------------------------------

    ctx.font =
        "12px Arial";

    ctx.fillStyle =
        "#374151";

    ctx.fillText(
        "Time (ms)",
        canvas.width / 2,
        289
    );


    // --------------------------------------
    // Y-axis title
    // --------------------------------------

    ctx.save();

    ctx.translate(
        15,
        (
            plotTop +
            plotBottom
        ) / 2
    );

    ctx.rotate(
        -Math.PI / 2
    );

    ctx.textAlign =
        "center";

    ctx.fillText(
        "Amplitude",
        0,
        0
    );

    ctx.restore();


    ctx.textAlign =
        "left";

    ctx.lineWidth = 1;
}


// ==========================================
// DRAW MULTI-SIGNAL COMPARISON GRAPH
// ==========================================

function drawMultiGraph(
    canvasId,
    time,
    datasets
) {

    const canvas =
        document.getElementById(
            canvasId
        );

    if (!canvas) {
        return;
    }


    const ctx =
        canvas.getContext(
            "2d"
        );


    canvas.width =
        canvas.clientWidth || 900;

    canvas.height = 300;


    ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    );


    // --------------------------------------
    // Find common signal limits
    // --------------------------------------

    let minValue =
        Infinity;

    let maxValue =
        -Infinity;


    datasets.forEach(
        dataset => {

            dataset.signal.forEach(
                value => {

                    minValue =
                        Math.min(
                            minValue,
                            value
                        );

                    maxValue =
                        Math.max(
                            maxValue,
                            value
                        );
                }
            );
        }
    );


    if (
        maxValue === minValue
    ) {

        maxValue += 1;
        minValue -= 1;
    }


    // --------------------------------------
    // Layout
    // --------------------------------------

    const paddingLeft = 55;
    const paddingRight = 20;

    const plotTop = 40;
    const plotBottom = 235;

    const plotWidth =
        canvas.width -
        paddingLeft -
        paddingRight;

    const plotHeight =
        plotBottom -
        plotTop;


    // --------------------------------------
    // Background
    // --------------------------------------

    ctx.fillStyle =
        "#efefd7fb";

    ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
    );


    // --------------------------------------
    // Border
    // --------------------------------------

    ctx.strokeStyle =
        "#0a0a0a";

    ctx.strokeRect(
        paddingLeft,
        plotTop,
        plotWidth,
        plotHeight
    );


    // --------------------------------------
    // Signal colors
    // --------------------------------------

    const colors = [
        "#2563eb",
        "#dc2626",
        "#059669"
    ];


    // --------------------------------------
    // Draw signals
    // --------------------------------------

    datasets.forEach(
        (
            dataset,
            index
        ) => {

            const signal =
                dataset.signal;


            ctx.strokeStyle =
                colors[
                    index %
                    colors.length
                ];

            ctx.lineWidth = 1.5;

            ctx.beginPath();


            const step =
                Math.max(
                    1,
                    Math.floor(
                        signal.length /
                        plotWidth
                    )
                );


            let firstPoint = true;


            for (
                let i = 0;
                i < signal.length;
                i += step
            ) {

                const x =
                    paddingLeft +
                    (
                        i /
                        (signal.length - 1)
                    ) *
                    plotWidth;


                const normalized =
                    (
                        signal[i] -
                        minValue
                    ) /
                    (
                        maxValue -
                        minValue
                    );


                const y =
                    plotBottom -
                    normalized *
                    plotHeight;


                if (firstPoint) {

                    ctx.moveTo(
                        x,
                        y
                    );

                    firstPoint = false;

                } else {

                    ctx.lineTo(
                        x,
                        y
                    );
                }
            }


            ctx.stroke();
        }
    );


    // --------------------------------------
    // Legend
    // --------------------------------------

    const legendStartX =
        paddingLeft;

    const legendY = 17;


    ctx.font =
        "11px Arial";


    datasets.forEach(
        (
            dataset,
            index
        ) => {

            const itemX =
                legendStartX +
                index * 210;


            ctx.strokeStyle =
                colors[
                    index %
                    colors.length
                ];

            ctx.lineWidth = 3;


            ctx.beginPath();

            ctx.moveTo(
                itemX,
                legendY
            );

            ctx.lineTo(
                itemX + 16,
                legendY
            );

            ctx.stroke();


            ctx.fillStyle =
                "#374151";

            ctx.textAlign =
                "left";

            ctx.fillText(
                dataset.label,
                itemX + 22,
                legendY + 4
            );
        }
    );


    // --------------------------------------
    // Time tick labels
    // --------------------------------------

    const timeLabels = [
        0,
        2,
        4,
        6,
        8,
        10
    ];


    ctx.font =
        "11px Arial";

    ctx.fillStyle =
        "#4b5563";

    ctx.textAlign =
        "center";


    timeLabels.forEach(
        value => {

            const x =
                paddingLeft +
                (
                    value / 10
                ) *
                plotWidth;


            ctx.fillText(
                value.toString(),
                x,
                258
            );
        }
    );


    // --------------------------------------
    // X-axis title
    // --------------------------------------

    ctx.font =
        "12px Arial";

    ctx.fillStyle =
        "#374151";

    ctx.fillText(
        "Time (ms)",
        canvas.width / 2,
        290
    );


    // --------------------------------------
    // Y-axis title
    // --------------------------------------

    ctx.save();

    ctx.translate(
        15,
        (
            plotTop +
            plotBottom
        ) / 2
    );

    ctx.rotate(
        -Math.PI / 2
    );

    ctx.textAlign =
        "center";

    ctx.fillText(
        "Amplitude",
        0,
        0
    );

    ctx.restore();


    ctx.textAlign =
        "left";

    ctx.lineWidth = 1;
}


// ==========================================
// DRAW METRIC GRAPH
// ==========================================

function drawMetricGraph(
    canvasId,
    amValue,
    fmValue
) {

    const canvas =
        document.getElementById(
            canvasId
        );

    if (!canvas) {
        return;
    }


    const ctx =
        canvas.getContext(
            "2d"
        );


    canvas.width =
        canvas.clientWidth || 900;

    canvas.height = 300;


    ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    );


    // --------------------------------------
    // Layout
    // --------------------------------------

    const padding = 45;

    const labelY = 48;

    const chartTop = 70;

    const chartBottom = 225;

    const chartHeight =
        chartBottom -
        chartTop;


    // --------------------------------------
    // Background
    // --------------------------------------

    ctx.fillStyle =
        "#efefd7fb";

    ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
    );


    // --------------------------------------
    // Border
    // --------------------------------------

    ctx.strokeStyle =
        "#0a0a0a";

    ctx.strokeRect(
        padding,
        30,
        canvas.width -
        2 * padding,
        215
    );


    // --------------------------------------
    // Scale
    // --------------------------------------

    const maxValue =
        Math.max(
            Math.abs(amValue),
            Math.abs(fmValue),
            0.000001
        );


    // --------------------------------------
    // Bar positions
    // --------------------------------------

    const barWidth = 110;

    const amX =
        canvas.width / 2 - 150;

    const fmX =
        canvas.width / 2 + 40;


    const amHeight =
        (
            Math.abs(amValue) /
            maxValue
        ) *
        chartHeight;


    const fmHeight =
        (
            Math.abs(fmValue) /
            maxValue
        ) *
        chartHeight;


    // --------------------------------------
    // AM bar - light purple
    // --------------------------------------

    ctx.fillStyle =
        "#e62222";

    ctx.fillRect(
        amX,
        chartBottom - amHeight,
        barWidth,
        amHeight
    );


    // --------------------------------------
    // FM bar - light green
    // --------------------------------------

    ctx.fillStyle =
        "#6a0773";

    ctx.fillRect(
        fmX,
        chartBottom - fmHeight,
        barWidth,
        fmHeight
    );


    // --------------------------------------
    // Values above bars
    // --------------------------------------

    ctx.textAlign =
        "center";

    ctx.font =
        "bold 13px Arial";


    ctx.fillStyle =
        "#7c3aed";

    ctx.fillText(
        amValue.toFixed(6),
        amX + barWidth / 2,
        labelY
    );


    ctx.fillStyle =
        "#15803d";

    ctx.fillText(
        fmValue.toFixed(6),
        fmX + barWidth / 2,
        labelY
    );


    // --------------------------------------
    // AM / FM labels
    // --------------------------------------

    ctx.font =
        "bold 14px Arial";

    ctx.fillStyle =
        "#111827";


    ctx.fillText(
    "AM",
    amX + barWidth / 2,
    chartBottom + 38
);


    ctx.fillText(
    "FM",
    fmX + barWidth / 2,
    chartBottom + 38
);


    ctx.textAlign =
        "left";
}
// ==========================================
// RESET PARAMETERS TO DEFAULT VALUES
// ==========================================

function resetParameters() {

    document.getElementById("messageFrequency").value = 1000;

    document.getElementById("carrierFrequency").value = 10000;

    document.getElementById("amIndex").value = 0.5;

    document.getElementById("frequencyDeviation").value = 2000;

    document.getElementById("snr").value = 20;
}
function clearAll() {

    // Clear all input fields
    document.querySelectorAll("input").forEach(input => {
        input.value = "";
    });

    // Clear results
    const results = document.getElementById("results");

    if (results) {
        results.innerHTML = "";
    }

    // Clear all canvas graphs
    document.querySelectorAll("canvas").forEach(canvas => {

        const ctx = canvas.getContext("2d");

        ctx.clearRect(
            0,
            0,
            canvas.width,
            canvas.height
        );
    });
}