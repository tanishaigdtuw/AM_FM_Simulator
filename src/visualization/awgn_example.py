import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

import numpy as np

from src.channel.noise import add_awgn


signal = np.sin(np.linspace(0, 2 * np.pi, 1000))
noisy_signal = add_awgn(signal, snr_db=5, random_seed=0)

print("Original signal length:", len(signal))
print("Noisy signal length:", len(noisy_signal))
