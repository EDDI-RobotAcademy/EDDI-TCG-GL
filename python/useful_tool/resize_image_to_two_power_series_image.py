from PIL import Image
import os

# 원본 이미지 폴더
INPUT_FOLDER = "input_images"
# 변환 후 저장 폴더
OUTPUT_FOLDER = "output_images"
# 목표 크기
TARGET_WIDTH = 1024
TARGET_HEIGHT = 2048

os.makedirs(OUTPUT_FOLDER, exist_ok=True)

def process_image(file_path, output_path):
    img = Image.open(file_path).convert("RGBA")
    orig_width, orig_height = img.size

    # 목표 크기에 맞춰 비율 유지
    scale = min(TARGET_WIDTH / orig_width, TARGET_HEIGHT / orig_height)
    new_width = int(orig_width * scale)
    new_height = int(orig_height * scale)

    # 이미지 크기 조정
    resized_img = img.resize((new_width, new_height), Image.LANCZOS)

    # 투명 배경 생성
    final_img = Image.new("RGBA", (TARGET_WIDTH, TARGET_HEIGHT), (0, 0, 0, 0))
    # 중앙 정렬
    x_offset = (TARGET_WIDTH - new_width) // 2
    y_offset = (TARGET_HEIGHT - new_height) // 2
    final_img.paste(resized_img, (x_offset, y_offset), resized_img)

    final_img.save(output_path, "PNG")
    print(f"Saved: {output_path}")

# 폴더 내 모든 이미지 처리
for filename in os.listdir(INPUT_FOLDER):
    if filename.lower().endswith((".png", ".jpg", ".jpeg", ".webp")):
        input_path = os.path.join(INPUT_FOLDER, filename)
        output_path = os.path.join(OUTPUT_FOLDER, os.path.splitext(filename)[0] + ".png")
        process_image(input_path, output_path)
