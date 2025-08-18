import re

import os
import json
from enum import Enum

current_directory = os.getcwd()
print(f"Current working directory: {current_directory}")

class WillBeReferenceImageLocation(Enum):
    CARD = "resource/battle_field_unit/card/"
    SWORD_POWER = "resource/battle_field_unit/sword_power/"
    STAFF_POWER = "resource/battle_field_unit/staff_power/"
    HP = "resource/battle_field_unit/hp/"
    ENERGY = "resource/battle_field_unit/energy/"
    RACE = "resource/card_race/"
    BACKGROUND = "resource/background/"
    ACTIVE_PANEL_SKILL = "resource/active_panel/skill/"
    ACTIVE_PANEL_GENERAL = "resource/active_panel/general/"
    ACTIVE_PANEL_DETAILS = "resource/active_panel/details/"
    MAIN_LOBBY_BACKGROUND = "resource/main_lobby/"
    MAIN_LOBBY_BUTTONS = "resource/main_lobby/buttons/"
    SHOP_BACKGROUND = "resource/shop/"
    SHOP_BUTTONS = "resource/shop/buttons/"
    SHOP_SELECT_SCREENS = "resource/shop/select_screen/"
    SHOP_YES_OR_NO_BUTTON = "resource/shop/yes_or_no/"
    SHOP_GACHA_BUTTON = "resource/shop/gacha_button/"
    SELECT_CARD_SCREEN = "resource/shop/background/"
    TRY_AGAIN_SCREEN = "resource/select_card_result_screen/try_again_screen/"
    TRY_AGAIN_BUTTONS = "resource/select_card_result_screen/try_again_buttons"
    BATTLE_FIELD_BACKGROUND = "resource/battle_field/background/"
    MY_CARD_BACKGROUND = "resource/my_card/background/"
    MY_CARD_PAGE_MOVEMENT_BUTTON = "resource/my_card/page_movement_button"
    MY_DECK_BACKGROUND = "resource/my_deck/background/"
    MY_DECK_BUTTONS = "resource/my_deck/deck_button/"
    CREATE_NEW_DECK_BUTTON = "resource/my_deck/create_deck_button/"
    MY_DECK_PAGE_MOVEMENT_BUTTON = "resource/my_deck/page_movement_button/"
    DECK_PAGE_MOVEMENT_BUTTONS = "resource/my_deck/deck_page_movement_button/"
    DECK_CARD_PAGE_MOVEMENT_BUTTONS = "resource/my_deck/card_page_movement_button/"
    DECK_EDIT_REMOVE_BUTTON = "resource/my_deck/deck_edit_remove_button/"
    DECK_EDIT_DONE_BUTTON = "resource/my_deck/deck_edit_done_button/"
    DECK_EDIT_BUTTON = "resource/my_deck/deck_edit_button/"
    CARD_KINDS = "resource/card_kinds/"
    DECK_MAKING_POP_UP_BACKGROUND = "resource/deck_making_pop_up/background/"
    DECK_MAKING_POP_UP_BUTTONS = "resource/deck_making_pop_up/buttons/"
    DELETE_DECK_POPUP_WINDOW = "resource/my_deck/delete_deck_popup/popup_window/"
    DELETE_DECK_POPUP_BUTTON = "resource/my_deck/delete_deck_popup/button/"
    MAKE_DECK_BACKGROUND = "resource/make_deck/background/"
    OWNED_CARD = "resource/my_card/card/"
    RACE_BUTTON = "resource/make_deck/race_button/"
    RACE_BUTTON_EFFECT = "resource/make_deck/race_button_effect/"
    MAKE_DECK_CARD_PAGE_MOVEMENT_BUTTONS = "resource/make_deck/card_page_movement_button/"
    DONE_BUTTON = "resource/make_deck/done_button/"
    SELECTED_CARD_BLOCK = "resource/make_deck/selected_card_block/"
    NUMBER_OF_SELECTED_CARDS = "resource/make_deck/number_of_selected_cards"
    SELECTED_CARD_BLOCK_EFFECT = "resource/make_deck/selected_card_block_effect/"
    BLOCK_ADD_DELETE_BUTTON = "resource/make_deck/block_add_delete_button/"
    NUMBER_OF_OWNED_CARDS = "resource/make_deck/number_of_owned_cards/"
    OWNED_CARD_EFFECT = "resource/my_card/card_effect/"
    MY_CARD_RACE_BUTTON = "resource/my_card/race_button/"
    MY_CARD_RACE_BUTTON_EFFECT = "resource/my_card/race_button_effect/"
    MY_CARD_CLOSE_BUTTON = "resource/my_card/close_button/"
    MY_CARD_SCROLL_BAR = "resource/my_card/scroll_bar/"
    GLOBAL_NAVIGATION_BAR = "resource/global_navigation_bar/"
    GLOBAL_NAVIGATION_BAR_EFFECT = "resource/global_navigation_bar_effect/"
    BLOCK = "resource/block/"
    CARD_SELECTION_BLOCKER = "resource/card_selection_blocker/"
    CARD_COUNT = "resource/card_count/"
    CARD_COUNT_NOTATION = "resource/card_count_notation/"

