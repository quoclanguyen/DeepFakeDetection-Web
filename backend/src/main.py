import warnings
import base64
import io
import uvicorn
import uuid
import hashlib
import smtplib
import datetime
import jwt
import random
import cv2
import tempfile

from PIL import Image
from qdrant_client import QdrantClient
from qdrant_client.models import PointStruct, PointIdsList
from pymongo import MongoClient
from fastapi import FastAPI, File, UploadFile, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from utils.classes.classes import AuthPayload, ImageUploadResponse, ConfirmOTPPayload, ChangePasswordPayload, RecoverPayload
from utils.nn.model_processing import *
from utils.nn.image_processing import *
from utils.constants.constants import *
from email.mime.text import MIMEText
from contextlib import asynccontextmanager

loaded_models = {}
@asynccontextmanager
async def lifespan(app: FastAPI):
    all_weight_path = {
        "CapsuleNetV1": {
            "weight": f"{ROOT_WEIGHT_PATH}\\capsule_net_v1.pth",
            "config": f"utils\\nn\\yaml\\capsule_net_v1.yaml"
        },
        "CapsuleNetV2a": {
            "weight": f"{ROOT_WEIGHT_PATH}\\capsule_net_v2a.pth",
            "config": f"utils\\nn\\yaml\\capsule_net_v2.yaml"
        },
        "CapsuleNetV2c": {
            "weight": f"{ROOT_WEIGHT_PATH}\\capsule_net_v2c.pth",
            "config": f"utils\\nn\\yaml\\capsule_net_v2.yaml"
        },
        "F3NetVa": {
            "weight": f"{ROOT_WEIGHT_PATH}\\f3_net_va.pth",
            "config": f"utils\\nn\\yaml\\f3_net.yaml"
        },
        "F3NetVc": {
            "weight": f"{ROOT_WEIGHT_PATH}\\f3_net_vc.pth",
            "config": f"utils\\nn\\yaml\\f3_net.yaml"
        },
        "FaceXRay": {
            "weight": f"{ROOT_WEIGHT_PATH}\\facexray.pth",
            "config": f"utils\\nn\\yaml\\facexray.yaml"
        }
    }
    warnings.filterwarnings("ignore")
    # Load trọng số
    for model_name in all_weight_path.keys():
        print(f"Loading {model_name}...")
        model = all_weight_path[model_name]
        loading_model = load_model(model["weight"], model["config"])
        loaded_models[model_name] = loading_model
    yield
    # Clean up the ML models and release the resources
    loaded_models.clear()

