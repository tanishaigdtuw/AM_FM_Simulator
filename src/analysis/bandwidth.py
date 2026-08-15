def am_bandwidth(message_frequency):
    """
    Theoretical bandwidth of single-tone AM.
    """

    return 2 * message_frequency


def estimate_fm_bandwidth(carrier_frequency_hz, message_frequency_hz, modulation_index):
    """Estimate FM bandwidth using Carson's rule."""
    return 2 * (message_frequency_hz + modulation_index * carrier_frequency_hz)


def fm_modulation_index(
    frequency_deviation,
    message_frequency
):
    return (
        frequency_deviation
        / message_frequency
    )


def fm_bandwidth(
    frequency_deviation,
    message_frequency
):
    return 2 * (
        frequency_deviation
        + message_frequency
    )
