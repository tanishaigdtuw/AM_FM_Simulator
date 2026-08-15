import numpy as np
import matplotlib.pyplot as plt

from src.signals.message import generate_message
from src.signals.carrier import generate_carrier
from src.signals.am import generate_am_signal
from src.demodulation.am_demod import am_demodulate
from src.modulation.fm import fm_modulate
from src.demodulation.fm_demod import fm_demodulate
from src.analysis.metrics import (
    mean_squared_error,
    rmse,
    correlation
)
from src.analysis.bandwidth import (
    am_bandwidth,
    fm_modulation_index,
    fm_bandwidth
)
from src.channel.noise import add_awgn
def normalize_signal(signal):
    max_val = np.max(np.abs(signal))

    if max_val == 0:
        return signal

    return signal / max_val


def calculate_metrics(reference, recovered):
    """
    Calculate MSE, RMSE and correlation between
    the original message and recovered signal.
    """

    reference = normalize_signal(reference)
    recovered = normalize_signal(recovered)

    # Make both signals the same length
    n = min(len(reference), len(recovered))

    reference = reference[:n]
    recovered = recovered[:n]

    mse_value = mean_squared_error(
        reference,
        recovered
    )

    rmse_value = rmse(
        reference,
        recovered
    )

    correlation_value = correlation(
        reference,
        recovered
    )

    return mse_value, rmse_value, correlation_value

# ==========================================
# Simulation Parameters
# ==========================================

fs = 100_000
duration = 0.01

time = np.arange(
    0,
    duration,
    1 / fs
)


# ==========================================
# Message Signal
# ==========================================

message_amplitude = 1
message_frequency = 1000

message = generate_message(
    message_amplitude,
    message_frequency,
    time
)


# ==========================================
# Carrier Signal
# ==========================================

carrier_amplitude = 1
carrier_frequency = 10000

carrier = generate_carrier(
    carrier_amplitude,
    carrier_frequency,
    time
)


# ==========================================
# AM Modulation
# ==========================================

modulation_index = 0.5
am_bandwidth_value = am_bandwidth(
    message_frequency
)
am_signal = generate_am_signal(
    message,
    carrier_amplitude,
    modulation_index,
    carrier_frequency,
    time
)
# ==========================================
# AM Channel Noise
# ==========================================

snr_db = 20

noisy_am_signal = add_awgn(
    am_signal,
    snr_db,
    random_seed=42
)
# ==========================================
# FM Modulation
# ==========================================

frequency_deviation = 2000
fm_modulation_index = (
    frequency_deviation / message_frequency
)
fm_bandwidth_value = fm_bandwidth(
    frequency_deviation,
    message_frequency
)
fm_signal = fm_modulate(
    message,
    carrier_amplitude,
    carrier_frequency,
    frequency_deviation,
    time
)
# ==========================================
# FM Channel Noise
# ==========================================

noisy_fm_signal = add_awgn(
    fm_signal,
    snr_db,
    random_seed=42
)
# ==========================================
# FM Demodulation
# ==========================================

fm_demodulated_signal = fm_demodulate(
    fm_signal,
    message_frequency,
    fs
)
fm_demodulated_signal = normalize_signal(fm_demodulated_signal)
# ==========================================
# Noisy FM Demodulation
# ==========================================

noisy_fm_demodulated = fm_demodulate(
    noisy_fm_signal,
    message_frequency,
    fs
)
noisy_fm_demodulated = normalize_signal(noisy_fm_demodulated)

# ==========================================
# FM Performance Metrics
# ==========================================

fm_mse, fm_rmse, fm_correlation = calculate_metrics(
    message,
    fm_demodulated_signal
)

noisy_fm_mse, noisy_fm_rmse, noisy_fm_correlation = calculate_metrics(
    message,
    noisy_fm_demodulated
)

# ==========================================
# AM Demodulation
# ==========================================

demodulated_signal = am_demodulate(
    am_signal,
    message_frequency,
    fs
)
demodulated_signal = normalize_signal(demodulated_signal)
# ==========================================
# Noisy AM Demodulation
# ==========================================