class RelativeImageLocation(Enum):
    CARD = "../../resource/battle_field_unit/card/"
    SWORD_POWER = "../../resource/battle_field_unit/sword_power/"
    STAFF_POWER = "../../resource/battle_field_unit/staff_power/"
    HP = "../../resource/battle_field_unit/hp/"
    ENERGY = "../../resource/battle_field_unit/energy/"
    RACE = "../../resource/card_race/"
    BACKGROUND = "../../resource/background/"
    ACTIVE_PANEL_SKILL = "../../resource/active_panel/skill/"
    ACTIVE_PANEL_GENERAL = "../../resource/active_panel/general/"
    ACTIVE_PANEL_DETAILS = "../../resource/active_panel/details/"
    MAIN_LOBBY_BACKGROUND = "../../resource/main_lobby/"
    MAIN_LOBBY_BUTTONS = "../../resource/main_lobby/buttons/"
    SHOP_BACKGROUND = "../../resource/shop/"
    SHOP_BUTTONS = "../../resource/shop/buttons/"
    SHOP_SELECT_SCREENS = "../../resource/shop/select_screen/"
    SHOP_YES_OR_NO_BUTTON = "../../resource/shop/yes_or_no/"
    SHOP_GACHA_BUTTON = "../../resource/shop/gacha_button/"
    SELECT_CARD_SCREEN = "../../resource/shop/background/"
    TRY_AGAIN_SCREEN = "../../resource/select_card_result_screen/try_again_screen"
    TRY_AGAIN_BUTTONS = "../../resource/select_card_result_screen/try_again_buttons"
    BATTLE_FIELD_BACKGROUND = "../../resource/battle_field/background/"
    MY_CARD_BACKGROUND = "../../resource/my_card/background/"
    MY_CARD_PAGE_MOVEMENT_BUTTON = "../../resource/my_card/page_movement_button"
    MY_DECK_BACKGROUND = "../../resource/my_deck/background/"
    MY_DECK_BUTTONS = "../../resource/my_deck/deck_button/"
    CREATE_NEW_DECK_BUTTON = "../../resource/my_deck/create_deck_button/"
    MY_DECK_PAGE_MOVEMENT_BUTTON = "../../resource/my_deck/page_movement_button/"
    DECK_PAGE_MOVEMENT_BUTTONS = "../../resource/my_deck/deck_page_movement_button/"
    DECK_CARD_PAGE_MOVEMENT_BUTTONS = "../../resource/my_deck/card_page_movement_button/"
    DECK_EDIT_REMOVE_BUTTON = "../../resource/my_deck/deck_edit_remove_button/"
    DECK_EDIT_DONE_BUTTON = "../../resource/my_deck/deck_edit_done_button/"
    DECK_EDIT_BUTTON = "../../resource/my_deck/deck_edit_button/"
    CARD_KINDS = "../../resource/card_kinds/"
    DECK_MAKING_POP_UP_BACKGROUND = "../../resource/deck_making_pop_up/background/"
    DECK_MAKING_POP_UP_BUTTONS = "../../resource/deck_making_pop_up/buttons/"
    DELETE_DECK_POPUP_WINDOW = "../../resource/my_deck/delete_deck_popup/popup_window/"
    DELETE_DECK_POPUP_BUTTON = "../../resource/my_deck/delete_deck_popup/button/"
    MAKE_DECK_BACKGROUND = "../../resource/make_deck/background/"
    OWNED_CARD = "../../resource/my_card/card/"
    RACE_BUTTON = "../../resource/make_deck/race_button/"
    RACE_BUTTON_EFFECT = "../../resource/make_deck/race_button_effect/"
    MAKE_DECK_CARD_PAGE_MOVEMENT_BUTTONS = "../../resource/make_deck/card_page_movement_button/"
    DONE_BUTTON = "../../resource/make_deck/done_button/"
    SELECTED_CARD_BLOCK = "../../resource/make_deck/selected_card_block/"
    NUMBER_OF_SELECTED_CARDS = "../../resource/make_deck/number_of_selected_cards"
    SELECTED_CARD_BLOCK_EFFECT = "../../resource/make_deck/selected_card_block_effect/"
    BLOCK_ADD_DELETE_BUTTON = "../../resource/make_deck/block_add_delete_button/"
    NUMBER_OF_OWNED_CARDS = "../../resource/make_deck/number_of_owned_cards/"
    OWNED_CARD_EFFECT = "../../resource/my_card/card_effect/"
    MY_CARD_RACE_BUTTON = "../../resource/my_card/race_button/"
    MY_CARD_RACE_BUTTON_EFFECT = "../../resource/my_card/race_button_effect/"
    MY_CARD_CLOSE_BUTTON = "../../resource/my_card/close_button/"
    MY_CARD_SCROLL_BAR = "../../resource/my_card/scroll_bar/"
    GLOBAL_NAVIGATION_BAR = "../../resource/global_navigation_bar/"
    GLOBAL_NAVIGATION_BAR_EFFECT = "../../resource/global_navigation_bar_effect/"
    BLOCK = "../../resource/block/"
    CARD_SELECTION_BLOCKER = "../../resource/card_selection_blocker/"
    CARD_COUNT = "../../resource/card_count/"
    CARD_COUNT_NOTATION = "../../resource/card_count_notation/"

