import numpy as np

from src.signals.message import generate_message
from src.signals.carrier import generate_carrier
from src.visualization.plots import plot_signal


def test_first_signal_plot_returns_figure():
    time = np.linspace(0, 1e-3, 1000)
    message = generate_message(amplitude=1, frequency=1000, time=time)
    carrier = generate_carrier(amplitude=1, frequency=10000, time=time)

    fig = plot_signal(time, message, title="Message Signal")

    assert fig is not None
    assert len(message) == len(time)
    assert len(carrier) == len(time)
