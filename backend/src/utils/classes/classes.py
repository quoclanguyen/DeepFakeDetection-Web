from pydantic import BaseModel
class ImageUploadResponse(BaseModel):
    message: str
    filename: str
    ids: str
    image_id: str

class LoginPayload(BaseModel):
    email: str
    password: str

class RegisterPayload(BaseModel):
    email: str
    password: str

class ConfirmRegisterPayload(BaseModel):
    email: str
    otp: str