"""Génère les petits effets sonores (WAV 16 bits mono) : hors ligne, sans licence."""
import math, struct, wave, os

RATE = 22050
OUT = os.path.join(os.path.dirname(__file__), '..', 'assets', 'sounds')

def tone(freq, dur, vol=0.5, kind='sine', slide=0.0):
    n = int(RATE * dur)
    out = []
    for i in range(n):
        t = i / RATE
        f = freq + slide * (t / dur)
        ph = 2 * math.pi * f * t
        if kind == 'square':
            v = 1.0 if math.sin(ph) >= 0 else -1.0
        elif kind == 'saw':
            v = 2.0 * ((f * t) % 1.0) - 1.0
        else:
            v = math.sin(ph)
        env = min(1.0, i / (RATE * 0.005)) * min(1.0, (n - i) / (RATE * 0.04))
        out.append(v * env * vol)
    return out

def seq(*parts):
    r = []
    for p in parts:
        r += p
    return r

def save(name, samples):
    path = os.path.join(OUT, name + '.wav')
    with wave.open(path, 'wb') as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(RATE)
        w.writeframes(b''.join(struct.pack('<h', int(max(-1, min(1, s)) * 32767)) for s in samples))

save('tick', tone(1400, 0.03, 0.4, 'square'))
save('reveal', seq(tone(500, 0.06, 0.4), tone(900, 0.1, 0.4)))
save('correct', seq(tone(660, 0.09, 0.45), tone(880, 0.09, 0.45), tone(1320, 0.18, 0.45)))
save('wrong', seq(tone(220, 0.14, 0.45, 'saw'), tone(160, 0.22, 0.45, 'saw')))
save('steal', tone(300, 0.35, 0.4, 'saw', slide=900))
save('trophy', seq(tone(784, 0.1, 0.45), tone(988, 0.1, 0.45), tone(1175, 0.1, 0.45), tone(1568, 0.3, 0.45)))
save('win', seq(tone(523, 0.14, 0.5), tone(659, 0.14, 0.5), tone(784, 0.14, 0.5), tone(1047, 0.45, 0.5)))
print('ok')
