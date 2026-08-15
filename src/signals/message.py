import numpy as np


def generate_message(amplitude, frequency, time):
    """
    Generate a sinusoidal message signal.

    Parameters:
        amplitude: Amplitude of the message signal
        frequency: Frequency of the message signal in Hz
        time: Time array

    Returns:
        Generated message signal
    """

    message = amplitude * np.cos(
        2 * np.pi * frequency * time
    )

    return message