noisy_am_demodulated = am_demodulate(
    noisy_am_signal,
    message_frequency,
    fs
)
noisy_am_demodulated = normalize_signal(noisy_am_demodulated)

# ==========================================
# AM Performance Metrics
# ==========================================

am_mse, am_rmse, am_correlation = calculate_metrics(
    message,
    demodulated_signal
)

noisy_am_mse, noisy_am_rmse, noisy_am_correlation = calculate_metrics(
    message,
    noisy_am_demodulated
)

# ==========================================
# Plot
# ==========================================

plt.figure(figsize=(10, 10))


# ------------------------------------------
# Message Signal
# ------------------------------------------

plt.subplot(4, 1, 1)

plt.plot(
    time * 1000,
    message
)

plt.title("Message Signal")
plt.xlabel("Time (ms)")
plt.ylabel("Amplitude")

plt.grid(True)


# ------------------------------------------
# Carrier Signal
# ------------------------------------------

plt.subplot(4, 1, 2)

plt.plot(
    time * 1000,
    carrier
)

plt.title("Carrier Signal")
plt.xlabel("Time (ms)")
plt.ylabel("Amplitude")

plt.grid(True)


# ------------------------------------------
# AM Signal
# ------------------------------------------

plt.subplot(4, 1, 3)

plt.plot(
    time * 1000,
    am_signal
)

plt.title(
    f"AM Modulated Signal "
    f"(Modulation Index = {modulation_index})"
)

plt.xlabel("Time (ms)")
plt.ylabel("Amplitude")

plt.grid(True)

# ------------------------------------------
# Demodulated Signal
# ------------------------------------------

plt.subplot(4, 1, 4)

plt.plot(
    time * 1000,
    demodulated_signal
)

plt.title("Demodulated Signal")
plt.xlabel("Time (ms)")
plt.ylabel("Amplitude")

plt.grid(True)
plt.tight_layout()
# ==========================================
# Noisy AM Signal
# ==========================================

plt.figure(figsize=(10, 5))

plt.plot(
    time * 1000,
    noisy_am_signal
)

plt.title(
    f"Noisy AM Signal (SNR = {snr_db} dB)"
)

plt.xlabel("Time (ms)")
plt.ylabel("Amplitude")

plt.grid(True)

plt.tight_layout()
plt.figure(figsize=(10, 5))

plt.plot(
    time * 1000,
    am_signal,
    label="Original AM Signal"
)

plt.plot(
    time * 1000,
    noisy_am_signal,
    label="Noisy AM Signal"
)

plt.title("AM Signal Before and After Noise (SNR = 20 dB)")
plt.xlabel("Time (ms)")
plt.ylabel("Amplitude")

plt.legend()
plt.grid(True)
plt.tight_layout()

# ==========================================
# FM Plots
# ==========================================

plt.figure(figsize=(10, 10))

# ------------------------------------------
# Message Signal
# ------------------------------------------

plt.subplot(4, 1, 1)

plt.plot(
    time * 1000,
    message
)

plt.title("Message Signal - FM")
plt.xlabel("Time (ms)")
plt.ylabel("Amplitude")

plt.grid(True)


# ------------------------------------------
# Carrier Signal
# ------------------------------------------

plt.subplot(4, 1, 2)

plt.plot(
    time * 1000,
    carrier
)

plt.title("Carrier Signal - FM")
plt.xlabel("Time (ms)")
plt.ylabel("Amplitude")

plt.grid(True)


# ------------------------------------------
# FM Signal
# ------------------------------------------

plt.subplot(4, 1, 3)

plt.plot(
    time * 1000,
    fm_signal
)

plt.title(
    f"FM Modulated Signal "
    f"(Frequency Deviation = {frequency_deviation} Hz)"
)

plt.xlabel("Time (ms)")
plt.ylabel("Amplitude")

plt.grid(True)


# ------------------------------------------
# FM Demodulated Signal
# ------------------------------------------

plt.subplot(4, 1, 4)

