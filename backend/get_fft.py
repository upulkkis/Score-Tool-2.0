from numpy import fft, abs, log10
def get_fft(data):
    M = len(data)  # Length of data (should be 44100)
    spectrum = fft.fft(data, axis=0)[:M // 2 + 1:-1] #Calculate the fft
    S = abs(spectrum) #Get rid of complex numbers
    S[S==0]=0.1
    S = 20 * log10(S) #dB values of data
    return S