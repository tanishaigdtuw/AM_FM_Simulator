import numpy as np


def validate_signal(signal, *, expected_len=None):
    """Validate that a signal is a one-dimensional numeric array."""
    if not isinstance(signal, np.ndarray):
        signal = np.asarray(signal)

    if signal.ndim != 1:
        raise ValueError("Signal must be a one-dimensional array")

    if expected_len is not None and len(signal) != expected_len:
        raise ValueError(f"Signal length must be {expected_len}, got {len(signal)}")

    if not np.issubdtype(signal.dtype, np.number):
        raise TypeError("Signal must contain numeric values")

    return signal


def validate_am_modulation_index(mu):
    if mu < 0:
        raise ValueError("AM modulation index cannot be negative.")

    if mu > 1:
        return "overmodulation"

    return "normal"
