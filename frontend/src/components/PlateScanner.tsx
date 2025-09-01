import React, { useEffect, useRef, useState } from "react";
import { X, Camera, ScanLine } from "lucide-react";
import { normalizePlate } from "../utils/plate";

// Lazy-load tesseract to keep bundle small
async function ocrImage(dataUrl: string) {
  const Tesseract = await import("tesseract.js");
  const res = await Tesseract.recognize(dataUrl, "eng", {
    tessedit_char_whitelist: "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 ",
  } as any);
  return res.data.text || "";
}

interface PlateScannerProps {
  onDetected: (plate: string) => void;
  onClose: () => void;
}

export const PlateScanner: React.FC<PlateScannerProps> = ({ onDetected, onClose }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: "environment" } }, audio: false
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
      } catch (e: any) {
        setErr(e?.message || "Camera access denied");
      }
    })();
    return () => {
      streamRef.current?.getTracks().forEach(t => t.stop());
    };
  }, []);

  const capture = async () => {
    if (!videoRef.current) return;
    setBusy(true); setErr(null);
    try {
      const v = videoRef.current;
      const c = document.createElement("canvas");
      const w = v.videoWidth || 1280;
      const h = v.videoHeight || 720;
      c.width = w; c.height = h;
      const ctx = c.getContext("2d");
      if (!ctx) throw new Error("Canvas not supported");
      ctx.drawImage(v, 0, 0, w, h);
      const dataUrl = c.toDataURL("image/png");

      const raw = await ocrImage(dataUrl);
      const plate = normalizePlate(raw);
      if (!plate) throw new Error("No text detected. Try again with better lighting.");
      onDetected(plate);
      onClose();
    } catch (e: any) {
      setErr(e?.message || "OCR failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <div className="flex items-center gap-2">
            <ScanLine className="h-5 w-5 text-blue-600" />
            <h3 className="font-semibold">Scan Plate</h3>
          </div>
          <button onClick={onClose} className="p-2 text-gray-500 hover:text-gray-700">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-4 space-y-3">
          <video ref={videoRef} className="w-full rounded-xl border" playsInline muted autoPlay />
          {err && <div className="text-sm text-red-600">{err}</div>}
          <div className="flex justify-end">
            <button
              onClick={capture}
              disabled={busy}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white disabled:opacity-50"
            >
              <Camera className="h-4 w-4" />
              {busy ? "Scanning..." : "Capture & OCR"}
            </button>
          </div>
          <p className="text-xs text-gray-500">
            Tip: Fill the frame with the plate and avoid glare. Works on HTTPS or localhost.
          </p>
        </div>
      </div>
    </div>
  );
};
