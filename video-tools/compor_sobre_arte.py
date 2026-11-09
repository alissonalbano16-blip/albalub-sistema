# Recorta a pessoa (MediaPipe selfie segmenter) e coloca sobre uma arte 1080x1920,
# com escala/posição ajustáveis e um brilho colorido atrás do contorno.
# Uso: python3 compor_sobre_arte.py video modelo arte.png saida.mp4 [escala] [x] [y]
import sys, subprocess, cv2, numpy as np, mediapipe as mp
from mediapipe.tasks.python import vision, BaseOptions
video, modelo, arte, saida = sys.argv[1:5]
esc = float(sys.argv[5]) if len(sys.argv) > 5 else 1.0
ox = int(sys.argv[6]) if len(sys.argv) > 6 else 0
oy = int(sys.argv[7]) if len(sys.argv) > 7 else 0
W, H = 1080, 1920
seg = vision.ImageSegmenter.create_from_options(vision.ImageSegmenterOptions(
    base_options=BaseOptions(model_asset_path=modelo), output_confidence_masks=True, running_mode=vision.RunningMode.VIDEO))
fundo = cv2.resize(cv2.imread(arte), (W, H), interpolation=cv2.INTER_CUBIC).astype(np.float32)
cor_brilho = np.array([60, 230, 120], np.float32)  # BGR: verde-lima
cap = cv2.VideoCapture(video); fps = cap.get(cv2.CAP_PROP_FPS) or 30
ff = subprocess.Popen(['ffmpeg', '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'bgr24', '-s', f'{W}x{H}', '-r', str(fps), '-i', '-',
                       '-i', video, '-map', '0:v', '-map', '1:a:0', '-c:v', 'libx264', '-crf', '17', '-preset', 'fast', '-pix_fmt', 'yuv420p',
                       '-c:a', 'aac', '-b:a', '192k', '-shortest', saida], stdin=subprocess.PIPE)
pw, ph = int(W * esc), int(H * esc)
prev = None; i = 0
while True:
    ok, f = cap.read()
    if not ok: break
    img = mp.Image(image_format=mp.ImageFormat.SRGB, data=np.ascontiguousarray(cv2.cvtColor(f, cv2.COLOR_BGR2RGB)))
    a = seg.segment_for_video(img, int(i * 1000 / fps)).confidence_masks[0].numpy_view().squeeze().astype(np.float32)
    a = cv2.resize(a, (f.shape[1], f.shape[0]))
    prev = a if prev is None else 0.6 * a + 0.4 * prev
    m = np.clip((prev - 0.35) / 0.4, 0, 1)
    m = cv2.GaussianBlur(cv2.erode(m, np.ones((3, 3), np.uint8)), (0, 0), 1.6)
    pessoa = cv2.resize(f, (pw, ph), interpolation=cv2.INTER_LANCZOS4).astype(np.float32)
    mm = cv2.resize(m, (pw, ph))
    borda = np.clip(np.minimum(np.arange(pw), np.arange(pw)[::-1]) / 70.0, 0, 1)  # some suave nas laterais do quadro original
    mm = mm * borda[None, :]
    # cola na tela com deslocamento (recorta o que sair)
    P = np.zeros((H, W, 3), np.float32); M = np.zeros((H, W), np.float32)
    y0, x0 = max(oy, 0), max(ox, 0); y1, x1 = min(oy + ph, H), min(ox + pw, W)
    P[y0:y1, x0:x1] = pessoa[y0 - oy:y1 - oy, x0 - ox:x1 - ox]
    M[y0:y1, x0:x1] = mm[y0 - oy:y1 - oy, x0 - ox:x1 - ox]
    brilho = np.clip(cv2.GaussianBlur(cv2.dilate(M, np.ones((9, 9), np.uint8)), (0, 0), 28) * 0.75, 0, 1)[..., None]
    base = fundo * (1 - brilho) + np.minimum(255, fundo + cor_brilho) * brilho
    out = P * M[..., None] + base * (1 - M[..., None])
    ff.stdin.write(np.clip(out, 0, 255).astype(np.uint8).tobytes()); i += 1
ff.stdin.close(); ff.wait(); print('quadros', i)
