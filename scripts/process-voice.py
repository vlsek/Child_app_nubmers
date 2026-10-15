#!/usr/bin/env python3
"""
Готовит записи голоса и музыку для игры: режет тишину по краям, выравнивает
громкость и сохраняет компактные mp3 в src/assets/audio/.

Запуск (нужен ffmpeg):
    python3 scripts/process-voice.py <папка_с_записями>

Записи ищутся по имени файла (регистр и ё/е не важны), см. VOICE_FILES ниже.
Перезапись одного слова: положите новый wav в ту же папку и запустите скрипт ещё раз.
"""
import json
import re
import subprocess
import sys
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
VOICE_DIR = ROOT / "src/assets/audio/voice"
MUSIC_DIR = ROOT / "src/assets/audio/music"

# Ключ в игре (он же имя mp3 и ключ в src/data/voice.ts) -> имя исходного файла без «вова».
VOICE_FILES = {
    **{f"num-{n}": str(n) for n in range(1, 11)},
    "hello": "привет давай учить цифры",
    "count-together": "посчитаем вместе",
    "how-many": "сколько здесь",
    "find-digit": "найди цифру",
    "show-digit": "покажи цифру",
    "praise-molodets": "молодец",
    "praise-otlichno": "отлично",
    "praise-umnitsa": "умница",
    "praise-ura": "ура",
    "retry-again": "попробуй еще раз",
    "retry-almost": "почти получилось",
    "retry-not-quite": "не совсем так",
    "retry-think": "подумай еще",
}

TARGET_LUFS = -16  # громкость голоса
MUSIC_LUFS = -20  # музыка тише голоса, дополнительно приглушается в игре


def norm(name: str) -> str:
    name = Path(name).stem.lower().replace("ё", "е")
    name = re.sub(r"\s+вова$", "", name)
    return re.sub(r"\s+", " ", name).strip()


def ffmpeg(*args: str) -> str:
    r = subprocess.run(["ffmpeg", "-hide_banner", "-nostats", *args], capture_output=True, text=True)
    if r.returncode != 0:
        sys.exit(r.stderr[-800:])
    return r.stderr


# Тишина по краям вырезается (порог мягкий, чтобы не съесть тихие окончания слов),
# затем 40 мс тишины в начале, 10 мс плавного входа и 100 мс тишины в конце, чтобы звук не «щёлкал».
TRIM = (
    "highpass=f=80,"
    "silenceremove=start_periods=1:start_threshold=-50dB:start_silence=0.03,"
    "areverse,"
    "silenceremove=start_periods=1:start_threshold=-50dB:start_silence=0.08,"
    "areverse"
)


def loudnorm_filter(src: Path, pre: str, lufs: int) -> str:
    """Двухпроходная нормализация громкости: сначала замер, потом точная подгонка."""
    base = f"loudnorm=I={lufs}:TP=-1.5:LRA=11"
    log = ffmpeg("-i", str(src), "-af", f"{pre},{base}:print_format=json", "-f", "null", "-")
    m = json.loads(log[log.rindex("{") : log.rindex("}") + 1])
    return (
        f"{pre},{base}:measured_I={m['input_i']}:measured_TP={m['input_tp']}:"
        f"measured_LRA={m['input_lra']}:measured_thresh={m['input_thresh']}:"
        f"offset={m['target_offset']}:linear=true"
    )


def process_voice(src: Path, dst: Path) -> float:
    flt = loudnorm_filter(src, TRIM, TARGET_LUFS)
    flt += ",adelay=40,afade=t=in:d=0.01,apad=pad_dur=0.1"
    ffmpeg("-y", "-i", str(src), "-af", flt, "-ar", "44100", "-ac", "1", "-c:a", "libmp3lame", "-b:a", "80k", str(dst))
    out = ffmpeg("-i", str(dst), "-f", "null", "-")
    h, m, s = re.search(r"time=(\d+):(\d+):([\d.]+)", out).groups() if "time=" in out else (0, 0, 0)
    return int(h) * 3600 + int(m) * 60 + float(s)


def main() -> None:
    if len(sys.argv) != 2:
        sys.exit(__doc__)
    src_dir = Path(sys.argv[1])
    files = {norm(p.name): p for p in src_dir.rglob("*") if p.suffix.lower() in {".wav", ".mp3", ".m4a", ".ogg"}}
    VOICE_DIR.mkdir(parents=True, exist_ok=True)
    MUSIC_DIR.mkdir(parents=True, exist_ok=True)

    missing = []
    for key, stem in VOICE_FILES.items():
        src = files.pop(stem, None)
        if src is None:
            missing.append(key)
            continue
        process_voice(src, VOICE_DIR / f"{key}.mp3")
        print(f"voice  {key:16s} <- {src.name}")

    for stem, src in list(files.items()):
        if "piano" in stem or src.suffix.lower() == ".mp3" and src.stat().st_size > 1_000_000:
            flt = loudnorm_filter(src, "anull", MUSIC_LUFS)
            ffmpeg("-y", "-i", str(src), "-vn", "-map_metadata", "-1", "-af", flt, "-ar", "44100", "-ac", "2",
                   "-c:a", "libmp3lame", "-b:a", "96k", str(MUSIC_DIR / "bouncy-piano-groove.mp3"))
            print(f"music  piano-groove    <- {src.name}")
            files.pop(stem)

    if files:
        print("Не использованы:", ", ".join(p.name for p in files.values()))
    if missing:
        print("НЕ НАЙДЕНЫ записи для:", ", ".join(missing))


if __name__ == "__main__":
    main()
