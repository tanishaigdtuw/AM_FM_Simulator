# AM/FM Modulation & Demodulation Simulator

**Exploring how information travels through the air — and what happens when noise gets in the way.**

> A Python-based communication systems simulation that demonstrates **Amplitude Modulation (AM)** and **Frequency Modulation (FM)** from signal generation to demodulation, noise testing, performance measurement, and visualization.

> The project started as a signal-processing simulation in Python and has been extended with a **web-based interface** for a more interactive way to explore the results.


# The Idea Behind the Project

> Communication systems take a simple information signal and transform it into a form that can be transmitted over a communication channel.

> This project asks a simple question:

**When the same message is transmitted using AM and FM, which method recovers the original information more accurately — especially when noise is present?**

> To explore this, the simulator creates a message signal, modulates it using both AM and FM, passes the signals through a simulated noisy channel, demodulates them, and compares the recovered signals using mathematical performance metrics.

> Instead of only showing formulas, the project turns the theory of analog communication into something that can be **simulated, visualized, measured, and compared.**


# Project Objectives

> The main goals of this project are to:

- Understand the fundamentals of AM and FM modulation.
- Generate message and carrier signals.
- Modulate and demodulate signals.
- Simulate a noisy communication channel using AWGN.
- Measure how accurately the original message is recovered.
- Compare AM and FM using quantitative metrics.
- Calculate theoretical bandwidth.
- Visualize signals in the time domain.
- Provide a foundation for an interactive web-based simulator.


# What the Simulator Does

> The complete simulation follows this communication pipeline:

                  MESSAGE SIGNAL
                        │
                        ▼
              ┌───────────────────┐
              │   AM Modulation   │
              └───────────────────┘
                        │
                        ▼
                  AM Signal
                        │
                        ▼
                  Noise Channel
                        │
                        ▼
                AM Demodulation
                        │
                        ▼
              Recovered AM Signal
                        │
                        ▼
                  PERFORMANCE
                    ANALYSIS


                  MESSAGE SIGNAL
                        │
                        ▼
              ┌───────────────────┐
              │   FM Modulation   │
              └───────────────────┘
                        │
                        ▼
                  FM Signal
                        │
                        ▼
                  Noise Channel
                        │
                        ▼
                FM Demodulation
                        │
                        ▼
              Recovered FM Signal
                        │
                        ▼
                  PERFORMANCE
                    ANALYSIS
