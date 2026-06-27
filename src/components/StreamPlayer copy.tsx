"use client";

import React, { useEffect, useRef, useState } from "react";
import { Maximize2, Settings, Pause, Play, RefreshCw } from "lucide-react";
import { StreamItem } from "@/data/mockStreams";

const SRS_CONFIG = {
  API_URL: `http://${process.env.NEXT_PUBLIC_STREAM_API_URL}:1985/rtc/v1/play/`,
  STREAM_URL: `webrtc://${process.env.NEXT_PUBLIC_STREAM_API_URL}/live/livestream`,
};

const formatTime = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
};

export function StreamPlayer({ stream }: { stream: StreamItem }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [isBuffering, setIsBuffering] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // --- ЛОГИКА WEBRTC ---
  const startWebRTC = async () => {
    setIsBuffering(true);
    setErrorMsg(null);

    if (pcRef.current) {
      pcRef.current.close();
    }

    const pc = new RTCPeerConnection();
    pcRef.current = pc;

    pc.addTransceiver("audio", { direction: "recvonly" });
    pc.addTransceiver("video", { direction: "recvonly" });

    pc.ontrack = (event) => {
      if (videoRef.current) {
        videoRef.current.srcObject = event.streams[0];
      }
    };

    try {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      const response = await fetch(SRS_CONFIG.API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          api: SRS_CONFIG.API_URL,
          streamurl: SRS_CONFIG.STREAM_URL,
          sdp: offer.sdp,
        }),
      });

      const data = await response.json();

      if (data.code !== 0) {
        throw new Error(`SRS Error: ${data.code}`);
      }

      await pc.setRemoteDescription(
        new RTCSessionDescription({ type: "answer", sdp: data.sdp })
      );

      if (videoRef.current) {
          try {
              await videoRef.current.play();
              setIsPlaying(true);
          } catch (e) {
              console.warn("Autoplay blocked, user interaction needed");
              setIsPlaying(false);
          }
      }

    } catch (err: any) {
      console.error("WebRTC Error:", err);
      setErrorMsg("Connection Failed");
      setIsBuffering(false);
    }
  };

  useEffect(() => {
    startWebRTC();

    // Очистка при размонтировании
    return () => {
      if (pcRef.current) {
        pcRef.current.close();
        pcRef.current = null;
      }
    };
  }, [stream.id]); // Перезапуск если ID стрима изменился

  // --- ХЕНДЛЕРЫ UI ---

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  const onTimeUpdate = () => {
    if (videoRef.current) setCurrentTime(videoRef.current.currentTime);
  };

  return (
    <div
      ref={containerRef}
      className="w-full h-full bg-neutral-950 relative rounded-lg overflow-hidden border border-neutral-800 flex flex-col group"
    >
      {/* --- VIDEO AREA --- */}
      <div
        className="flex-1 relative flex items-center justify-center bg-black overflow-hidden cursor-pointer"
        onClick={togglePlay}
      >
        <video
          ref={videoRef}
          className="block w-full h-full object-contain"
          // src не нужен, используем srcObject через WebRTC
          muted // Обязательно muted для WebRTC автоплея
          autoPlay
          playsInline
          onTimeUpdate={onTimeUpdate}
          onWaiting={() => setIsBuffering(true)}
          onPlaying={() => setIsBuffering(false)}
          onPause={() => setIsPlaying(false)}
          onPlay={() => setIsPlaying(true)}
        />

        {/* --- ERROR OVERLAY --- */}
        {errorMsg && (
             <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-50">
             <div className="flex flex-col items-center gap-3">
               <p className="text-red-500 font-mono text-sm">{errorMsg}</p>
               <button 
                onClick={(e) => { e.stopPropagation(); startWebRTC(); }}
                className="flex items-center gap-2 px-4 py-2 bg-neutral-800 hover:bg-neutral-700 rounded text-xs text-white transition-colors"
               >
                 <RefreshCw className="w-4 h-4" /> Retry Connection
               </button>
             </div>
           </div>
        )}

        {/* --- LOADING OVERLAY --- */}
        {isBuffering && !errorMsg && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-20 pointer-events-none">
            <div className="flex flex-col items-center gap-3">
              <div className="w-10 h-10 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
              <p className="text-white/80 text-sm font-mono animate-pulse">
                Connecting to Drone...
              </p>
            </div>
          </div>
        )}

        {/* --- PAUSE ICON --- */}
        {!isPlaying && !isBuffering && !errorMsg && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 z-10 pointer-events-none">
            <div className="bg-blue-400/90 py-3 px-5 rounded-sm">
              <Play className="w-8 h-8 text-white fill-current" />
            </div>
          </div>
        )}

        {/* --- LIVE BADGE --- */}
        <div className="absolute top-4 left-4 flex gap-2 z-30 pointer-events-none">
          <div className="bg-red-600 px-2 py-0.5 rounded text-[10px] font-bold text-white shadow-lg flex items-center gap-1">
            <span
              className={`w-1.5 h-1.5 bg-white rounded-full ${
                !isBuffering && isPlaying ? "animate-pulse" : ""
              }`}
            ></span>
            LIVE
          </div>
          <div className="bg-black/60 backdrop-blur-md px-2 py-0.5 rounded text-[10px] text-white font-mono border border-white/10 hidden sm:block">
            WebRTC | Low Latency
          </div>
        </div>
      </div>

      {/* --- CONTROLS BAR --- */}
      <div className="h-14 bg-neutral-900 border-t border-neutral-800 flex items-center justify-between px-4 z-40 shrink-0">
        <div className="flex items-center gap-4">
          <button
            onClick={(e) => { e.stopPropagation(); togglePlay(); }}
            className="text-neutral-300 hover:text-white transition-colors p-1 hover:bg-white/10 rounded"
          >
            {isPlaying ? (
              <Pause className="w-5 h-5 fill-current" />
            ) : (
              <Play className="w-5 h-5 fill-current" />
            )}
          </button>

          <div className="text-xs text-neutral-400 font-mono flex items-center gap-2">
            <span className={isPlaying ? "text-green-500" : "text-red-500"}>
              ●
            </span>
            {formatTime(currentTime)}
          </div>
        </div>

        <div className="flex items-center gap-2">
           {/* Кнопка реконнекта на случай зависания */}
           <button 
            onClick={(e) => { e.stopPropagation(); startWebRTC(); }}
            title="Reconnect Stream"
            className="text-neutral-300 hover:text-white transition-colors p-2 hover:bg-white/10 rounded"
           >
                <RefreshCw className="w-4 h-4" />
           </button>

          <button className="text-neutral-300 hover:text-white transition-colors p-2 hover:bg-white/10 rounded">
            <Settings className="w-5 h-5" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); toggleFullscreen(); }}
            className="text-neutral-300 hover:text-white transition-colors p-2 hover:bg-white/10 rounded"
          >
            <Maximize2 className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}