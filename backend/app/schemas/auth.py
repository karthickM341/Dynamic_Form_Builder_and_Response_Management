from pydantic import BaseModel, EmailStr, ConfigDict, Field
class RegisterRequest(BaseModel):
    username: str
    email: EmailStr
    password: str
    role: str = "user"
class LoginRequest(BaseModel):
    username: str
    password: str
class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    username: str
    email: EmailStr
    role: str
    is_active: bool

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str = Field(min_length=8, max_length=128)