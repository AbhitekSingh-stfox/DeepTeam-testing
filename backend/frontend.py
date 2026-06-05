import streamlit as st
import requests

st.title("CHAT BOT")

if "messages" not in st.session_state:
    st.session_state.messages = []

for message in st.session_state.messages:
    with st.chat_message(message["role"]):
        st.markdown(message["content"])
    
        if "audio_url" in message:
            st.audio(message["audio_url"])


        if "total_tokens" in message:
             st.caption(
                f"Prompt: {message['prompt_tokens']} | "
                f"Completion: {message['completion_tokens']} | "
                f"Total: {message['total_tokens']}"
            )


audio = st.audio_input("Speak")
prompt = st.chat_input("Enter Text")

if prompt:
    
    st.session_state.messages.append({
        "role" : "user", "content" : prompt
    })

    with st.chat_message("user"):
        st.markdown(prompt)

    
    res = requests.post(
        "http://127.0.0.1:8000/text",
        json={
                "message" : prompt
            }
    ).json()

    response = res["response"]
    prompt_tokens = res["prompt_tokens"]
    completion_tokens = res["completion_tokens"]
    total_tokens = res["total_tokens"]

    st.session_state.messages.append({
        "role" : "assistant", 
        "content" : response,
        "prompt_tokens": prompt_tokens,
        "completion_tokens": completion_tokens,
        "total_tokens": total_tokens
    })

    with st.chat_message("assistant"):
        st.markdown(response)
        st.caption(
        f"Prompt: {prompt_tokens} |"
        f"Completion: {completion_tokens} |"
        f"Total: {total_tokens}"
    )

if audio:
    
    res = requests.post(
        "http://127.0.0.1:8000/voice",
        files={
            "audio" : audio
        }
    ).json()

    transcript= res["transcript"]
    response = res["response"]
    audio_url = f"http://127.0.0.1:8000{res['audio_url']}"
    prompt_tokens = res["prompt_tokens"]
    completion_tokens = res["completion_tokens"]
    total_tokens = res["total_tokens"]

    st.session_state.messages.append({
        "role" : "user",
        "content" : transcript
    })

    with st.chat_message("user"):
        st.markdown(transcript)

    st.session_state.messages.append({
        "role" : "assistant",
        "content" : response,
        "audio_url" : audio_url,
        "prompt_tokens": prompt_tokens,
        "completion_tokens": completion_tokens,
        "total_tokens": total_tokens
    })

    with st.chat_message("assistant"):
        st.markdown(response)
        st.audio(audio_url)

        st.caption(
        f"Prompt: {prompt_tokens} | "
        f"Completion: {completion_tokens} | "
        f"Total: {total_tokens}"
    )



    

