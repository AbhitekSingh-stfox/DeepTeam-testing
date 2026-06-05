from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate 
from dotenv import load_dotenv
from fastapi import FastAPI
from pydantic import BaseModel
import json
import asyncio
import tempfile
from faster_whisper import WhisperModel
from fastapi import UploadFile
from gtts import gTTS
import uuid
from fastapi.staticfiles import StaticFiles
from litellm import token_counter
from fastapi.middleware.cors import CORSMiddleware

load_dotenv()

history_path = "data.json"

def write(data):
    with open(history_path,"w") as f:
        json.dump(data,f,indent=5)

def read():
    with open(history_path,"r") as f:
        data = json.load(f)
        if data:
            return data
        else:
            return []
        
file_lock = asyncio.Lock()

Chat_Model = "llama-3.1-8b-instant"
llm = ChatGroq(model = Chat_Model)
whisper = WhisperModel("base", device="cpu")

prompt = ChatPromptTemplate.from_messages([
    (
        "system",
        """
You are Alex, a friendly customer support agent.
Always be polite, concise, and professional.

Conversation history:
{chat_history}
"""
    ),
    ("human", "{question}")
])

chain = prompt | llm 

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins = ["http://localhost:5173"],
    allow_headers = ["*"],
    allow_credentials = True,
    allow_methods = ["*"]
)

app.mount("/audio",StaticFiles(directory="../audio"),name="audio")

class RequiredResponse(BaseModel):
    message : str

@app.post("/text")
async def chat_with_ai(data: RequiredResponse):

    async with file_lock:

        chat_history = read()

        prompt_tokens = token_counter(
            model = Chat_Model,
            messages= [
                {
                    "role" : "user",
                    "content" : data.message
                }
            ]
        )

        response = await chain.ainvoke({
            "chat_history": json.dumps(chat_history),
            "question": data.message
        })

        completion_tokens = token_counter(
            model = Chat_Model,
            messages = [
                {
                    "role" : "assistant",
                    "content" : response.content
                }
            ]
        )

        total_tokens = prompt_tokens + completion_tokens

        chat_history.append({
            "user": data.message,
            "ai": response.content
        })

        write(chat_history)

    return {
        "response": response.content,
        "prompt_tokens" : prompt_tokens,
        "completion_tokens" : completion_tokens,
        "total_tokens" : total_tokens
        }


@app.post("/voice")
async def voicechat_with_ai(audio : UploadFile):

    async with file_lock:

        chat_history = read()

        with tempfile.NamedTemporaryFile(delete=False,suffix=".wav") as f:
            f.write(await audio.read())
            audio_path = f.name

        segments,info = whisper.transcribe(audio_path)

        transcript = ""

        for segment in segments:
            transcript += segment.text
        
        prompt_tokens = token_counter(
            model=Chat_Model,
            messages=[
                {
                "role": "user",
                "content": transcript
                }
            ]
        )
        
        print("TRANSCRIPT:", repr(transcript))

        response = await chain.ainvoke({
            "chat_history" : json.dumps(chat_history),
            "question" : transcript
        })

        completion_tokens = token_counter(
            model=Chat_Model,
            messages=[
                {
                    "role" : "assistant",
                    "content" : response.content
                }
            ]
        )

        total_tokens = prompt_tokens + completion_tokens
        
        audio_file = f"../audio/{uuid.uuid4()}.mp3"

        tts = gTTS(
            text = response.content,
            lang="en",
            slow=False
        )

        tts.save(audio_file)

        chat_history.append({
            "user": transcript,
            "ai": response.content
        })

        write(chat_history)

        return {
        "transcript": transcript,
        "response": response.content,
        "audio_url": f"/{audio_file}",
        "prompt_tokens" : prompt_tokens,
        "completion_tokens" : completion_tokens,
        "total_tokens" : total_tokens
    }