# 디렉토리 경로 설정
relative_paths = {
    RelativeImageLocation.CARD: RelativeImageLocation.CARD.value,
    RelativeImageLocation.SWORD_POWER: RelativeImageLocation.SWORD_POWER.value,
    RelativeImageLocation.STAFF_POWER: RelativeImageLocation.STAFF_POWER.value,
    RelativeImageLocation.HP: RelativeImageLocation.HP.value,
    RelativeImageLocation.ENERGY: RelativeImageLocation.ENERGY.value,
    RelativeImageLocation.RACE: RelativeImageLocation.RACE.value,
    RelativeImageLocation.BACKGROUND: RelativeImageLocation.BACKGROUND.value,
    RelativeImageLocation.ACTIVE_PANEL_SKILL: RelativeImageLocation.ACTIVE_PANEL_SKILL.value,
    RelativeImageLocation.ACTIVE_PANEL_GENERAL: RelativeImageLocation.ACTIVE_PANEL_GENERAL.value,
    RelativeImageLocation.ACTIVE_PANEL_DETAILS: RelativeImageLocation.ACTIVE_PANEL_DETAILS.value,
    RelativeImageLocation.MAIN_LOBBY_BACKGROUND: RelativeImageLocation.MAIN_LOBBY_BACKGROUND.value,
    RelativeImageLocation.MAIN_LOBBY_BUTTONS: RelativeImageLocation.MAIN_LOBBY_BUTTONS.value,
    RelativeImageLocation.SHOP_BACKGROUND: RelativeImageLocation.SHOP_BACKGROUND.value,
    RelativeImageLocation.SHOP_BUTTONS: RelativeImageLocation.SHOP_BUTTONS.value,
    RelativeImageLocation.SHOP_SELECT_SCREENS: RelativeImageLocation.SHOP_SELECT_SCREENS.value,
    RelativeImageLocation.SHOP_YES_OR_NO_BUTTON: RelativeImageLocation.SHOP_YES_OR_NO_BUTTON.value,
    RelativeImageLocation.SHOP_GACHA_BUTTON: RelativeImageLocation.SHOP_GACHA_BUTTON.value,
    RelativeImageLocation.SELECT_CARD_SCREEN: RelativeImageLocation.SELECT_CARD_SCREEN.value,
    RelativeImageLocation.TRY_AGAIN_SCREEN: RelativeImageLocation.TRY_AGAIN_SCREEN.value,
    RelativeImageLocation.TRY_AGAIN_BUTTONS: RelativeImageLocation.TRY_AGAIN_BUTTONS.value,
    RelativeImageLocation.BATTLE_FIELD_BACKGROUND: RelativeImageLocation.BATTLE_FIELD_BACKGROUND.value,
    RelativeImageLocation.MY_CARD_BACKGROUND: RelativeImageLocation.MY_CARD_BACKGROUND.value,
    RelativeImageLocation.MY_CARD_PAGE_MOVEMENT_BUTTON: RelativeImageLocation.MY_CARD_PAGE_MOVEMENT_BUTTON.value,
    RelativeImageLocation.MY_DECK_BACKGROUND: RelativeImageLocation.MY_DECK_BACKGROUND.value,
    RelativeImageLocation.MY_DECK_BUTTONS: RelativeImageLocation.MY_DECK_BUTTONS.value,
    RelativeImageLocation.CREATE_NEW_DECK_BUTTON: RelativeImageLocation.CREATE_NEW_DECK_BUTTON.value,
    RelativeImageLocation.MY_DECK_PAGE_MOVEMENT_BUTTON: RelativeImageLocation.MY_DECK_PAGE_MOVEMENT_BUTTON.value,
    RelativeImageLocation.DECK_PAGE_MOVEMENT_BUTTONS: RelativeImageLocation.DECK_PAGE_MOVEMENT_BUTTONS.value,
    RelativeImageLocation.DECK_CARD_PAGE_MOVEMENT_BUTTONS: RelativeImageLocation.DECK_CARD_PAGE_MOVEMENT_BUTTONS.value,
    RelativeImageLocation.DECK_EDIT_REMOVE_BUTTON: RelativeImageLocation.DECK_EDIT_REMOVE_BUTTON.value,
    RelativeImageLocation.DECK_EDIT_DONE_BUTTON: RelativeImageLocation.DECK_EDIT_DONE_BUTTON.value,
    RelativeImageLocation.DECK_EDIT_BUTTON: RelativeImageLocation.DECK_EDIT_BUTTON.value,
    RelativeImageLocation.CARD_KINDS: RelativeImageLocation.CARD_KINDS.value,
    RelativeImageLocation.DECK_MAKING_POP_UP_BACKGROUND: RelativeImageLocation.DECK_MAKING_POP_UP_BACKGROUND.value,
    RelativeImageLocation.DECK_MAKING_POP_UP_BUTTONS: RelativeImageLocation.DECK_MAKING_POP_UP_BUTTONS.value,
    RelativeImageLocation.DELETE_DECK_POPUP_WINDOW: RelativeImageLocation.DELETE_DECK_POPUP_WINDOW.value,
    RelativeImageLocation.DELETE_DECK_POPUP_BUTTON: RelativeImageLocation.DELETE_DECK_POPUP_BUTTON.value,
    RelativeImageLocation.MAKE_DECK_BACKGROUND: RelativeImageLocation.MAKE_DECK_BACKGROUND.value,
    RelativeImageLocation.OWNED_CARD: RelativeImageLocation.OWNED_CARD.value,
    RelativeImageLocation.RACE_BUTTON: RelativeImageLocation.RACE_BUTTON.value,
    RelativeImageLocation.RACE_BUTTON_EFFECT: RelativeImageLocation.RACE_BUTTON_EFFECT.value,
    RelativeImageLocation.MAKE_DECK_CARD_PAGE_MOVEMENT_BUTTONS: RelativeImageLocation.MAKE_DECK_CARD_PAGE_MOVEMENT_BUTTONS.value,
    RelativeImageLocation.DONE_BUTTON: RelativeImageLocation.DONE_BUTTON.value,
    RelativeImageLocation.SELECTED_CARD_BLOCK: RelativeImageLocation.SELECTED_CARD_BLOCK.value,
    RelativeImageLocation.NUMBER_OF_SELECTED_CARDS: RelativeImageLocation.NUMBER_OF_SELECTED_CARDS.value,
    RelativeImageLocation.SELECTED_CARD_BLOCK_EFFECT: RelativeImageLocation.SELECTED_CARD_BLOCK_EFFECT.value,
    RelativeImageLocation.BLOCK_ADD_DELETE_BUTTON: RelativeImageLocation.BLOCK_ADD_DELETE_BUTTON.value,
    RelativeImageLocation.NUMBER_OF_OWNED_CARDS: RelativeImageLocation.NUMBER_OF_OWNED_CARDS.value,
    RelativeImageLocation.OWNED_CARD_EFFECT: RelativeImageLocation.OWNED_CARD_EFFECT.value,
    RelativeImageLocation.MY_CARD_RACE_BUTTON: RelativeImageLocation.MY_CARD_RACE_BUTTON.value,
    RelativeImageLocation.MY_CARD_RACE_BUTTON_EFFECT: RelativeImageLocation.MY_CARD_RACE_BUTTON_EFFECT.value,
    RelativeImageLocation.MY_CARD_CLOSE_BUTTON: RelativeImageLocation.MY_CARD_CLOSE_BUTTON.value,
    RelativeImageLocation.MY_CARD_SCROLL_BAR: RelativeImageLocation.MY_CARD_SCROLL_BAR.value,
    RelativeImageLocation.GLOBAL_NAVIGATION_BAR: RelativeImageLocation.GLOBAL_NAVIGATION_BAR.value,
    RelativeImageLocation.GLOBAL_NAVIGATION_BAR_EFFECT: RelativeImageLocation.GLOBAL_NAVIGATION_BAR_EFFECT.value,
    RelativeImageLocation.BLOCK: RelativeImageLocation.BLOCK.value,
    RelativeImageLocation.CARD_SELECTION_BLOCKER: RelativeImageLocation.CARD_SELECTION_BLOCKER.value,
    RelativeImageLocation.CARD_COUNT: RelativeImageLocation.CARD_COUNT.value,
    RelativeImageLocation.CARD_COUNT_NOTATION: RelativeImageLocation.CARD_COUNT_NOTATION.value,
}

