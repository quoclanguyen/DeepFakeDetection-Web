import io
import numpy as np
import uvicorn
import uuid

from PIL import Image
from qdrant_client import QdrantClient, models
from qdrant_client.models import PointStruct
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.responses import JSONResponse
from utils.nn.model_processing import *
from utils.nn.image_processing import *
from utils.classes.ImageUploadResponse import ImageUploadResponse
from utils.constants.constants import *

collection_name = "Temp"
qdrant_client = QdrantClient(url = QDRANT_ENDPOINT, api_key = QDRANT_API_KEY, timeout = 10)
# qdrant_client.create_collection(
#     collection_name=collection_name,
#     vectors_config=models.VectorParams(size=224*224, distance=models.Distance.EUCLID),
# )

qdrant_client.upsert(collection_name=collection_name, points=[
    PointStruct(
        id=2,
        vector=[255] * (224*224),
        payload={"res": "test"}
    )
])