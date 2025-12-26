import sys
import json
import whisper
import os
import soundfile as sf
import subprocess
import tempfile

def convert_to_wav(input_path):
    # ffmpeg로 webm/mp3 등 다양한 포맷을 wav로 변환
    tmp_wav = tempfile.NamedTemporaryFile(suffix='.wav', delete=False)
    tmp_wav.close()
    wav_path = tmp_wav.name
    cmd = [
        'ffmpeg', '-y', '-i', input_path,
        '-ar', '16000', '-ac', '1', '-f', 'wav', wav_path
    ]
    try:
        subprocess.run(cmd, check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        return wav_path
    except Exception as e:
        return None

def main():
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No audio file path provided"}))
        sys.exit(1)
    audio_path = sys.argv[1]
    if not os.path.exists(audio_path):
        print(json.dumps({"error": f"File not found: {audio_path}"}))
        sys.exit(1)

    # webm/mp3 등은 wav로 변환
    wav_path = convert_to_wav(audio_path)
    if wav_path is None:
        print(json.dumps({"error": "ffmpeg 변환 실패"}))
        sys.exit(1)



    # Whisper 모델 로드 (small 모델, 언어 자동 감지)
    model = whisper.load_model("small")
    result = model.transcribe(wav_path)

    # duration 계산
    try:
        f = sf.SoundFile(wav_path)
        duration = len(f) / f.samplerate
    except Exception:
        duration = None

    # word_count 계산
    text = result.get("text", "")
    word_count = len(text.strip().split()) if text else 0

    # 언어 코드 보정: ko 또는 eng만 허용
    lang = result.get("language", "ko")
    if lang.startswith("ko"):
        lang = "ko"
    elif lang.startswith("en"):
        lang = "eng"
    else:
        lang = "ko"

    output = {
        "text": text,
        "words": [],
        "duration": duration,
        "word_count": word_count,
        "language": lang
    }
    print(json.dumps(output, ensure_ascii=False))

    # 임시 wav 파일 삭제
    try:
        os.remove(wav_path)
    except Exception:
        pass

if __name__ == "__main__":
    main()