reference_paths = {
    WillBeReferenceImageLocation.CARD: WillBeReferenceImageLocation.CARD.value,
    WillBeReferenceImageLocation.SWORD_POWER: WillBeReferenceImageLocation.SWORD_POWER.value,
    WillBeReferenceImageLocation.STAFF_POWER: WillBeReferenceImageLocation.STAFF_POWER.value,
    WillBeReferenceImageLocation.HP: WillBeReferenceImageLocation.HP.value,
    WillBeReferenceImageLocation.ENERGY: WillBeReferenceImageLocation.ENERGY.value,
    WillBeReferenceImageLocation.RACE: WillBeReferenceImageLocation.RACE.value,
    WillBeReferenceImageLocation.BACKGROUND: WillBeReferenceImageLocation.BACKGROUND.value,
    WillBeReferenceImageLocation.ACTIVE_PANEL_SKILL: WillBeReferenceImageLocation.ACTIVE_PANEL_SKILL.value,
    WillBeReferenceImageLocation.ACTIVE_PANEL_GENERAL: WillBeReferenceImageLocation.ACTIVE_PANEL_GENERAL.value,
    WillBeReferenceImageLocation.ACTIVE_PANEL_DETAILS: WillBeReferenceImageLocation.ACTIVE_PANEL_DETAILS.value,
    WillBeReferenceImageLocation.MAIN_LOBBY_BACKGROUND: WillBeReferenceImageLocation.MAIN_LOBBY_BACKGROUND.value,
    WillBeReferenceImageLocation.MAIN_LOBBY_BUTTONS: WillBeReferenceImageLocation.MAIN_LOBBY_BUTTONS.value,
    WillBeReferenceImageLocation.SHOP_BACKGROUND: WillBeReferenceImageLocation.SHOP_BACKGROUND.value,
    WillBeReferenceImageLocation.SHOP_BUTTONS: WillBeReferenceImageLocation.SHOP_BUTTONS.value,
    WillBeReferenceImageLocation.SHOP_SELECT_SCREENS: WillBeReferenceImageLocation.SHOP_SELECT_SCREENS.value,
    WillBeReferenceImageLocation.SHOP_YES_OR_NO_BUTTON: WillBeReferenceImageLocation.SHOP_YES_OR_NO_BUTTON.value,
    WillBeReferenceImageLocation.SHOP_GACHA_BUTTON: WillBeReferenceImageLocation.SHOP_GACHA_BUTTON.value,
    WillBeReferenceImageLocation.SELECT_CARD_SCREEN: WillBeReferenceImageLocation.SELECT_CARD_SCREEN.value,
    WillBeReferenceImageLocation.TRY_AGAIN_SCREEN: WillBeReferenceImageLocation.TRY_AGAIN_SCREEN.value,
    WillBeReferenceImageLocation.TRY_AGAIN_BUTTONS: WillBeReferenceImageLocation.TRY_AGAIN_BUTTONS.value,
    WillBeReferenceImageLocation.BATTLE_FIELD_BACKGROUND: WillBeReferenceImageLocation.BATTLE_FIELD_BACKGROUND.value,
    WillBeReferenceImageLocation.MY_CARD_BACKGROUND: WillBeReferenceImageLocation.MY_CARD_BACKGROUND.value,
    WillBeReferenceImageLocation.MY_CARD_PAGE_MOVEMENT_BUTTON: WillBeReferenceImageLocation.MY_CARD_PAGE_MOVEMENT_BUTTON.value,
    WillBeReferenceImageLocation.MY_DECK_BACKGROUND: WillBeReferenceImageLocation.MY_DECK_BACKGROUND.value,
    WillBeReferenceImageLocation.MY_DECK_BUTTONS: WillBeReferenceImageLocation.MY_DECK_BUTTONS.value,
    WillBeReferenceImageLocation.CREATE_NEW_DECK_BUTTON: WillBeReferenceImageLocation.CREATE_NEW_DECK_BUTTON.value,
    WillBeReferenceImageLocation.MY_DECK_PAGE_MOVEMENT_BUTTON: WillBeReferenceImageLocation.MY_DECK_PAGE_MOVEMENT_BUTTON.value,
    WillBeReferenceImageLocation.DECK_PAGE_MOVEMENT_BUTTONS: WillBeReferenceImageLocation.DECK_PAGE_MOVEMENT_BUTTONS.value,
    WillBeReferenceImageLocation.DECK_CARD_PAGE_MOVEMENT_BUTTONS: WillBeReferenceImageLocation.DECK_CARD_PAGE_MOVEMENT_BUTTONS.value,
    WillBeReferenceImageLocation.DECK_EDIT_REMOVE_BUTTON: WillBeReferenceImageLocation.DECK_EDIT_REMOVE_BUTTON.value,
    WillBeReferenceImageLocation.DECK_EDIT_DONE_BUTTON: WillBeReferenceImageLocation.DECK_EDIT_DONE_BUTTON.value,
    WillBeReferenceImageLocation.DECK_EDIT_BUTTON: WillBeReferenceImageLocation.DECK_EDIT_BUTTON.value,
    WillBeReferenceImageLocation.CARD_KINDS: WillBeReferenceImageLocation.CARD_KINDS.value,
    WillBeReferenceImageLocation.DECK_MAKING_POP_UP_BACKGROUND: WillBeReferenceImageLocation.DECK_MAKING_POP_UP_BACKGROUND.value,
    WillBeReferenceImageLocation.DECK_MAKING_POP_UP_BUTTONS: WillBeReferenceImageLocation.DECK_MAKING_POP_UP_BUTTONS.value,
    WillBeReferenceImageLocation.DELETE_DECK_POPUP_WINDOW: WillBeReferenceImageLocation.DELETE_DECK_POPUP_WINDOW.value,
    WillBeReferenceImageLocation.DELETE_DECK_POPUP_BUTTON: WillBeReferenceImageLocation.DELETE_DECK_POPUP_BUTTON.value,
    WillBeReferenceImageLocation.MAKE_DECK_BACKGROUND: WillBeReferenceImageLocation.MAKE_DECK_BACKGROUND.value,
    WillBeReferenceImageLocation.OWNED_CARD: WillBeReferenceImageLocation.OWNED_CARD.value,
    WillBeReferenceImageLocation.RACE_BUTTON: WillBeReferenceImageLocation.RACE_BUTTON.value,
    WillBeReferenceImageLocation.RACE_BUTTON_EFFECT: WillBeReferenceImageLocation.RACE_BUTTON_EFFECT.value,
    WillBeReferenceImageLocation.MAKE_DECK_CARD_PAGE_MOVEMENT_BUTTONS: WillBeReferenceImageLocation.MAKE_DECK_CARD_PAGE_MOVEMENT_BUTTONS.value,
    WillBeReferenceImageLocation.DONE_BUTTON: WillBeReferenceImageLocation.DONE_BUTTON.value,
    WillBeReferenceImageLocation.SELECTED_CARD_BLOCK: WillBeReferenceImageLocation.SELECTED_CARD_BLOCK.value,
    WillBeReferenceImageLocation.NUMBER_OF_SELECTED_CARDS: WillBeReferenceImageLocation.NUMBER_OF_SELECTED_CARDS.value,
    WillBeReferenceImageLocation.SELECTED_CARD_BLOCK_EFFECT: WillBeReferenceImageLocation.SELECTED_CARD_BLOCK_EFFECT.value,
    WillBeReferenceImageLocation.BLOCK_ADD_DELETE_BUTTON: WillBeReferenceImageLocation.BLOCK_ADD_DELETE_BUTTON.value,
    WillBeReferenceImageLocation.NUMBER_OF_OWNED_CARDS: WillBeReferenceImageLocation.NUMBER_OF_OWNED_CARDS.value,
    WillBeReferenceImageLocation.OWNED_CARD_EFFECT: WillBeReferenceImageLocation.OWNED_CARD_EFFECT.value,
    WillBeReferenceImageLocation.MY_CARD_RACE_BUTTON: WillBeReferenceImageLocation.MY_CARD_RACE_BUTTON.value,
    WillBeReferenceImageLocation.MY_CARD_RACE_BUTTON_EFFECT: WillBeReferenceImageLocation.MY_CARD_RACE_BUTTON_EFFECT.value,
    WillBeReferenceImageLocation.MY_CARD_CLOSE_BUTTON: WillBeReferenceImageLocation.MY_CARD_CLOSE_BUTTON.value,
    WillBeReferenceImageLocation.MY_CARD_SCROLL_BAR: WillBeReferenceImageLocation.MY_CARD_SCROLL_BAR.value,
    WillBeReferenceImageLocation.GLOBAL_NAVIGATION_BAR: WillBeReferenceImageLocation.GLOBAL_NAVIGATION_BAR.value,
    WillBeReferenceImageLocation.GLOBAL_NAVIGATION_BAR_EFFECT: WillBeReferenceImageLocation.GLOBAL_NAVIGATION_BAR_EFFECT.value,
    WillBeReferenceImageLocation.BLOCK: WillBeReferenceImageLocation.BLOCK.value,
    WillBeReferenceImageLocation.CARD_SELECTION_BLOCKER: WillBeReferenceImageLocation.CARD_SELECTION_BLOCKER.value,
    WillBeReferenceImageLocation.CARD_COUNT: WillBeReferenceImageLocation.CARD_COUNT.value,
    WillBeReferenceImageLocation.CARD_COUNT_NOTATION: WillBeReferenceImageLocation.CARD_COUNT_NOTATION.value,
}

