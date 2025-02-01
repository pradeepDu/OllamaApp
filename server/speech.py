import speech_recognition as sr
import sys

def recognize_speech_from_microphone():
    recognizer = sr.Recognizer()
    
    # Using microphone as the audio source
    with sr.Microphone() as source:
      
        audio = recognizer.listen(source)


    try:
        # Recognizing speech using Google's Speech Recognition
       # print("Recognizing...")
        text = recognizer.recognize_google(audio)
        print(f"{text}")
        return text
    except sr.UnknownValueError:
       
        return "Could not understand audio"
    except sr.RequestError as e:
      
        return f"Error: {e}"

# If the script is called directly
if __name__ == "__main__":
    result = recognize_speech_from_microphone()
    sys.stdout.write(result)
