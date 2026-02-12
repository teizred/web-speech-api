import { useState } from "react";

export default function SpeechTest() {
    const [isListening, setIsListening] = useState(false);
    const [text, setText] = useState("");
    const [isError, setIsError] = useState("");

    

    return (
    <div className="flex flex-col gap-4 ">
        <p >{text}</p>
        <button className="cursor-pointer" onClick={() => setIsListening(!isListening)}>{isListening ? "Stop" : "Start"}</button>
        <p>{isError}</p>
    </div>
)   
}