image_paths = {
    "card": [],
    "sword_power": [],
    "staff_power": [],
    "hp": [],
    "energy": [],
    "race": [],
    "background": [],
    "active_panel_skill": [],
    "active_panel_general": [],
    "active_panel_details": [],
    "main_lobby_background": [],
    "main_lobby_buttons": [],
    "shop_background": [],
    "shop_buttons": [],
    "shop_select_screens": [],
    "shop_yes_or_no_button": [],
    "shop_gacha_button": [],
    "select_card_screen": [],
    "try_again_screen": [],
    "try_again_buttons": [],
    "battle_field_background": [],
    "my_card_background": [],
    "my_card_page_movement_button": [],
    "my_deck_background": [],
    "my_deck_buttons": [],
    "create_new_deck_button": [],
    "my_deck_page_movement_button": [],
    "deck_page_movement_buttons": [],
    "deck_card_page_movement_buttons": [],
    "deck_edit_remove_button": [],
    "deck_edit_done_button": [],
    "deck_edit_button": [],
    "card_kinds": [],
    "deck_making_pop_up_background": [],
    "deck_making_pop_up_buttons": [],
    "delete_deck_popup_window": [],
    "delete_deck_popup_button": [],
    "make_deck_background": [],
    "owned_card": [],
    "race_button": [],
    "race_button_effect": [],
    "make_deck_card_page_movement_buttons": [],
    "done_button": [],
    "selected_card_block": [],
    "number_of_selected_cards": [],
    "selected_card_block_effect": [],
    "block_add_delete_button": [],
    "number_of_owned_cards": [],
    "owned_card_effect": [],
    "my_card_race_button": [],
    "my_card_race_button_effect": [],
    "my_card_close_button": [],
    "my_card_scroll_bar": [],
    "global_navigation_bar": [],
    "global_navigation_bar_effect": [],
    "block": [],
    "card_selection_blocker": [],
    "card_count": [],
    "card_count_notation": [],
}

