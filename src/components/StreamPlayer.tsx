"use client";

import React, { useEffect, useRef, useState } from "react";
import { Maximize2, Settings, Pause, Play, RefreshCw } from "lucide-react";
import { StreamItem } from "@/data/mockStreams";

const formatTime = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
};

interface StreamPlayerProps {
  stream: StreamItem;
  onMetricsUpdate?: (metrics: { bitrate: number; latency: number, fps: number }) => void;
}

export function StreamPlayer({ stream, onMetricsUpdate }: StreamPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [isBuffering, setIsBuffering] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // --- СОСТОЯНИЕ ДЛЯ МЕТРИК ---
  const [metrics, setMetrics] = useState({ bitrate: 0, latency: 0 });
  const lastBytesRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);

  // --- ЛОГИКА СБОРА СТАТИСТИКИ ---
  const updateStats = async () => {
    if (!pcRef.current || pcRef.current.iceConnectionState !== "connected") return;

    try {
      const stats = await pcRef.current.getStats();
      stats.forEach((report) => {
        if (report.type === "inbound-rtp" && report.kind === "video") {
          const now = performance.now();
          const bytes = report.bytesReceived;

          if (lastTimeRef.current) {
            // Считаем Bitrate (Mbps)
            const deltaBytes = bytes - lastBytesRef.current;
            const deltaTime = now - lastTimeRef.current;
            const bitrate = (deltaBytes * 8) / (deltaTime * 1000); 
            const fps = report.framesPerSecond || 0;

            // Считаем Latency (jitter buffer delay)
            const latency = report.jitterBufferDelay 
              ? (report.jitterBufferDelay / report.jitterBufferEmittedCount) * 1000 
              : 0;

              const newMetrics = {
                bitrate: Math.max(0, Number(bitrate.toFixed(2))),
                latency: Math.round(latency),
                fps: Math.round(fps)
              };

            setMetrics(newMetrics);
          
            if (onMetricsUpdate) {
              onMetricsUpdate(newMetrics);
            }
          }

          lastBytesRef.current = bytes;
          lastTimeRef.current = now;
        }
      });
    } catch (e) {
      console.warn("Failed to fetch stats", e);
    }
  };

  // Таймер для обновления статистики
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying && !isBuffering) {
      interval = setInterval(updateStats, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, isBuffering]);

  // --- ЛОГИКА WEBRTC ---
  const startWebRTC = async () => {
    const apiUrl = `http://${process.env.NEXT_PUBLIC_STREAM_API_URL}:1985/rtc/v1/play/`;
    const streamUrl = `webrtc://${process.env.NEXT_PUBLIC_STREAM_API_URL}/live/livestream`;

    setIsBuffering(true);
    setErrorMsg(null);
    setMetrics({ bitrate: 0, latency: 0 }); // Сброс при реконнекте

    if (pcRef.current) {
      pcRef.current.close();
    }

    const pc = new RTCPeerConnection();
    pcRef.current = pc;

    const videoTransceiver = pc.addTransceiver("video", { direction: "recvonly" });

    const receiver = videoTransceiver.receiver as any;
    if (receiver && 'playoutDelayHint' in receiver) {
        receiver.playoutDelayHint = 0;
    }

    pc.ontrack = (event) => {
      if (videoRef.current) {
        videoRef.current.srcObject = event.streams[0];
      }
    };

    pc.oniceconnectionstatechange = () => {
      if (pc.iceConnectionState === "failed") {
        setErrorMsg("Connection Failed");
        setIsBuffering(false);
      }
    };

    try {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          api: apiUrl,
          streamurl: streamUrl,
          sdp: offer.sdp,
        }),
      });

      const data = await response.json();
      if (data.code !== 0) throw new Error(`SRS Error: ${data.code}`);

      await pc.setRemoteDescription(new RTCSessionDescription({ type: "answer", sdp: data.sdp }));

      if (videoRef.current) {
        try {
          await videoRef.current.play();
          setIsPlaying(true);
        } catch (e) {
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
    return () => {
      if (pcRef.current) pcRef.current.close();
      if (videoRef.current) videoRef.current.srcObject = null;
    };
  }, [stream.id]); 

  const togglePlay = () => {
    if (!videoRef.current) return;
    isPlaying ? videoRef.current.pause() : videoRef.current.play();
    setIsPlaying(!isPlaying);
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    !document.fullscreenElement ? containerRef.current.requestFullscreen() : document.exitFullscreen();
  };

  return (
    <div
      ref={containerRef}
      className="w-full aspect-video bg-neutral-950 relative rounded-lg overflow-hidden border border-neutral-800 flex flex-col group"
    >
      <div className="flex-1 relative flex items-center justify-center bg-black overflow-hidden cursor-pointer" onClick={togglePlay}>
        <video
          ref={videoRef}
          className="block w-full h-full object-contain"
          muted autoPlay playsInline
          onTimeUpdate={() => videoRef.current && setCurrentTime(videoRef.current.currentTime)}
          onWaiting={() => setIsBuffering(true)}
          onPlaying={() => setIsBuffering(false)}
        />

        {/* --- ERROR OVERLAY --- */}
        {errorMsg && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-50 text-center p-4">
            <div className="flex flex-col items-center gap-3">
              <p className="text-red-500 font-mono text-sm">{errorMsg}</p>
              <button onClick={(e) => { e.stopPropagation(); startWebRTC(); }} className="flex items-center gap-2 px-4 py-2 bg-neutral-800 hover:bg-neutral-700 rounded text-xs text-white">
                <RefreshCw className="w-4 h-4" /> Retry
              </button>
            </div>
          </div>
        )}

        {/* --- LOADING --- */}
        {isBuffering && !errorMsg && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-20">
             <div className="w-10 h-10 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* --- ИНДИКАТОРЫ ВЕРХУ --- */}
        <div className="absolute top-4 left-4 flex gap-2 z-30 pointer-events-none">
          <div className="bg-red-600 px-2 py-0.5 rounded text-[10px] font-bold text-white flex items-center gap-1">
            <span className={`w-1.5 h-1.5 bg-white rounded-full ${isPlaying ? "animate-pulse" : ""}`}></span>
            LIVE
          </div>
          
          {/* ВЫВОД МЕТРИК */}
          {/* {!isBuffering && isPlaying && (
            <div className="bg-black/60 backdrop-blur-md px-2 py-0.5 rounded text-[10px] text-white font-mono border border-white/10 flex gap-3">
              <span className="flex items-center gap-1">
                LAT: <span className={metrics.latency > 150 ? "text-red-400" : "text-green-400"}>{metrics.latency}ms</span>
              </span>
              <span className="flex items-center gap-1">
                BIT: <span className="text-blue-400">{metrics.bitrate} Mbps</span>
              </span>
            </div>
          )} */}
        </div>
      </div>

      {/* --- CONTROLS --- */}
      <div className="h-14 bg-neutral-900 border-t border-neutral-800 flex items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <button onClick={(e) => { e.stopPropagation(); togglePlay(); }} className="text-neutral-300 hover:text-white">
            {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current" />}
          </button>
          <div className="text-xs text-neutral-400 font-mono">
            {formatTime(currentTime)}
          </div>
        </div>
        <div className="flex items-center gap-2">
           <button onClick={(e) => { e.stopPropagation(); startWebRTC(); }} className="text-neutral-300 hover:text-white p-2">
              <RefreshCw className="w-4 h-4" />
           </button>
          <button onClick={(e) => { e.stopPropagation(); toggleFullscreen(); }} className="text-neutral-300 hover:text-white p-2">
            <Maximize2 className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}