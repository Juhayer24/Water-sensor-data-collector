import os
from PIL import Image
from tqdm import tqdm

# path = "data/Machine Learning Sets"
# for dir in tqdm(os.listdir(path)):
#     print(dir)
#     if "Tap" in dir or "Fertilizer" in dir or "Algae" in dir or "Dust" in dir:
#         pass
#         # for i in tqdm(os.listdir(f"{path}/{dir}"), leave=False):
#         #     img = Image.open(f"{path}/{dir}/{i}")
#         #     img.save(f"data/clean/{dir}_{i}")

#     elif "No Water" in dir:
#         for i in tqdm(os.listdir(f"{path}/{dir}"), leave=False):
#                img = Image.open(f"{path}/{dir}/{i}")
#                img.save(f"data/empty/{dir}_{i}")
#     else: 
        
#         for sub_dir in tqdm(os.listdir(f"{path}/{dir}"), leave=False):
#             for i in tqdm(os.listdir(f"{path}/{dir}/{sub_dir}"), leave=False):
#                 img = Image.open(f"{path}/{dir}/{sub_dir}/{i}")
#                 img.save(f"data/dirty/{dir}_{sub_dir}_{i}")

