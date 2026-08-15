import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

import matplotlib

matplotlib.use("Agg")

import matplotlib.pyplot as plt
import numpy as np

from src.signals.carrier import generate_carrier
from src.signals.message import generate_message


def main():
    fs = 100_000
    duration = 5e-3
    time = np.arange(0, duration, 1 / fs)

    message = generate_message(amplitude=1, frequency=1000, time=time)
    carrier = generate_carrier(amplitude=1, frequency=10000, time=time)

    plt.figure()
    plt.plot(time * 1000, message, label="Message")
    plt.plot(time * 1000, carrier, label="Carrier")
    plt.xlabel("Time (ms)")
    plt.ylabel("Amplitude")
    plt.title("Message and Carrier Signals")
    plt.legend()
    plt.grid()
    plt.show()


if __name__ == "__main__":
    main()
