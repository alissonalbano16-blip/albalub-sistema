"""Transcreve um vídeo com faster-whisper e gera legendas curtas estilo Reels.

Uso: python transcrever.py "video.mp4" [--idioma pt] [--modelo medium] [--device cpu|cuda] [--max-palavras 5]
Gera, ao lado do vídeo: <nome>.srt (legenda), <nome>.txt (texto corrido)
e <nome>.json (palavra a palavra, formato Caption do Remotion).
"""
import argparse
import json
import os
import subprocess
import sys
import time

import numpy as np
from faster_whisper import WhisperModel


def carregar_audio(caminho, sr=16000):
    # Decodifica com o ffmpeg do sistema: o PyAV instalado pelo auto-editor
    # é incompatível com o decode_audio do faster-whisper.
    cmd = ["ffmpeg", "-nostdin", "-v", "error", "-i", caminho,
           "-f", "f32le", "-ac", "1", "-ar", str(sr), "-"]
    out = subprocess.run(cmd, capture_output=True, check=True).stdout
    return np.frombuffer(out, np.float32)


def ts(seg):
    ms = int(round(seg * 1000))
    h, ms = divmod(ms, 3_600_000)
    m, ms = divmod(ms, 60_000)
    s, ms = divmod(ms, 1000)
    return f"{h:02}:{m:02}:{s:02},{ms:03}"


def blocos(palavras, max_palavras, max_dur=2.5, pausa=0.6):
    atual = []
    for p in palavras:
        if atual:
            dur = p.end - atual[0].start
            gap = p.start - atual[-1].end
            fim_frase = atual[-1].word.strip()[-1:] in ".!?"
            if len(atual) >= max_palavras or dur > max_dur or gap > pausa or fim_frase:
                yield atual
                atual = []
        atual.append(p)
    if atual:
        yield atual


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("video")
    ap.add_argument("--max-palavras", type=int, default=5)
    ap.add_argument("--modelo", default="medium")
    ap.add_argument("--idioma", default="pt", help="pt, en, es... (ou auto)")
    ap.add_argument("--device", default="cpu", help="cpu ou cuda (placa NVIDIA)")
    args = ap.parse_args()

    base = os.path.splitext(args.video)[0]
    inicio = time.time()
    model = WhisperModel(args.modelo, device=args.device, compute_type="int8" if args.device == "cpu" else "float16")
    segments, info = model.transcribe(
        carregar_audio(args.video), language=None if args.idioma == "auto" else args.idioma, word_timestamps=True, vad_filter=True
    )

    palavras, textos = [], []
    for seg in segments:
        textos.append(seg.text.strip())
        palavras.extend(seg.words or [])
        print(f"  {ts(seg.end)}  {seg.text.strip()}", flush=True)

    with open(base + ".srt", "w", encoding="utf-8") as f:
        for i, b in enumerate(blocos(palavras, args.max_palavras), 1):
            texto = "".join(p.word for p in b).strip()
            f.write(f"{i}\n{ts(b[0].start)} --> {ts(b[-1].end)}\n{texto}\n\n")

    with open(base + ".txt", "w", encoding="utf-8") as f:
        f.write("\n".join(textos) + "\n")

    # Palavra a palavra no formato Caption do @remotion/captions
    captions = [
        {
            "text": p.word if p.word.startswith(" ") else " " + p.word,
            "startMs": round(p.start * 1000),
            "endMs": round(p.end * 1000),
            "timestampMs": round((p.start + p.end) * 500),
            "confidence": round(p.probability, 3),
        }
        for p in palavras
    ]
    with open(base + ".json", "w", encoding="utf-8") as f:
        json.dump(captions, f, ensure_ascii=False, indent=1)

    print(f"OK: {base}.srt ({time.time() - inicio:.0f}s, audio {info.duration:.0f}s)")


if __name__ == "__main__":
    sys.exit(main())
