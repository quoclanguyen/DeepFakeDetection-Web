import io
import uvicorn
import uuid
import hashlib
import smtplib
import datetime

from PIL import Image
from qdrant_client import QdrantClient
from qdrant_client.models import PointStruct
from pymongo import MongoClient
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from utils.classes.classes import LoginPayload, ImageUploadResponse, RegisterPayload, ConfirmRegisterPayload
from utils.nn.model_processing import *
from utils.nn.image_processing import *
from utils.constants.constants import *
from email.mime.text import MIMEText

app = FastAPI(
    title = "DeepFakeDetectAPI",
    description = "Demo App",
    version = "1.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Change this to ["http://localhost:3000"] for security
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

collection_name = "DeepFakeDetection"
qdrant_client = QdrantClient(url = QDRANT_ENDPOINT, api_key = QDRANT_API_KEY, timeout = 10)
mongo_client = MongoClient(MONGODB_CONNECTION_STRING)
mongodb = mongo_client[collection_name]

# qdrant_client.create_collection(
#     collection_name=collection_name,
#     vectors_config=models.VectorParams(size=224*224, distance=models.Distance.EUCLID),
# )
@app.post("/app/v1/upload/image", description = "Upload image files", response_model = ImageUploadResponse)
async def upload_image(file: UploadFile = File(...)):
    image_data = await file.read()
    image = Image.open(io.BytesIO(image_data))
    image_vector = image_to_vector(image)
    
    ids = []
    for v in split_vector(image_vector):
        image_id = str(uuid.uuid1())
        ids.append(image_id)
        point = PointStruct(
            id = image_id,
            vector = v,
            payload = {"filename": file.filename}
        )
        qdrant_client.upsert(collection_name=collection_name, points=[point])

    return {"message": "Image uploaded successfully", "filename": file.filename, "ids": ids}

@app.get("/app/v1/image/{image_ids}", description="Retrieve image vector by ID")
async def get_image(image_ids: str):
    try:
        image_ids = image_ids.split("+")
        # Fetch the stored vector and metadata (payload) from Qdrant
        response = qdrant_client.retrieve(collection_name=collection_name, ids=image_ids, with_vectors=True, with_payload=True)

        if response is None:
            raise HTTPException(status_code=404, detail="Image not found")
        response = response[0]
        return {
            "id": response.id,
            "vector": response.vector,
            "metadata": response.payload,
            "message": "Retrieved successfully!"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@app.post("/app/v1/detect/{image_ids}", description = "Deepfake detecting")
async def detect_image(image_ids: str):
    try:
        image_ids = [image_ids[:36], image_ids[36:72], image_ids[72:]] 
        
        response = qdrant_client.retrieve(collection_name=collection_name, ids=image_ids, with_vectors=True, with_payload=True)

        if response is None:
            raise HTTPException(status_code=404, detail="Image not found")
        vector = reconstruct_vector(response[i].vector for i in range(3))
        image = vector_to_image(vector)
        image.save("test.jpg")
        return {}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/app/v1/login/", description = "Login")
async def login(payload: LoginPayload):
    try:
        query = mongodb["users"].find({"email": {"$eq": payload.email}})
        if len(list(query)) == 0: # not found
            return HTTPException(status_code=404, detail="User not found")
        password_db = mongodb["users"].find({"email": {"$eq": payload.email}})[0]["password"]
        hashed_payload = hashlib.sha256(payload.password.encode('utf-8')).hexdigest()
        # print(hashed_payload)
        if hashed_payload != password_db:
            raise HTTPException(status_code=401, detail="Invalid credentials. Wrong password")
        return {
            "status_code": 200,
            "message": "Login successfully!"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/app/v1/register/", description = "Register")
async def register(payload: RegisterPayload):
    try:
        query = mongodb["users"].find({"email": {"$eq": payload.email}})
        if len(list(query)) != 0:
            return HTTPException(status_code=409, detail="Email is already in use")
        

        otp = str(random.randint(100000, 999999))
        sender_email = SMTP_EMAIL
        sender_password = SMTP_PASS
        smtp_server = SMTP_SERVER
        smtp_port = SMTP_PORT

        subject = "Your One-Time Password (OTP)"
        body = f"Your OTP is: {otp}. It will expire in 5 minutes."

        msg = MIMEText(body)
        msg["Subject"] = subject
        msg["From"] = sender_email
        msg["To"] = payload.email
        with smtplib.SMTP(smtp_server, smtp_port) as server:
            server.ehlo()
            server.starttls()
            server.ehlo()
            server.login(sender_email, sender_password)
            server.sendmail(sender_email, payload.email, msg.as_string())
            # Save OTP to DB or cache (temp)
            now = datetime.datetime.utcnow()
            mongodb["temp_otps"].insert_one({
                "email": payload.email,
                "otp": otp,
                "createdAt": now,
                "password": hashlib.sha256(payload.password.encode('utf-8')).hexdigest()
            })
            server.quit()
        return {
            "status_code": 200,
            "message": "Sent OTP successfully!"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/app/v1/register/confirm", description = "Register confirm")
async def confirm_register(payload: ConfirmRegisterPayload):
    try:
        query = mongodb["temp_otps"].find({"email": {"$eq": payload.email}}).sort("createdAt", -1).to_list()
        if len(list(query)) == 0:
            return HTTPException(status_code=404, detail="Email/OTP not found")

        lastest_otp = query[0]["otp"]
        expiration_time = query[0]["createdAt"] + datetime.timedelta(minutes=5)
        
        if payload.otp != lastest_otp:
            return {
                "status_code": 401,
                "message": "Wrong OTP"
            }
        
        if datetime.datetime.utcnow() > expiration_time:
            mongodb["temp_otps"].delete_many({"email": payload.email})
            raise HTTPException(status_code=410, detail="OTP expired")

        # Xác nhận thành công OTP

        mongodb["users"].insert_one({
            "email": payload.email,
            "password": query[0]["password"]
        })
        mongodb["temp_otps"].delete_many({"email": payload.email})
        return {
            "status_code": 200,
            "message": "Confirm OTP successfully!"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    uvicorn.run(app = "main:app", host = "localhost", port = int(PORT), log_level = "info", reload = True)
