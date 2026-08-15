import numpy as np


def calculate_fft(signal, sampling_frequency):

    n = len(signal)

    spectrum = np.fft.rfft(signal)

    frequencies = np.fft.rfftfreq(
        n,
        d=1 / sampling_frequency
    )

    magnitude = (
        2 / n
    ) * np.abs(spectrum)

    return frequencies, magnitude