app = FastAPI(
    title = "DeepFakeDetectAPI",
    description = "Demo App",
    version = "1.0",
    lifespan = lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
security = HTTPBearer()

collection_name = "DeepFakeDetection"
# Kết nối với Qdrant
qdrant_client = QdrantClient(url = QDRANT_ENDPOINT, api_key = QDRANT_API_KEY, timeout = 10)
# Kết nối với MongoDB
mongo_client = MongoClient(MONGODB_CONNECTION_STRING)
mongodb = mongo_client[collection_name]

# import qdrant_client.models as md
# qdrant_client.create_collection(
#     collection_name=collection_name,
#     vectors_config=md.VectorParams(size=IMAGE_SIZE*IMAGE_SIZE, distance=md.Distance.EUCLID),
# )

@app.post("/app/v1/upload/image", description = "Upload image files", response_model = ImageUploadResponse, tags=["auth"])
async def upload_image(file: UploadFile = File(...), credentials: HTTPAuthorizationCredentials = Depends(security)):
    access_token = credentials.credentials
    image_data = await file.read()
    image = Image.open(io.BytesIO(image_data))
    image_vector = image_to_vector(image)
    
    ids = ""
    for v in split_vector(image_vector):
        image_id = str(uuid.uuid1())
        ids += image_id
        point = PointStruct(
            id = image_id,
            vector = v,
            payload = {"filename": file.filename}
        )
        qdrant_client.upsert(collection_name=collection_name, points=[point])
    query = mongodb["media"].find({"access_token": {"$eq": access_token}})
    image_id_mongo = 0
    if len(list(query)) != 0:
        lastest_id = mongodb["media"].find({"access_token": {"$eq": access_token}}).sort("image_id", -1).to_list()
        if len(lastest_id[0]) != 0: 
            lastest_id = int(lastest_id[0]["image_id"])
        else:
            lastest_id = -1
        image_id_mongo = lastest_id + 1
    mongodb["media"].insert_one({
            "access_token": access_token,
            "q_ids": ids,
            "image_id": image_id_mongo,
            "timestamp": datetime.datetime.utcnow(),
            "prob": "Nan"
        })
    return {"status_code": 200, "message": "Image uploaded successfully", "filename": file.filename, "ids": ids, "image_id": str(image_id_mongo)}

@app.post("/app/v1/detect/video", description = "Upload and detect videos", tags=["auth"])
async def detect_video(file: UploadFile = File(...), credentials: HTTPAuthorizationCredentials = Depends(security), model_name: str = "CapsuleNetV2a"):
    access_token = credentials.credentials
    # Save uploaded video to a temporary file
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=".mp4") as tmp:
            tmp.write(await file.read())
            tmp_path = tmp.name
    except Exception as e:
        return {"status_code": 500, "message": f"Failed to save uploaded video: {e}"}

    # Open video file
    cap = cv2.VideoCapture(tmp_path)
    if not cap.isOpened():
        os.remove(tmp_path)
        return {"status_code": 400, "message": "Cannot open video file"}
    
    fps = cap.get(cv2.CAP_PROP_FPS)
    frame_count = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    duration = frame_count / fps
    # Check if video duration exceeds the limit
    MAX_DURATION = 10
    if duration > MAX_DURATION:
        cap.release()
        os.remove(tmp_path)
        raise HTTPException(status_code=400, detail= f"Video duration exceeds {MAX_DURATION} seconds.")

    frame_skip = max(1, int(fps / 15))  # Calculate the number of frames to skip
    frames = []
    frame_count = 0

    while True:
        ret, frame = cap.read()
        if not ret:
            break
        if frame_count == 0:
            thumb = Image.fromarray(cv2.cvtColor(frame, cv2.COLOR_BGR2RGB))
            thumb_vector = image_to_vector(thumb)
            ids = ""
            for v in split_vector(thumb_vector):
                thumb_id = str(uuid.uuid1())
                ids += thumb_id
                point = PointStruct(
                    id = thumb_id,
                    vector = v,
                    payload = {"filename": file.filename}
                )
                qdrant_client.upsert(collection_name=collection_name, points=[point])
            query = mongodb["media"].find({"access_token": {"$eq": access_token}})
            thumb_id_mongo = 0
            if len(list(query)) != 0:
                lastest_id = mongodb["media"].find({"access_token": {"$eq": access_token}}).sort("thumb_id", -1).to_list()

                if "image_id" in lastest_id[0].keys():
                    lastest_id = -1
                else:
                    lastest_id = int(lastest_id[0]["thumb_id"])
                thumb_id_mongo = lastest_id + 1
        if frame_count % frame_skip == 0:
            img = Image.fromarray(cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)).resize((IMAGE_SIZE, IMAGE_SIZE))
            frames.append(img)
        frame_count += 1

    cap.release()
    os.remove(tmp_path)
    # _, fake_prob = infer(loaded_models["F3NetVa"], frames, True)    
    # ci = fake_prob.item()
    _, fake_prob = infer(loaded_models[model_name], frames, True)
    ci = fake_prob.item()
    mongodb["media"].insert_one({
            "access_token": access_token,
            "q_ids": ids,
            "thumb_id": thumb_id_mongo,
            "timestamp": datetime.datetime.utcnow(),
            "prob": ci
        })
    return {
        "status_code": 200,
        "message": "Detect successfully",
        "conf_level_fake": ci
    }

