import { useState, useRef, useEffect } from "react";

// Définition de l'interface de retour du hook
interface UseSpeechRecognitionReturn {
    isListening: boolean;   // Indique si le micro est actif
    text: string;           // Le texte transcrit actuel
    error: string | null;   // Message d'erreur éventuel
    history: string[];      // Historique des phrases précédentes
    startListening: () => void; // Fonction pour démarrer l'écoute
    stopListening: () => void;  // Fonction pour arrêter l'écoute
    isSupported: boolean;       // Indique si le navigateur est compatible
}

/**
 * Hook personnalisé pour gérer la reconnaissance vocale (Speech Recognition API)
 * Ce hook encapsule toute la logique complexe de l'API native du navigateur.
 */
export const useSpeechRecognition = (): UseSpeechRecognitionReturn => {
    // --- États (State) ---
    const [isListening, setIsListening] = useState(false);
    const [text, setText] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [history, setHistory] = useState<string[]>([]);
    const [isSupported, setIsSupported] = useState(true);

    // Référence pour stocker l'instance de reconnaissance sans provoquer de re-rendus
    const recognitionRef = useRef<any>(null);

    // Effets
    // Au montage, on vérifie si le navigateur supporte l'API SpeechRecognition
    useEffect(() => {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            setIsSupported(false);
            setError("Oops! Votre navigateur ne supporte pas la reconnaissance vocale.");
        }
    }, []);

    // Fonctions 

    // Démarrer l'écoute
    const startListening = () => {
        if (!isSupported) return;

        // @ts-ignore - Typescript ne connait pas toujours webkitSpeechRecognition
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        recognitionRef.current = recognition;

        // Configuration de la reconnaissance
        recognition.lang = "fr-FR";        // Langue française
        recognition.continuous = false;    // S'arrête après une phrase (change à true pour continu)
        recognition.interimResults = true; // Affiche les résultats partiels en temps réel

        // Événement : L'écoute commence
        recognition.onstart = () => {
            setIsListening(true);
            setError(null);
            // Sauvegarde le texte précédent dans l'historique avant de commencer une nouvelle phrase
            if (text) {
                setHistory(prev => [text, ...prev].slice(0, 5)); // Garde les 5 derniers
                setText("");
            }
        };

        // Événement : Un résultat est détecté
        recognition.onresult = (event: any) => {
            const speechResult = event.results[0][0].transcript;
            setText(speechResult);
        };

        // Événement : Une erreur survient
        recognition.onerror = (event: any) => {
            console.error('Speech recognition error', event.error);
            if (event.error === "no-speech") {
                setError("Aucune parole détectée.");
            } else if (event.error === "not-allowed") {
                setError("Microphone bloqué.");
            } else {
                setError(`Erreur: ${event.error}`);
            }
            setIsListening(false);
        };

        // Événement : L'écoute se termine (automatiquement ou manuellement)
        recognition.onend = () => {
            setIsListening(false);
        };

        // Lancer l'instance
        recognition.start();
    };

    // Arrêter l'écoute manuellement
    const stopListening = () => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
            setIsListening(false);
        }
    };

    // Retourne les états et fonctions pour être utilisés dans les composants
    return {
        isListening,
        text,
        error,
        history,
        startListening,
        stopListening,
        isSupported
    };
};
