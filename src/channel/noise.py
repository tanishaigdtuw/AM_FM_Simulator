import numpy as np


def add_awgn(
    signal,
    snr_db,
    random_seed=None
):
    rng = np.random.default_rng(
        random_seed
    )

    signal_power = np.mean(
        signal ** 2
    )

    noise_power = (
        signal_power
        /
        (10 ** (snr_db / 10))
    )

    noise = rng.normal(
        0,
        np.sqrt(noise_power),
        size=len(signal)
    )

    return signal + noise