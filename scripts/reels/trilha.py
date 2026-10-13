"""Trilha original do reel (30 s, 120 BPM), sintetizada e sincronizada com os cortes do reels.html.

  python trilha.py <saida.wav>

Sem sample nem música de terceiros: nada de direito autoral no post.
"""
import sys
import numpy as np
from scipy.signal import butter, sosfilt, fftconvolve
from scipy.io import wavfile

SR = 44100
DUR = 30.0
N = int(SR * DUR)
BPM = 120
BEAT = 60 / BPM
GRID = 0.3  # origem da grade: o drop (10,8 s) cai num tempo forte
rng = np.random.default_rng(7)


def t_(d):
    return np.arange(int(SR * d)) / SR


def at(bus, sig, t0, g=1.0):
    i = int(t0 * SR)
    if i >= len(bus):
        return
    sig = sig[: len(bus) - i]
    bus[i : i + len(sig)] += g * sig


def lp(x, f, o=2):
    return sosfilt(butter(o, f, "low", fs=SR, output="sos"), x)


def hp(x, f, o=2):
    return sosfilt(butter(o, f, "high", fs=SR, output="sos"), x)


def bp(x, lo, hi, o=2):
    return sosfilt(butter(o, [lo, hi], "band", fs=SR, output="sos"), x)


def nota(n):  # n em semitons a partir de A4
    return 440 * 2 ** (n / 12)


def saw(f, d, det=0.0):
    t = t_(d)
    ph = (f * (1 + det)) * t
    return 2 * (ph - np.floor(ph + 0.5))


# ---------------- instrumentos ----------------

def kick(d=0.45):
    t = t_(d)
    f = 45 + 95 * np.exp(-t * 28)
    ph = 2 * np.pi * np.cumsum(f) / SR
    s = np.sin(ph) * np.exp(-t * 7.5)
    clique = np.zeros_like(t); clique[: int(0.004 * SR)] = rng.normal(0, 0.4, int(0.004 * SR))
    s += lp(clique, 3500)
    return np.tanh(1.6 * s)


def clap():
    d = 0.25
    t = t_(d)
    n = bp(rng.normal(0, 1, len(t)), 900, 3500)
    env = np.zeros_like(t)
    for o in (0, 0.011, 0.022):
        env += np.where(t >= o, np.exp(-(t - o) * 60), 0)
    env += np.where(t >= 0.03, np.exp(-(t - 0.03) * 14), 0) * 0.6
    return n * env * 0.9


def hat(d=0.05, aberto=False):
    d = 0.22 if aberto else d
    t = t_(d)
    n = hp(rng.normal(0, 1, len(t)), 7000, 4)
    return n * np.exp(-t * (14 if aberto else 70)) * 0.5


def baixo(f, d):
    s = saw(f, d) * 0.6 + np.sin(2 * np.pi * f * t_(d)) * 0.8
    s = lp(s, 380)
    t = t_(d)
    env = np.minimum(1, t / 0.008) * np.exp(-t * 3.5)
    return s * env


def pad(freqs, d):
    t = t_(d)
    s = np.zeros((len(t), 2))
    for f in freqs:
        for ch, det in ((0, -0.006), (1, 0.006)):
            s[:, ch] += saw(f, d, det) + 0.5 * saw(f, d, -det * 1.7)
    s = np.stack([lp(s[:, 0], 1400), lp(s[:, 1], 1400)], 1)
    env = np.minimum(1, t / 0.35) * np.minimum(1, (d - t) / 0.4)
    return s * env[:, None] * 0.08


def whoosh(d=0.45, f0=300, f1=4000, pico=0.7):
    t = t_(d)
    n = rng.normal(0, 1, len(t))
    out = np.zeros_like(t)
    passos = 24
    for k in range(passos):
        a, b = k * len(t) // passos, (k + 1) * len(t) // passos
        x = k / passos
        fc = f0 * (f1 / f0) ** x
        out[a:b] = bp(n, fc * 0.7, min(fc * 1.4, SR / 2 - 100))[a:b]
    env = np.where(t / d < pico, (t / d / pico) ** 2, ((1 - t / d) / (1 - pico)) ** 1.5)
    return out * env * 1.4


