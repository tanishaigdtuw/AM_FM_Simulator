import matplotlib.pyplot as plt


def plot_signal(time, signal, title, xlabel="Time (s)", ylabel="Amplitude"):
    fig, ax = plt.subplots()

    ax.plot(time, signal)

    ax.set_title(title)
    ax.set_xlabel(xlabel)
    ax.set_ylabel(ylabel)
    ax.grid(True)

    return fig
