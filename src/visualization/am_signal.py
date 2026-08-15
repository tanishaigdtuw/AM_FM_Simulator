import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

import matplotlib

matplotlib.use("Agg")

import matplotlib.pyplot as plt
import numpy as np

from src.modulation.am import am_modulate


fs = 100_000
duration = 5e-3

time = np.arange(
    0,
    duration,
    1 / fs
)

fm = 1000
fc = 10000

message = np.cos(
    2 * np.pi * fm * time
)

am_signal = am_modulate(
    message=message,
    carrier_amplitude=1,
    carrier_frequency=fc,
    modulation_index=0.5,
    time=time
)

plt.figure()

plt.plot(
    time * 1000,
    am_signal
)

plt.xlabel("Time (ms)")
plt.ylabel("Amplitude")
plt.title("AM Modulated Signal")

plt.grid()

plt.show()
