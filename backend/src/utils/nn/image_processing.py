from PIL import Image
import numpy as np

def image_to_vector(image: Image.Image) -> np.ndarray:
    # print(image.size)
    image = image.convert("RGB") 
    image = image.resize((224, 224))
    image_array = np.array(image)
    image_vector = image_array.flatten()  
    return image_vector.tolist()

def vector_to_image(vector: list) -> Image.Image:
    arr = np.array(vector)
    return Image.fromarray((arr.reshape(224, 224, 3).astype(np.uint8)))

def split_vector(vector: list, chunk_size: int = 224*224):
    return [vector[i:i + chunk_size] for i in range(0, len(vector), chunk_size)]

def reconstruct_vector(split_vectors: list) -> list:
    return [item for chunk in split_vectors for item in chunk]