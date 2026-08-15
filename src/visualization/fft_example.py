import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

import matplotlib
matplotlib.use("Agg")

import matplotlib.pyplot as plt
import numpy as np

from src.analysis.fft import calculate_fft


fs = 100_000

time = np.arange(0, 0.005, 1 / fs)

fc = 10_000
fm = 1_000

signal = np.cos(2 * np.pi * fc * time) + 0.5 * np.cos(2 * np.pi * fm * time)

frequencies, magnitude = calculate_fft(signal, fs)

plt.figure()
plt.plot(frequencies, magnitude)
plt.xlim(0, 20_000)
plt.xlabel("Frequency (Hz)")
plt.ylabel("Magnitude")
plt.title("FFT of AM-like Signal")
plt.grid(True)
plt.show()
