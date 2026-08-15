import numpy as np


def am_modulate(
    message,
    carrier_amplitude,
    carrier_frequency,
    modulation_index,
    time
):
    """
    Perform conventional AM modulation.

    s(t) = Ac * [1 + mu*m(t)] * cos(2*pi*fc*t)

    The message should preferably be normalized
    to approximately [-1, 1].
    """

    carrier = np.cos(
        2 * np.pi * carrier_frequency * time
    )

    am_signal = (
        carrier_amplitude
        * (1 + modulation_index * message)
        * carrier
    )

    return am_signal