plt.plot(
    time * 1000,
    fm_demodulated_signal
)

plt.title("FM Demodulated Signal")
plt.xlabel("Time (ms)")
plt.ylabel("Amplitude")

plt.grid(True)

plt.tight_layout()
# ==========================================
# Noisy FM Signal
# ==========================================

plt.figure(figsize=(10, 5))

plt.plot(
    time * 1000,
    noisy_fm_signal
)

plt.title(
    f"Noisy FM Signal (SNR = {snr_db} dB)"
)

plt.xlabel("Time (ms)")
plt.ylabel("Amplitude")

plt.grid(True)

plt.tight_layout()
plt.figure(figsize=(10, 5))

plt.plot(
    time * 1000,
    fm_signal,
    label="Original FM Signal"
)

plt.plot(
    time * 1000,
    noisy_fm_signal,
    label="Noisy FM Signal"
)

plt.title("FM Signal Before and After Noise (SNR = 20 dB)")
plt.xlabel("Time (ms)")
plt.ylabel("Amplitude")

plt.legend()
plt.grid(True)
plt.tight_layout()

plt.figure(figsize=(10, 5))

plt.plot(
    time * 1000,
    message,
    label="Original Message"
)

plt.plot(
    time * 1000,
    demodulated_signal,
    label="AM Demodulated"
)

plt.plot(
    time * 1000,
    fm_demodulated_signal,
    label="FM Demodulated"
)

plt.title("Demodulated Signal Comparison")

plt.xlabel("Time (ms)")
plt.ylabel("Amplitude")

plt.legend()
plt.grid(True)

plt.tight_layout()

print("Program started")
print("AM signal generated successfully")
print("AM signal demodulated successfully")
print("FM signal generated successfully")
print("FM signal demodulated successfully")

print()
print("========== SIGNAL ANALYSIS ==========")

print()
print("AM ANALYSIS")
print("AM Modulation Index:", modulation_index)
print("AM MSE:", am_mse)
print("AM RMSE:", am_rmse)
print("AM Correlation:", am_correlation)
print("AM Bandwidth:", am_bandwidth_value, "Hz")

print()
print("AM WITH NOISE (SNR =", snr_db, "dB)")
print("Noisy AM MSE:", noisy_am_mse)
print("Noisy AM RMSE:", noisy_am_rmse)
print("Noisy AM Correlation:", noisy_am_correlation)

print()
print("FM ANALYSIS")
print("FM Frequency Deviation:", frequency_deviation, "Hz")
print("FM Modulation Index:", fm_modulation_index)
print("FM MSE:", fm_mse)
print("FM RMSE:", fm_rmse)
print("FM Correlation:", fm_correlation)
print("FM Bandwidth:", fm_bandwidth_value, "Hz")

print()
print("FM WITH NOISE (SNR =", snr_db, "dB)")
print("Noisy FM MSE:", noisy_fm_mse)
print("Noisy FM RMSE:", noisy_fm_rmse)
print("Noisy FM Correlation:", noisy_fm_correlation)

print()
print("========== NOISE IMPACT ==========")

print()
am_correlation_change = (
    noisy_am_correlation - am_correlation
)

fm_correlation_change = (
    noisy_fm_correlation - fm_correlation
)

am_rmse_change = (
    noisy_am_rmse - am_rmse
)

fm_rmse_change = (
    noisy_fm_rmse - fm_rmse
)

print("AM Correlation Change:",
      am_correlation_change)

print("FM Correlation Change:",
      fm_correlation_change)

print()
print("AM RMSE Change:",
      am_rmse_change)

print("FM RMSE Change:",
      fm_rmse_change)

print()
print("==================================")
print("====================================")

if fm_correlation > am_correlation:
    print("FM has better signal recovery based on correlation.")
else:
    print("AM has better signal recovery based on correlation.")

if abs(fm_correlation_change) < abs(am_correlation_change):
    print("FM shows better noise performance based on correlation.")
else:
    print("AM shows better noise performance based on correlation.")
print("Opening graphs...")

plt.show()

print("Graph window closed.")
