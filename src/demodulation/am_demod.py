import numpy as np
from scipy.signal import butter, filtfilt


def lowpass_filter(
    signal,
    cutoff_frequency,
    sampling_frequency,
    order=5
):
    nyquist = 0.5 * sampling_frequency

    normalized_cutoff = (
        cutoff_frequency / nyquist
    )

    b, a = butter(
        order,
        normalized_cutoff,
        btype="low"
    )

    return filtfilt(
        b,
        a,
        signal
    )


def am_demodulate(
    am_signal,
    message_frequency,
    sampling_frequency
):
    envelope = np.abs(am_signal)

    recovered = lowpass_filter(
        envelope,
        cutoff_frequency=1.5 * message_frequency,
        sampling_frequency=sampling_frequency
    )

    recovered = recovered - np.mean(recovered)

    max_value = np.max(
        np.abs(recovered)
    )

    if max_value > 0:
        recovered = recovered / max_value

    return recovered
