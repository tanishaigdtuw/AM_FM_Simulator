import numpy as np


def generate_carrier(amplitude, frequency, time):
    """
    Generate a sinusoidal carrier signal.
    """

    return amplitude * np.cos(
        2 * np.pi * frequency * time
    )

    import numpy as np


def generate_carrier(amplitude, frequency, time):
    """
    Generate a sinusoidal carrier signal.

    Parameters:
        amplitude: Carrier amplitude
        frequency: Carrier frequency in Hz
        time: Time array

    Returns:
        Generated carrier signal
    """

    carrier = amplitude * np.cos(
        2 * np.pi * frequency * time
    )

    return carrier
