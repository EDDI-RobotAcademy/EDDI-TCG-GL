import os
import json
from enum import Enum

current_directory = os.getcwd()
print(f"Current working directory: {current_directory}")

class WillBeReferenceImageLocation(Enum):
    CARD = "resource/battle_field_unit/card/"
    SWORD_POWER = "resource/battle_field_unit/sword_power/"
    HP = "resource/battle_field_unit/hp/"
    ENERGY = "resource/battle_field_unit/energy/"
    RACE = "resource/card_race/"
    BACKGROUND = "resource/background/"
    MAIN_LOBBY_BACKGROUND = "resource/main_lobby/"
    MAIN_LOBBY_BUTTONS = "resource/main_lobby/buttons/"
    SHOP_BACKGROUND = "resource/shop/"
    SHOP_BUTTONS = "resource/shop/buttons/"
    BATTLE_FIELD_BACKGROUND = "resource/battle_field/background/"
    MY_CARD_BACKGROUND = "resource/my_card/background/"
    CARD_KINDS = "resource/card_kinds/"

class RelativeImageLocation(Enum):
    CARD = "../../resource/battle_field_unit/card/"
    SWORD_POWER = "../../resource/battle_field_unit/sword_power/"
    HP = "../../resource/battle_field_unit/hp/"
    ENERGY = "../../resource/battle_field_unit/energy/"
    RACE = "../../resource/card_race/"
    BACKGROUND = "../../resource/background/"
    MAIN_LOBBY_BACKGROUND = "../../resource/main_lobby/"
    MAIN_LOBBY_BUTTONS = "../../resource/main_lobby/buttons/"
    SHOP_BACKGROUND = "../../resource/shop/"
    SHOP_BUTTONS = "../../resource/shop/buttons/"
    BATTLE_FIELD_BACKGROUND = "../../resource/battle_field/background/"
    MY_CARD_BACKGROUND = "../../resource/my_card/background/"
    CARD_KINDS = "../../resource/card_kinds/"

# 디렉토리 경로 설정
relative_paths = {
    RelativeImageLocation.CARD: RelativeImageLocation.CARD.value,
    RelativeImageLocation.SWORD_POWER: RelativeImageLocation.SWORD_POWER.value,
    RelativeImageLocation.HP: RelativeImageLocation.HP.value,
    RelativeImageLocation.ENERGY: RelativeImageLocation.ENERGY.value,
    RelativeImageLocation.RACE: RelativeImageLocation.RACE.value,
    RelativeImageLocation.BACKGROUND: RelativeImageLocation.BACKGROUND.value,
    RelativeImageLocation.MAIN_LOBBY_BACKGROUND: RelativeImageLocation.MAIN_LOBBY_BACKGROUND.value,
    RelativeImageLocation.MAIN_LOBBY_BUTTONS: RelativeImageLocation.MAIN_LOBBY_BUTTONS.value,
    RelativeImageLocation.SHOP_BACKGROUND: RelativeImageLocation.SHOP_BACKGROUND.value,
    RelativeImageLocation.SHOP_BUTTONS: RelativeImageLocation.SHOP_BUTTONS.value,
    RelativeImageLocation.BATTLE_FIELD_BACKGROUND: RelativeImageLocation.BATTLE_FIELD_BACKGROUND.value,
    RelativeImageLocation.MY_CARD_BACKGROUND: RelativeImageLocation.MY_CARD_BACKGROUND.value,
    RelativeImageLocation.CARD_KINDS: RelativeImageLocation.CARD_KINDS.value,
}

reference_paths = {
    WillBeReferenceImageLocation.CARD: WillBeReferenceImageLocation.CARD.value,
    WillBeReferenceImageLocation.SWORD_POWER: WillBeReferenceImageLocation.SWORD_POWER.value,
    WillBeReferenceImageLocation.HP: WillBeReferenceImageLocation.HP.value,
    WillBeReferenceImageLocation.ENERGY: WillBeReferenceImageLocation.ENERGY.value,
    WillBeReferenceImageLocation.RACE: WillBeReferenceImageLocation.RACE.value,
    WillBeReferenceImageLocation.BACKGROUND: WillBeReferenceImageLocation.BACKGROUND.value,
    WillBeReferenceImageLocation.MAIN_LOBBY_BACKGROUND: WillBeReferenceImageLocation.MAIN_LOBBY_BACKGROUND.value,
    WillBeReferenceImageLocation.MAIN_LOBBY_BUTTONS: WillBeReferenceImageLocation.MAIN_LOBBY_BUTTONS.value,
    WillBeReferenceImageLocation.SHOP_BACKGROUND: WillBeReferenceImageLocation.SHOP_BACKGROUND.value,
    WillBeReferenceImageLocation.SHOP_BUTTONS: WillBeReferenceImageLocation.SHOP_BUTTONS.value,
    WillBeReferenceImageLocation.BATTLE_FIELD_BACKGROUND: WillBeReferenceImageLocation.BATTLE_FIELD_BACKGROUND.value,
    WillBeReferenceImageLocation.MY_CARD_BACKGROUND: WillBeReferenceImageLocation.MY_CARD_BACKGROUND.value,
    WillBeReferenceImageLocation.CARD_KINDS: WillBeReferenceImageLocation.CARD_KINDS.value,
}

image_paths = {
    "card": [],
    "sword_power": [],
    "hp": [],
    "energy": [],
    "race": [],
    "background": [],
    "main_lobby_background": [],
    "main_lobby_buttons": [],
    "shop_background": [],
    "shop_buttons": [],
    "battle_field_background": [],
    "my_card_background": [],
    "card_kinds": [],
}

for category, dir_path in relative_paths.items():
    reference_path_category = WillBeReferenceImageLocation[category.name].value
    for file_name in os.listdir(dir_path):
        if file_name.endswith(".png"):
            reference_path = os.path.join(reference_path_category, file_name)
            image_paths[category.name.lower()].append(reference_path)

# JSON 파일로 저장
with open('image-paths.json', 'w', encoding='utf-8') as json_file:
    json.dump(image_paths, json_file, ensure_ascii=False, indent=4)

print("Image paths saved to image-paths.json")
