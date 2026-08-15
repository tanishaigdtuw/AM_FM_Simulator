import numpy as np

from src.modulation.am import am_modulate


def test_am_modulation_shape_and_range():
    time = np.linspace(0, 1e-3, 1000)
    message = np.cos(2 * np.pi * 1000 * time)

    signal = am_modulate(
        message=message,
        carrier_amplitude=1.0,
        carrier_frequency=10000,
        modulation_index=0.5,
        time=time,
    )

    assert signal.shape == message.shape
    assert np.max(signal) <= 1.5 + 1e-10
    assert np.min(signal) >= -1.5 - 1e-10
