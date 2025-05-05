from pydantic import BaseModel
class ImageUploadResponse(BaseModel):
    status_code: int
    message: str
    filename: str
    ids: str
    image_id: str

class AuthPayload(BaseModel):
    email: str
    password: str

class ConfirmOTPPayload(BaseModel):
    email: str
    otp: str
    confirm_type: int

class RecoverPayload(BaseModel):
    email: str

class ChangePasswordPayload(BaseModel):
    email: str
    new_password: str
    access_token: str