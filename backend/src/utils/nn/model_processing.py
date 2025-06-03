import yaml
import random
import torch
import torch.backends.cudnn as cudnn
import torch.nn.functional as F
import torchvision.transforms as transforms

from PIL import Image as pil_image
from utils.nn.detectors import DETECTOR
from utils.constants.constants import IMAGE_SIZE
from utils.nn.image_processing import extract_aligned_face_dlib

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

def init_seed(config):
    if config['manualSeed'] is None:
        config['manualSeed'] = random.randint(1, 10000)
    random.seed(config['manualSeed'])
    torch.manual_seed(config['manualSeed'])
    if config['cuda']:
        torch.cuda.manual_seed_all(config['manualSeed'])

@torch.no_grad()
def call_model(model, data_dict):
    print(data_dict["image"].size())
    predictions = model(data_dict, inference=True)
    return predictions

def to_tensor(img):
    return transforms.ToTensor()(img)

def create_data_dict(unprocessed_image, device, is_tensor = False):
    transform = transforms.Compose([
        transforms.ToTensor(),  # Converts to [0, 1]
        transforms.Normalize(mean=[0.5, 0.5, 0.5], std=[0.5, 0.5, 0.5])
    ])
    
    if is_tensor:
        frames = []
        for frame in unprocessed_image:
            image = extract_aligned_face_dlib(frame, res = IMAGE_SIZE)
            frames.append(transform(image))
        _tensor = torch.stack(frames).to(device)
    else:
        image = extract_aligned_face_dlib(unprocessed_image, res = IMAGE_SIZE)
        image_tensor = transform(image)
        _tensor = image_tensor.unsqueeze(0).to(device)

    data_dict = {
        'image': _tensor,
    }
    torch.cuda.empty_cache()
    del _tensor
    return data_dict

def load_model(weights_path, detector_path):
    with open(detector_path, 'r') as f:
        config = yaml.safe_load(f)

    init_seed(config)

    if config['cudnn']:
        cudnn.benchmark = True

    model_class = DETECTOR[config['model_name']]
    model = model_class(config).to(device)
    epoch = 0
    if weights_path:
        try:
            epoch = int(weights_path.split('/')[-1].split('.')[0].split('_')[2])
        except:
            epoch = 0
        ckpt = torch.load(weights_path, map_location=device)
        model.load_state_dict(ckpt, strict=True)
    else:
        print('Fail to load the pre-trained weights')
    return model

def infer(model, image, is_tensor = False):
    img = create_data_dict(image, device, is_tensor)
    model.eval()
    predictions = call_model(model, img)
    del img
    fake_prob = predictions['prob'].cpu().detach().numpy()[0]
    prediction_lists = [
        1 - fake_prob,
        fake_prob
    ]

    feature_lists = list(predictions['feat'].cpu().detach().numpy())

    # print(feature_lists)
    del feature_lists, predictions
    print(prediction_lists)
    print('===> Test Done!')

    # Free memory after inference
    torch.cuda.empty_cache()

    return prediction_lists
