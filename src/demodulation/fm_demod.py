import numpy as np

from scipy.signal import hilbert

from .am_demod import lowpass_filter


def fm_demodulate(
    fm_signal,
    message_frequency,
    sampling_frequency
):
    analytic_signal = hilbert(
        fm_signal
    )

    phase = np.unwrap(
        np.angle(analytic_signal)
    )

    instantaneous_frequency = (
        np.diff(phase)
        * sampling_frequency
        / (2 * np.pi)
    )

    instantaneous_frequency = np.concatenate(
        (
            [instantaneous_frequency[0]],
            instantaneous_frequency
        )
    )

    recovered = (
        instantaneous_frequency
        - np.mean(instantaneous_frequency)
    )

    recovered = lowpass_filter(
        recovered,
        cutoff_frequency=1.5 * message_frequency,
        sampling_frequency=sampling_frequency
    )

    max_value = np.max(
        np.abs(recovered)
    )

    if max_value > 0:
        recovered /= max_value

    return recovered
