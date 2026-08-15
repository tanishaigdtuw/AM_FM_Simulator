import numpy as np

from src.signals.message import generate_message
from src.signals.carrier import generate_carrier


def test_message_signal():
    time = np.linspace(0, 1e-3, 1000)

    signal = generate_message(
        amplitude=1,
        frequency=1000,
        time=time
    )

    assert len(signal) == len(time)
    assert np.max(signal) <= 1.0 + 1e-10


def test_carrier_signal():
    time = np.linspace(0, 1e-3, 1000)

    signal = generate_carrier(
        amplitude=1,
        frequency=10000,
        time=time
    )

    assert len(signal) == len(time)
    assert np.max(signal) <= 1.0 + 1e-10