def riser(d=0.75):
    t = t_(d)
    f = 200 * (12 ** (t / d))
    tom = np.sin(2 * np.pi * np.cumsum(f) / SR) * 0.25
    n = bp(rng.normal(0, 1, len(t)), 1500, 9000) * 0.5
    return (tom + n) * (t / d) ** 2.2


def impacto():
    d = 2.2
    t = t_(d)
    f = 32 + 70 * np.exp(-t * 9)
    boom = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 2.2)
    n = lp(rng.normal(0, 1, len(t)), 2500) * np.exp(-t * 6) * 0.6
    return np.tanh(1.4 * (boom + n))


def tique(f=1900):
    t = t_(0.09)
    return np.sin(2 * np.pi * f * t) * np.exp(-t * 55) * 0.5 + np.sin(2 * np.pi * f * 2.01 * t) * np.exp(-t * 90) * 0.15


def sino(f, d=2.0):
    t = t_(d)
    s = sum(a * np.sin(2 * np.pi * f * m * t) * np.exp(-t * dec) for m, a, dec in
            ((1, 1, 2.2), (2.76, 0.4, 4), (5.4, 0.2, 7), (8.9, 0.08, 11)))
    return s * 0.35


def blip(f):
    t = t_(0.14)
    return np.sin(2 * np.pi * f * t) * np.exp(-t * 30) * 0.3


def reverb(x, d=2.4, mix=0.3):
    ir = rng.normal(0, 1, int(SR * d)) * np.exp(-np.arange(int(SR * d)) / SR * 3.2)
    ir = lp(ir, 5000)
    w = fftconvolve(x, ir)[: len(x)]
    w /= np.max(np.abs(w)) + 1e-9
    return x + mix * w * np.max(np.abs(x))


# ---------------- arranjo ----------------

drums = np.zeros(N)
bass = np.zeros(N)
padb = np.zeros((N, 2))
sfx = np.zeros(N)
kicks = []

# Lá menor, i-VI-III-VII (Am F C G): um acorde por compasso de 4 tempos
acordes = [(-12, [0, 3, 7]), (-16, [-4, 0, 3]), (-21, [3, 7, 10]), (-14, [-2, 2, 5])]


def tempos(a, b):
    k = int(np.ceil((a - GRID) / BEAT - 1e-9))
    while GRID + k * BEAT < b - 1e-9:
        yield k, GRID + k * BEAT
        k += 1


