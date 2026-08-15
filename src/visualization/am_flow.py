def print_am_flow():
    """Print a simple text diagram of the AM transmission chain."""
    flow = """Original Message
       ↓
     AM
       ↓
AM Demodulator
       ↓
Recovered Message"""
    print(flow)


if __name__ == "__main__":
    print_am_flow()
