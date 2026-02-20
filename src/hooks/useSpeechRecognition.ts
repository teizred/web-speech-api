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
 * Mon hook pour gérer la voix avec le navigateur
 * C'est ici que toute la partie "micro" se passe.
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

    // Vérification de la compatibilité du navigateur au démarrage
    useEffect(() => {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            setIsSupported(false);
            setError("Oops! Votre navigateur ne supporte pas la reconnaissance vocale.");
        }
    }, []);

    // Lancer l'écoute
    const startListening = () => {
        if (!isSupported) return;

        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        recognitionRef.current = recognition;

        recognition.lang = "fr-FR";        // On parle en français
        recognition.continuous = false;    
        recognition.interimResults = true; // Pour voir le texte s'afficher en temps réel

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

        // Quand il détecte ce qu'on dit
        recognition.onresult = (event: any) => {
            const speechResult = event.results[0][0].transcript;
            setText(speechResult);
        };

        // Gestion des erreurs (micro bloqué, etc.)
        recognition.onerror = (event: any) => {
            console.error('Erreur micro:', event.error);
            if (event.error === "not-allowed") {
                setError("Microphone bloqué dans tes réglages.");
            } else {
                setError(`Petit souci : ${event.error}`);
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

    // Arrêter l'écoute
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