@app.get("/app/v1/image/all/", description="Retrieve all images by user", tags=["auth"])
async def get_all_image(credentials: HTTPAuthorizationCredentials = Depends(security)):
    access_token = credentials.credentials
    try:
        query = mongodb["media"].find(filter = {"access_token": {"$eq": access_token}}, sort = {"timestamp": 1}, projection = {"q_ids": 1}).to_list()
        if len(list(query)) == 0:
            return HTTPException(status_code=404, detail="Cannot find any image")
        # Fetch the stored vector and metadata (payload) from Qdrant
        image_qids = list(map(lambda d: d["q_ids"], query))
        return {
            "message": "Retrieved successfully!",
            "q_ids": image_qids
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/app/v1/image/{image_ids}", description="Retrieve image vector by ID", tags=["auth"])
async def get_image(image_ids: str, credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        access_token = credentials.credentials
        query = mongodb["media"].find(filter = {"access_token": {"$eq": access_token}, "q_ids": {"$eq": image_ids}}).to_list()
        if len(list(query)) == 0:
            return HTTPException(status_code=404, detail="Image not found")
        image_ids = [image_ids[:36], image_ids[36:72], image_ids[72:]] 
        print(image_ids)
        # Fetch the stored vector and metadata (payload) from Qdrant
        response = qdrant_client.retrieve(collection_name=collection_name, ids=image_ids, with_vectors=True, with_payload=True)
        vector = reconstruct_vector(response[i].vector for i in range(3))
        image = vector_to_image(vector)

        buffered = io.BytesIO()
        image.save(buffered, format="PNG")
        img_str = base64.b64encode(buffered.getvalue()).decode("utf-8")

        if response is None:
            raise HTTPException(status_code=404, detail="Image not found")
        response = response[0]
        print(response.payload)
        return {
            "image_data": img_str,
            "metadata": response.payload,
            "message": "Retrieved successfully!"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/app/v1/image/delete/{image_ids}", description="Delete image by ID", tags=["auth"])
async def delete_image(image_ids: str, credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        access_token = credentials.credentials
        query = mongodb["media"].find(filter = {"access_token": {"$eq": access_token}, "q_ids": {"$eq": image_ids}}).to_list()
        if len(list(query)) == 0:
            return HTTPException(status_code=404, detail="Image not found")
        p_iqs = [image_ids[:36], image_ids[36:72], image_ids[72:]] 
        # Fetch the stored vector and metadata (payload) from Qdrant
        qdrant_client.delete(collection_name=collection_name, points_selector=PointIdsList(points=p_iqs))
        mongodb["media"].delete_one({"access_token": access_token, "q_ids": image_ids})
        
        return {
            "message": "Delete successfully!"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/app/v1/detect/{image_ids}", description = "Deepfake detecting", tags=["auth"])
async def detect_image(image_ids: str, credentials: HTTPAuthorizationCredentials = Depends(security), model_name: str = "CapsuleNetV2a"):
    try:
        access_token = credentials.credentials
        query = mongodb["media"].find(filter = {"access_token": {"$eq": access_token}, "q_ids": {"$eq": image_ids}}).to_list()
        if len(list(query)) == 0:
            return HTTPException(status_code=404, detail="Image not found")
        qids = [image_ids[:36], image_ids[36:72], image_ids[72:]] 
        
        response = qdrant_client.retrieve(collection_name=collection_name, ids=qids, with_vectors=True, with_payload=True)
        vector = reconstruct_vector(response[i].vector for i in range(3))

        image = vector_to_image(vector)
        _, fake_prob = infer(loaded_models[model_name], image)
        ci = fake_prob.item()
        mongodb["media"].update_one({"access_token": access_token, "q_ids": image_ids}, {"$set": {"prob": ci}})
        return {
            "status_code": 200,
            "message": "Detect successfully",
            "model_used": model_name,
            "conf_level_fake": ci
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# No auth APIs

@app.post("/app/v1/login/", description = "Login", tags=["no_auth"])
async def login(payload: AuthPayload):
    try:
        query = mongodb["users"].find({"email": {"$eq": payload.email}})
        if len(list(query)) == 0: # not found
            return {"status_code": 404, "message": "User not found"}
        password_db = mongodb["users"].find({"email": {"$eq": payload.email}})[0]["password"]
        hashed_payload = hashlib.sha256(payload.password.encode('utf-8')).hexdigest()
        # print(hashed_payload)
        if hashed_payload != password_db:
            return {"status_code": 401, "message": "Invalid credentials. Wrong password"}
        jwt_token = jwt.encode({"email": payload.email}, SECRET_KEY, algorithm="HS256")
        return {
            "status_code": 200,
            "message": "Login successfully!",
            "jwt_token": jwt_token,
            "access_token": mongodb["access_token"].find({"email": {"$eq": payload.email}}).to_list()[0]["token"]
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/app/v1/register/", description = "Register", tags=["no_auth"])
async def register(payload: AuthPayload):
    try:
        query = mongodb["users"].find({"email": {"$eq": payload.email}})
        if len(list(query)) != 0:
            return {
                "status_code": 409,
                "message": "Email is already in use"
            }
        

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
                "password": hashlib.sha256(payload.password.encode('utf-8')).hexdigest(),
                "type": 0
            })
            server.quit()
        return {
            "status_code": 200,
            "message": "Sent OTP successfully!"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/app/v1/recover/", description = "Recover password", tags=["no_auth"])
async def recover(payload: RecoverPayload):
    try:
        query = mongodb["users"].find({"email": {"$eq": payload.email}})
        if len(list(query)) == 0:
            return {
                "status_code": 404,
                "message": "Email not found"
            }
        
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
                "password": "",
                "type": 1
            })
            server.quit()
        return {
            "status_code": 200,
            "message": "Sent OTP successfully!"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/app/v1/confirm/", description = "OTP confirm", tags=["no_auth"])
async def confirm_otp(payload: ConfirmOTPPayload):
    try:
        query = mongodb["temp_otps"].find(filter = {"email": {"$eq": payload.email}, "type": {"$eq": payload.confirm_type}}).sort("createdAt", -1).to_list()
        if len(list(query)) == 0:
            return {
                "status_code": 404,
                "message": "Email/OTP not found"
            }

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

        #0: Register, 1: ChangePassword
        if payload.confirm_type == 0:
            # Xác nhận thành công OTP, tạo user mới
            temp = list(str(uuid.uuid1()))
            random.shuffle(temp)
            mongodb["users"].insert_one({
                "email": payload.email,
                "password": query[0]["password"]
            })
            mongodb["access_token"].insert_one({
                "email": payload.email,
                "token": hashlib.sha256("".join(temp).encode('utf-8')).hexdigest(),
            })
        elif payload.confirm_type == 1:
            access_token = mongodb["access_token"].find(filter = {"email": {"$eq": payload.email}}).to_list()[0]["token"]

        mongodb["temp_otps"].delete_many({"email": payload.email})
            
        jwt_token = jwt.encode({"email": payload.email}, SECRET_KEY, algorithm="HS256")
        if payload.confirm_type == 0:
            return {
                "status_code": 200,
                "message": "Confirm OTP successfully!",
                "jwt_token": jwt_token,
            }
        return {
            "status_code": 200,
            "message": "Confirm OTP successfully!",
            "jwt_token": jwt_token,
            "access_token": access_token
        } 
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/app/v1/change_password/", description = "Change password", tags=["no_auth"])
async def change_password(payload: ChangePasswordPayload):
    try:
        token_db = mongodb["access_token"].find(filter = {"email": {"$eq": payload.email}}).to_list()[0]["token"]

        if payload.access_token != token_db:
            return {
                "status_code": 401,
                "message": "Wrong access token"
            }

        mongodb["users"].update_one({
            "email": payload.email
        },{
            "$set": {"password": hashlib.sha256(payload.new_password.encode('utf-8')).hexdigest()}
        })
        mongodb["temp_otps"].delete_many({"email": payload.email})
            
        jwt_token = jwt.encode({"email": payload.email}, SECRET_KEY, algorithm="HS256")
        return {
            "status_code": 200,
            "message": "Change password successfully!",
            "jwt_token": jwt_token
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app = "main:app", host = "localhost", port = int(PORT), log_level = "info", reload = True)
