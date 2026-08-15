from src.analysis.bandwidth import am_bandwidth


def test_am_bandwidth_single_tone():
    assert am_bandwidth(1000) == 2000
