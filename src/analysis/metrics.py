import numpy as np


def mean_squared_error(
    original,
    recovered
):
    return np.mean(
        (original - recovered) ** 2
    )


def rmse(
    original,
    recovered
):
    return np.sqrt(
        mean_squared_error(
            original,
            recovered
        )
    )


def correlation(
    original,
    recovered
):
    return np.corrcoef(
        original,
        recovered
    )[0, 1]