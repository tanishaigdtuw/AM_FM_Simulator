function runAM() {

    const messageFrequency =
        Number(document.getElementById("messageFrequency").value);

    const carrierFrequency =
        Number(document.getElementById("carrierFrequency").value);

    const amIndex =
        Number(document.getElementById("amIndex").value);

    const snr =
        Number(document.getElementById("snr").value);


    // Simulation settings
    const sampleRate = 100000;
    const duration = 0.01;

    const totalSamples = sampleRate * duration;

    const time = [];

    const message = [];
    const amSignal = [];


    // Generate signals
    for (let i = 0; i < totalSamples; i++) {

        const t = i / sampleRate;

        time.push(t);

        const messageValue =
            Math.sin(
                2 * Math.PI *
                messageFrequency *
                t
            );

        const amValue =
            (1 + amIndex * messageValue) *
            Math.cos(
                2 * Math.PI *
                carrierFrequency *
                t
            );

        message.push(messageValue);
        amSignal.push(amValue);
    }


    // Display analysis
    document.getElementById("results").innerHTML = `
        <h3>AM Simulation</h3>

        <p>
            Message Frequency:
            <strong>${messageFrequency} Hz</strong>
        </p>

        <p>
            Carrier Frequency:
            <strong>${carrierFrequency} Hz</strong>
        </p>

        <p>
            AM Modulation Index:
            <strong>${amIndex}</strong>
        </p>

        <p>
            SNR:
            <strong>${snr} dB</strong>
        </p>

        <p>
            AM Bandwidth:
            <strong>${2 * messageFrequency} Hz</strong>
        </p>
    `;


    // Draw message graph
    drawGraph(
        "messageGraph",
        time,
        message,
        "Message Signal"
    );


    // Draw AM graph
    drawGraph(
        "amGraph",
        time,
        amSignal,
        "AM Modulated Signal"
    );

}

function runFM() {

    const messageFrequency =
        Number(document.getElementById("messageFrequency").value);

    const carrierFrequency =
        Number(document.getElementById("carrierFrequency").value);

    const frequencyDeviation =
        Number(
            document.getElementById("frequencyDeviation").value
        );

    const snr =
        Number(document.getElementById("snr").value);


    // Simulation settings
    const sampleRate = 100000;
    const duration = 0.01;
    const totalSamples = sampleRate * duration;

    const time = [];
    const message = [];
    const fmSignal = [];

    let integral = 0;


    // Generate FM signal
    for (let i = 0; i < totalSamples; i++) {

        const t = i / sampleRate;

        const messageValue =
            Math.sin(
                2 * Math.PI *
                messageFrequency *
                t
            );

        integral += messageValue / sampleRate;

        const phase =
            2 * Math.PI *
            carrierFrequency *
            t
            +
            2 * Math.PI *
            frequencyDeviation *
            integral;

        const fmValue =
            Math.cos(phase);

        time.push(t);
        message.push(messageValue);
        fmSignal.push(fmValue);
    }


    // FM modulation index
    const modulationIndex =
        frequencyDeviation /
        messageFrequency;

    // Carson's rule
    const bandwidth =
        2 *
        (
            frequencyDeviation +
            messageFrequency
        );


    // Display results
    document.getElementById("results").innerHTML = `
        <h3>FM Simulation</h3>

        <p>
            Message Frequency:
            <strong>${messageFrequency} Hz</strong>
        </p>

        <p>
            Carrier Frequency:
            <strong>${carrierFrequency} Hz</strong>
        </p>

        <p>
            Frequency Deviation:
            <strong>${frequencyDeviation} Hz</strong>
        </p>

        <p>
            FM Modulation Index:
            <strong>${modulationIndex.toFixed(2)}</strong>
        </p>

        <p>
            SNR:
            <strong>${snr} dB</strong>
        </p>

        <p>
            FM Bandwidth:
            <strong>${bandwidth} Hz</strong>
        </p>
    `;


    // Draw message
    drawGraph(
        "messageGraph",
        time,
        message,
        "Message Signal - FM"
    );


    // Draw FM
    drawGraph(
        "fmGraph",
        time,
        fmSignal,
        "FM Modulated Signal"
    );
}

function runBoth() {

    runAM();

    setTimeout(() => {
        runFM();
    }, 100);
}


// Draw a signal on a canvas
function drawGraph(
    canvasId,
    time,
    signal,
    title
) {

    const canvas =
        document.getElementById(canvasId);

    const ctx =
        canvas.getContext("2d");


    canvas.width =
        canvas.clientWidth;

    canvas.height = 300;


    ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    );


    // Find signal limits
    let minValue =
        Math.min(...signal);

    let maxValue =
        Math.max(...signal);


    const padding = 40;


    // Title
    ctx.font = "18px Arial";

    ctx.fillText(
        title,
        padding,
        25
    );


    // Draw waveform
    ctx.beginPath();


    for (
        let i = 0;
        i < signal.length;
        i++
    ) {

        const x =
            padding +
            (i / (signal.length - 1)) *
            (canvas.width - 2 * padding);


        const normalized =
            (signal[i] - minValue) /
            (maxValue - minValue);


        const y =
            canvas.height -
            padding -
            normalized *
            (canvas.height - 2 * padding);


        if (i === 0) {
            ctx.moveTo(x, y);
        }
        else {
            ctx.lineTo(x, y);
        }
    }


    ctx.stroke();


    // Border
    ctx.strokeRect(
        padding,
        40,
        canvas.width - 2 * padding,
        canvas.height - 70
    );
}