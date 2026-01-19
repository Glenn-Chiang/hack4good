import {useEffect, useRef, useState} from "react";
import {motion} from "motion/react"
import {Mic} from 'lucide-react';

export default function Recorder() {
    const [isRecording, setIsRecording] = useState(false); //recorder on/off
    const [seconds, setSeconds] = useState(0);
    const [permission, setPermission] = useState(false);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [audioUrl, setAudioUrl] = useState<string | null>(null);

    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);

    const options = {
        mimeType: "audio/mp4",
        audioBitsPerSecond: 128_000, // 128 kbps
    };
    useEffect(() => {
        const requestPermission = async () => {
            try {
                const mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
                setStream(mediaStream);
                setPermission(true);
            } catch (err) {
                console.error("Microphone permission denied");
                setPermission(false);
            }
        };

        if (!stream && !permission) {
            requestPermission();
        }
    }, [stream]);

    const startRecording = async() => {
        setIsRecording(true);
        if (!stream) {
            console.error("No media stream found");
            return;
        }
        mediaRecorderRef.current = new MediaRecorder(stream, options);
        setSeconds(0);
        timerRef.current = setInterval(() => {
            setSeconds(prev => prev + 1)}, 1000);
        mediaRecorderRef.current.ondataavailable = (event) => {
            if (typeof event.data === "undefined") return;
            if (event.data.size === 0) return;
            setAudioUrl(URL.createObjectURL(event.data));
        }
        mediaRecorderRef.current.start();
    }
    const stopRecording = async() => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
        }
        setIsRecording(false);
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
    }
    const formatTime = (totalSeconds: number) => {
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const secs = totalSeconds % 60;
        return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(secs).padStart(2,"0")}`
    }

    useEffect(() => {
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, []);

    return (
        <>
            <div className={"flex flex-col justify-center items-center" }>
                <motion.button
                    onClick={() => {
                        if (isRecording) {
                            stopRecording()
                        } else {
                            startRecording()
                        }
                    }}
                    className={`relative w-32 h-32 rounded-full flex items-center justify-center transition-all duration-300 ${
                        isRecording
                            ? 'bg-red-500 hover:bg-red-600'
                            : 'bg-purple-500 hover:bg-purple-600'
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    animate={{
                        backgroundColor: isRecording ? 'rgb(239, 68, 68)' : 'rgb(139, 92, 246)', // red-500 / purple-500
                        boxShadow: isRecording
                            ? [
                                '0 0 0 0 rgba(239, 68, 68, 0.7)',
                                '0 0 0 20px rgba(239, 68, 68, 0)',
                                '0 0 0 0 rgba(239, 68, 68, 0.7)',
                            ]
                            : '0 0 0 0 rgba(0,0,0,0)'
                    }}

                    transition={{
                        backgroundColor: { duration: 0.3 },
                        boxShadow: isRecording
                            ? { duration: 1.5, repeat: Infinity, ease: 'easeInOut' }
                            : { duration: 0.1, ease: 'easeIn' },
                    }}
                >
                    <motion.div
                        animate={isRecording ? {
                            scale: [1, 1.2, 1],
                        } : {}}
                        transition={{
                            duration: 1,
                            repeat: Infinity,
                            ease: 'easeOut'
                        }}
                    >
                        <Mic className="w-16 h-16 p-4 text-white" />
                    </motion.div>
                </motion.button>
                {isRecording && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center mt-4"
                    >
                        <h2 className={"text-lg font-medium text-red-600"}>
                            {formatTime(seconds)}
                        </h2>
                        <p className="text-lg font-medium text-red-600">
                            🎙️ Recording enabled
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                            Voice recording will be included when you save your journal entry
                        </p>
                    </motion.div>
                )}
                {audioUrl && (
                    <audio className="mt-4" src={audioUrl} controls/>
                )}
                {!permission && (
                    <p>
                        Please enable microphone permissions
                    </p>
                )}
            </div>
        </>
    );
}