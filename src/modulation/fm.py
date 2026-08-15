import numpy as np


def fm_modulate(
    message,
    carrier_amplitude,
    carrier_frequency,
    frequency_deviation,
    time
):
    dt = time[1] - time[0]

    integral_message = np.cumsum(message) * dt

    phase = (
        2 * np.pi * carrier_frequency * time
        +
        2 * np.pi
        * frequency_deviation
        * integral_message
    )

    return carrier_amplitude * np.cos(phase)
