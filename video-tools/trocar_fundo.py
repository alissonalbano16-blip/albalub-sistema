# Recorta a pessoa quadro a quadro (MediaPipe selfie segmenter) e compõe sobre um fundo 1080x1920.
import sys, subprocess, cv2, numpy as np, mediapipe as mp
from mediapipe.tasks.python import vision, BaseOptions
video, modelo, fundo_png, saida = sys.argv[1:5]
W, H = 1080, 1920
seg = vision.ImageSegmenter.create_from_options(vision.ImageSegmenterOptions(
    base_options=BaseOptions(model_asset_path=modelo), output_confidence_masks=True, running_mode=vision.RunningMode.VIDEO))
fundo = cv2.resize(cv2.imread(fundo_png), (W, H)).astype(np.float32)
lut = np.array([min(255, ((i / 255) ** 0.65) * 255 * 1.04) for i in range(256)]).astype(np.uint8)
cap = cv2.VideoCapture(video); fps = cap.get(cv2.CAP_PROP_FPS) or 30
ff = subprocess.Popen(['ffmpeg', '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'bgr24', '-s', f'{W}x{H}', '-r', str(fps), '-i', '-',
                       '-i', video, '-map', '0:v', '-map', '1:a:0', '-c:v', 'libx264', '-crf', '17', '-preset', 'fast', '-pix_fmt', 'yuv420p',
                       '-c:a', 'aac', '-b:a', '192k', '-shortest', saida], stdin=subprocess.PIPE)
prev = None; i = 0
while True:
    ok, f = cap.read()
    if not ok: break
    claro = cv2.LUT(f, lut)
    img = mp.Image(image_format=mp.ImageFormat.SRGB, data=np.ascontiguousarray(cv2.cvtColor(claro, cv2.COLOR_BGR2RGB)))
    a = seg.segment_for_video(img, int(i * 1000 / fps)).confidence_masks[0].numpy_view().squeeze().astype(np.float32)
    a = cv2.resize(a, (claro.shape[1], claro.shape[0]))
    prev = a if prev is None else 0.55 * a + 0.45 * prev          # estabiliza entre quadros
    m = np.clip((prev - 0.35) / 0.4, 0, 1)                          # contraste da máscara
    m = cv2.erode(m, np.ones((3, 3), np.uint8))                      # tira a franja escura
    m = cv2.GaussianBlur(m, (0, 0), 2.2)                             # borda suave
    pessoa = cv2.resize(claro, (W, H), interpolation=cv2.INTER_LANCZOS4).astype(np.float32)
    m = cv2.resize(m, (W, H), interpolation=cv2.INTER_LINEAR)[..., None]
    out = pessoa * m + fundo * (1 - m)
    ff.stdin.write(np.clip(out, 0, 255).astype(np.uint8).tobytes()); i += 1
ff.stdin.close(); ff.wait(); print('quadros', i)