####### active_panel_skill은 실험 중 -> 문제 발생하면 이 부분 주석하고 생성 #######
def clean_path(path):
    # Remove ../../ if present at the start of the path
    path = path.replace("\\", "/")  # Ensure all paths use forward slashes
    if path.startswith("../../"):
        path = path[6:]  # Remove the ../../
    return path

# Get skill images
def get_active_panel_skill_images(base_path):
    skill_images = {}
    for unit_folder in os.listdir(base_path):
        unit_path = os.path.join(base_path, unit_folder)
        if os.path.isdir(unit_path):
            # unit_folder별 이미지 리스트 초기화
            skill_images[unit_folder] = []

            # 스킬 폴더 정렬 (1, 2, ...)
            sub_folders = [f for f in os.listdir(unit_path) if os.path.isdir(os.path.join(unit_path, f))]
            sub_folders.sort(key=lambda x: int(re.search(r'\d+', x).group()))

            for sub_folder in sub_folders:
                sub_folder_path = os.path.join(unit_path, sub_folder)
                # 각 폴더 내 파일도 정렬 (파일 이름에 번호 있으면)
                files = [f for f in os.listdir(sub_folder_path) if f.endswith(".png")]
                files.sort(key=lambda f: int(re.search(r'\d+', f).group()) if re.search(r'\d+', f) else 0)

                for file_name in files:
                    file_path = os.path.join(sub_folder_path, file_name)
                    skill_images[unit_folder].append(clean_path(file_path))
    return skill_images

