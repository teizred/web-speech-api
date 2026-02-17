import { useSpeechRecognition } from "../hooks/useSpeechRecognition";
import { SpeechHeader } from "./Speech/SpeechHeader";
import { MicButton } from "./Speech/MicButton";
import { SpeechFeedback } from "./Speech/SpeechFeedback";
import { ResultCard } from "./Speech/ResultCard";
import { HistoryList } from "./Speech/HistoryList";

export default function SpeechTest() {
    const {
        isListening,
        text,
        error,
        history,
        startListening,
        stopListening
    } = useSpeechRecognition();

    const handleMicClick = () => {
        if (isListening) {
            stopListening();
        } else {
            startListening();
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50 text-slate-900 font-sans">
            <div className="max-w-md w-full bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100 transition-all duration-300 hover:shadow-2xl">
                
                <SpeechHeader />

                <div className="p-8 flex flex-col items-center space-y-8">
                    
                    <MicButton 
                        isListening={isListening} 
                        onClick={handleMicClick} 
                    />

                    <SpeechFeedback 
                        isListening={isListening} 
                        error={error} 
                    />

                    <ResultCard text={text} />
                    
                </div>

                <HistoryList history={history} />
            </div>
        </div>
    );
}