import { useState } from "react";

export default function SpeechTest() {
    const [isListening, setIsListening] = useState(false);
    const [text, setText] = useState("");
    const [isError, setIsError] = useState("");

    // Vérifier si le navigateur supporte Web Speech API
    const testSpeech = () => {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            setIsError("Ton navigateur ne supporte pas l'API Web Speech");
            return;
        }

        const speechRecognition =  window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new speechRecognition();

         // Configuration
        recognition.lang = "fr-FR";
        recognition.continuous = false;
        recognition.interimResults = false;

        // Quand l'écoute commence
        recognition.onstart = () => {
            setIsListening(true);
            setIsError("");
            setText("");
            console.log("Listening...");
        };

        // Quand un résultat arrive
        recognition.onresult = (event : any) => {
            const speechResult = event.results[0][0].transcript;
            setText(speechResult);
            console.log(speechResult);
            console.log('entendu:', speechResult)
            
        };
        // En cas d'erreur
        recognition.onerror = (event : any) => {
            console.log(event.error);
            if(event.error === "no-speech") {
                setIsError("Aucun son détecté");
            } else if (event.error === "not-allowed") {
                setIsError("Tu dois autoriser l'accès au microphone");
            } else {
                setIsError(`Une erreur est survenue: ${event.error}`);
            }
            setIsListening(false);
        };

        // Quand l'écoute se termine
        recognition.onend = () => {
            setIsListening(false);
            console.log("Microphone désactivé");
        };

        // DÉMARRER L'ÉCOUTE
        recognition.start();
    };



    return (
  <div className="min-h-screen bg-linear-to-b from-blue-100 to-blue-200 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full bg-white rounded-2xl shadow-xl p-8 border-4 border-black">
        
        {/* Titre */}
        <div className="text-center font-bold mb-12">
          <h1 className="text-4xl font-bold uppercase text-gray-800 mb-4">
            🎤 Test Micro
          </h1>
          <p className="text-black text-xl">
            Clique et dis quelque chose en français
          </p>
        </div>

        {/* Bouton Micro */}
        <div className="flex justify-center">
            <button
            onClick={testSpeech}
            disabled={isListening}
            className={`w-full max-w-lg py-8 rounded-xl text-white font-bold text-2xl transition-all transform ${
                isListening
                ? 'bg-red-500 scale-105 animate-pulse cursor-not-allowed'
                : 'bg-blue-500 hover:bg-blue-600'
            }`}
            >
            {isListening ? (
                <span className="flex items-center justify-center gap-3">
                <span className="inline-block w-4 h-4 bg-white rounded-full animate-ping"></span>
                Écoute en cours...
                </span>
            ) : (
                '🎤 Cliquer pour parler'
            )}
            </button>
        </div>

        {/* Résultat */}
        {text && (
          <div className="mt-8 p-6 bg-gray-100 border-2 border-gray-200 rounded-xl">
            <p className="text-md font-semibold text-center text-gray-700 mb-2">
              ✅ Tu as dit :
            </p>
            <p className="text-2xl text-gray-800 font-medium text-center">
              "{text}"
            </p>
          </div>
        )}

        {/* Erreur */}
        {isError && (
          <div className="mt-8 p-6 bg-red-50 border-2 border-red-200 rounded-xl">
            <p className="text-md text-red-700">
              {isError}
            </p>
          </div>
        )}

        {/* Instructions */}
        <div className="mt-12 p-8 rounded-xl">
          <p className="text-lg text-gray-600 font-semibold mb-4">
            📝 Instructions :
          </p>
          <ul className="text-base text-gray-900 space-y-3 pl-4">
            <li>1. Clique sur le bouton bleu</li>
            <li>2. Autorise l'accès au micro si demandé</li>
            <li>3. Dis une phrase pour la transformer en texte</li>
            <li>4. Le résultat apparaîtra dans le bloc gris</li>
          </ul>
        </div>

        {/* debug info */}
        {/* <div className="mt-4 text-center text-xs text-gray-400">
          Navigateur: {navigator.userAgent.split(' ').pop()}
        </div> */}
      </div>
    </div>
  );
}