def secao(a, b, kick_on=True, clap_on=False, hats=0, baixo_on=False, pad_on=True, g=1.0):
    for k, (_, tb) in enumerate(tempos(a, b)):  # k conta da entrada da seção: cada seção abre num compasso
        if kick_on:
            at(drums, kick(), tb, 0.9 * g); kicks.append(tb)
        if clap_on and k % 2 == 1:
            at(drums, clap(), tb, 0.5 * g)
        if hats >= 1:
            at(drums, hat(aberto=True), tb + BEAT / 2, 0.35 * g)
        if hats >= 2:
            for q in (0.25, 0.75):
                at(drums, hat(), tb + q * BEAT, 0.25 * g)
        raiz, notas = acordes[(k // 4) % 4]
        if baixo_on:
            for q in (0.5, 0.75) if k % 2 else (0.5,):
                at(bass, baixo(nota(raiz - 12), BEAT * 0.24), tb + q * BEAT, 0.8 * g)
        if pad_on and k % 4 == 0:
            d = min(4 * BEAT, b - tb) + 0.4
            at_pad(pad([nota(raiz + n) for n in notas], d), tb, g)


def at_pad(sig, t0, g):
    i = int(t0 * SR)
    sig = sig[: N - i]
    padb[i : i + len(sig)] += g * sig


# 0 a 5,05: gancho e problema, groove seco
at(sfx, impacto() * 0.55, 0.0)
secao(0.3, 2.6, hats=1, pad_on=True)
secao(2.6, 5.05, hats=2, baixo_on=True)
# zoom que atravessa a tela
at(sfx, whoosh(0.45, 200, 6000, 0.85), 4.95, 0.9)
# 5,4 a 7,7: contagem, tudo abafado, um tique e um baque por número
for i, s in enumerate((5.6, 6.3, 7.0)):
    at(sfx, tique(1700 + 250 * i), s, 0.9)
    at(drums, kick(0.6), s, 0.55); kicks.append(s)
at_pad(pad([nota(-12 + n) for n in (0, 3, 7)], 2.4), 5.4, 0.8)
# "...ou vai embora" e o chicote
at(sfx, whoosh(0.35, 500, 7000, 0.7), 8.2, 0.9)
# o traço corta, a subida, o impacto no teal
at(sfx, whoosh(0.4, 900, 9000, 0.6), 8.58, 0.6)
at(sfx, riser(0.72), 8.6, 0.8)
at(sfx, impacto(), 9.32, 1.0)
at_pad(pad([nota(-9 + n) for n in (0, 4, 7, 11)], 1.6), 9.35, 0.9)  # respiro em dó maior com sétima
# o círculo abre e a batida cai
at(sfx, whoosh(0.5, 150, 3000, 0.9), 10.3, 0.7)
secao(10.8, 22.05, clap_on=True, hats=2, baixo_on=True)
for w in (15.42, 17.72, 19.92):
    at(sfx, whoosh(0.38, 400, 8000, 0.55), w, 0.75)
# marca: blips subindo na pentatônica e o sino quando o traço acende
at(sfx, whoosh(0.4, 3000, 200, 0.4), 22.0, 0.6)
secao(22.3, 25.5, hats=1, baixo_on=True, g=0.85)
for i, f in enumerate([nota(n) for n in (3, 5, 7, 10, 12, 15, 17, 19)]):
    at(sfx, blip(f), 22.3 + i * 0.05, 0.6)
at(sfx, sino(nota(15)), 22.95, 0.7)
# chamada: groove cheio, pop do botão, fecha num impacto e cauda
at(sfx, whoosh(0.35, 300, 5000, 0.8), 25.4, 0.6)
secao(25.8, 29.3, clap_on=True, hats=2, baixo_on=True)
at(sfx, blip(nota(12)) * 1.5, 26.45, 0.9)
at(sfx, impacto() * 0.7, 29.3)
at_pad(pad([nota(-12 + n) for n in (0, 3, 7, 10)], 0.7 + DUR - 29.3), 29.3, 0.9)

# abafa a música na contagem e no "...ou vai embora" (o tique e o baque ficam limpos)
t = np.arange(N) / SR
abaf = np.clip(np.minimum((t - 5.2) / 0.2, (8.6 - t) / 0.3), 0, 1)
for bus in (bass,):
    bus[:] = bus * (1 - abaf) + lp(bus, 250) * abaf * 0.6
padf = np.stack([lp(padb[:, 0], 500), lp(padb[:, 1], 500)], 1)
padb = padb * (1 - abaf[:, None]) + padf * abaf[:, None]

# sidechain: pad e baixo respiram com o bumbo
duck = np.ones(N)
for k in kicks:
    i = int(k * SR)
    d = np.arange(int(0.3 * SR)) / (0.3 * SR)
    seg_ = 1 - 0.6 * (1 - d) ** 2
    j = min(N, i + len(seg_))
    duck[i:j] = np.minimum(duck[i:j], seg_[: j - i])
bass *= duck
padb *= duck[:, None]

sfx = reverb(sfx, 2.2, 0.35)
drums = reverb(drums, 1.0, 0.08)
mono = 0.95 * drums + 0.75 * bass + 0.9 * sfx
mix = padb * 1.0 + mono[:, None]
mix = hp(mix.T, 28).T
# fade final e limite suave
fade = np.clip((DUR - t) / 0.6, 0, 1)
mix *= fade[:, None]
mix = np.tanh(mix / np.max(np.abs(mix)) * 1.3)
mix *= 0.89 / np.max(np.abs(mix))
wavfile.write(sys.argv[1] if len(sys.argv) > 1 else "trilha.wav", SR, (mix * 32767).astype(np.int16))
print("ok")
