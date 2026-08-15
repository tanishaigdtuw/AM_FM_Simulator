import numpy as np


def generate_am_signal(
    message,
    carrier_amplitude,
    modulation_index,
    carrier_frequency,
    time
):
    """
    Generate a conventional AM signal.

    Parameters:
        message: Message signal
        carrier_amplitude: Carrier amplitude
        modulation_index: AM modulation index
        carrier_frequency: Carrier frequency in Hz
        time: Time array

    Returns:
        AM modulated signal
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
    