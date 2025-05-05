import yaml
import random
from PIL import Image as pil_image

import torch
import torch.backends.cudnn as cudnn
import torch.nn.functional as F
import torchvision.transforms as transforms

from utils.nn.detectors import DETECTOR
from utils.constants.constants import IMAGE_SIZE

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
    predictions = model(data_dict, inference=True)
    return predictions

def to_tensor(img):
        return transforms.ToTensor()(img)

def create_data_dict(image, device):

    # Tiền xử lý ảnh
    transform = transforms.Compose([
        transforms.ToTensor(),         # Chuyển ảnh sang tensor
        transforms.Normalize(mean=[0.5, 0.5, 0.5], std=[0.5, 0.5, 0.5])  # Chuẩn hóa
    ])
    image_tensor = transform(image)

    # Chuyển ảnh thành batch (batch size = 1)
    image_tensor = image_tensor.unsqueeze(0).to(device)  # Đảm bảo tensor trên đúng thiết bị

    # Tạo data_dict
    data_dict = {
        'image': image_tensor,  # Tensor ảnh
    }

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

def infer(model, image):
    prediction_lists = []
    img = create_data_dict(image, device)
    model.eval()
    predictions = call_model(model, img)
    logits = predictions['cls']
    prob = torch.sigmoid(logits)

    prediction_lists = list(prob[:, 1].cpu().detach().numpy())
    feature_lists = list(predictions['feat'].cpu().detach().numpy())

    print(feature_lists)
    print(prediction_lists)
    print('===> Test Done!')
    return prediction_lists[0], 1 - prediction_lists[0]