# Initialize paths
image_paths = {category.name.lower(): [] for category in RelativeImageLocation}

# Populate paths
image_paths["active_panel_skill"] = get_active_panel_skill_images(relative_paths[RelativeImageLocation.ACTIVE_PANEL_SKILL])
####### active_panel_skill은 실험 중 -> 문제 발생하면 이 부분 주석하고 생성 ####### 여기까지

for category, dir_path in relative_paths.items():
    if category == RelativeImageLocation.ACTIVE_PANEL_SKILL:
        continue

    for file_name in os.listdir(dir_path):
        if file_name.endswith(".png"):
            file_path = os.path.join(dir_path, file_name)
            image_paths[category.name.lower()].append(clean_path(file_path))

##### Legacy #####
# for category, dir_path in relative_paths.items():
#     reference_path_category = WillBeReferenceImageLocation[category.name].value
#     for file_name in os.listdir(dir_path):
#         if file_name.endswith(".png"):
#             reference_path = os.path.join(reference_path_category, file_name)
#             image_paths[category.name.lower()].append(reference_path)
##################

# JSON 파일로 저장
with open('image-paths.json', 'w', encoding='utf-8') as json_file:
    json.dump(image_paths, json_file, ensure_ascii=False, indent=4)

print("Image paths saved to image-paths.json")
