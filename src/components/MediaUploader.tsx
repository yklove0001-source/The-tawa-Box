import React, { useState, useRef, useEffect } from 'react';
import { 
  Camera, 
  Video, 
  Image as ImageIcon, 
  Upload, 
  X, 
  Play, 
  RotateCcw, 
  Check, 
  AlertCircle, 
  Smartphone,
  Film,
  Sparkles
} from 'lucide-react';

interface MediaUploaderProps {
  photoUrls: string[];
  onChangePhotos: (urls: string[]) => void;
  videoUrl: string;
  onChangeVideo: (url: string) => void;
}

export const MediaUploader: React.FC<MediaUploaderProps> = ({
  photoUrls,
  onChangePhotos,
  videoUrl,
  onChangeVideo
}) => {
  const [newPhotoUrl, setNewPhotoUrl] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [cameraModalOpen, setCameraModalOpen] = useState(false);
  const [cameraMode, setCameraMode] = useState<'photo' | 'video'>('photo');
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');

  // Hidden native file input refs
  const photoGalleryInputRef = useRef<HTMLInputElement>(null);
  const videoGalleryInputRef = useRef<HTMLInputElement>(null);
  const photoCameraInputRef = useRef<HTMLInputElement>(null);
  const videoCameraInputRef = useRef<HTMLInputElement>(null);

  // Live camera stream refs
  const videoPreviewRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<any>(null);

  // Handle file uploads (converts file to base64 Data URL)
  const processImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (result) {
        onChangePhotos([...photoUrls, result]);
      }
    };
    reader.readAsDataURL(file);
  };

  const processVideoFile = (file: File) => {
    if (!file.type.startsWith('video/')) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (result) {
        onChangeVideo(result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handlePhotoGalleryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).forEach((file: File) => processImageFile(file));
    e.target.value = '';
  };

  const handleVideoGalleryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    processVideoFile(files[0]);
    e.target.value = '';
  };

  const handleDirectCameraPhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    processImageFile(files[0]);
    e.target.value = '';
  };

  const handleDirectCameraVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    processVideoFile(files[0]);
    e.target.value = '';
  };

  // Drag & Drop
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const files = e.dataTransfer.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file: File) => {
      if (file.type.startsWith('image/')) {
        processImageFile(file);
      } else if (file.type.startsWith('video/')) {
        processVideoFile(file);
      }
    });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  // Live Camera Stream Setup
  const startLiveCamera = async (mode: 'photo' | 'video' = 'photo') => {
    setCameraMode(mode);
    setCameraError(null);
    setCameraModalOpen(true);
    setIsRecording(false);
    setRecordSeconds(0);

    try {
      const constraints: MediaStreamConstraints = {
        video: { facingMode: facingMode, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: mode === 'video'
      };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      setCameraStream(stream);
      if (videoPreviewRef.current) {
        videoPreviewRef.current.srcObject = stream;
        videoPreviewRef.current.play().catch(() => {});
      }
    } catch (err: any) {
      console.warn('Live camera stream not available, falling back to native file camera:', err);
      setCameraError('Direct browser camera access was blocked or is unavailable. Please use the device camera option.');
    }
  };

  // Switch between front/back camera in live modal
  const toggleFacingMode = async () => {
    const newMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(newMode);
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: newMode },
        audio: cameraMode === 'video'
      });
      setCameraStream(stream);
      if (videoPreviewRef.current) {
        videoPreviewRef.current.srcObject = stream;
        videoPreviewRef.current.play().catch(() => {});
      }
    } catch (err) {
      console.error('Camera switch error', err);
    }
  };

  // Close live camera modal
  const closeLiveCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    if (isRecording && mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
    }
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }
    setIsRecording(false);
    setCameraModalOpen(false);
  };

  // Take Snapshot from live camera
  const capturePhotoSnapshot = () => {
    if (!videoPreviewRef.current) return;
    const video = videoPreviewRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
    onChangePhotos([...photoUrls, dataUrl]);
    closeLiveCamera();
  };

  // Start Video Recording in live modal
  const startRecording = () => {
    if (!cameraStream) return;
    recordedChunksRef.current = [];
    try {
      const options = { mimeType: 'video/webm;codecs=vp9' };
      const recorder = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
        ? new MediaRecorder(cameraStream, options)
        : new MediaRecorder(cameraStream);

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          recordedChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
        const reader = new FileReader();
        reader.onload = () => {
          if (reader.result) {
            onChangeVideo(reader.result as string);
          }
        };
        reader.readAsDataURL(blob);
      };

      recorder.start(500);
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
      setRecordSeconds(0);

      timerIntervalRef.current = setInterval(() => {
        setRecordSeconds(s => {
          if (s >= 59) {
            stopRecording();
            return 60;
          }
          return s + 1;
        });
      }, 1000);
    } catch (err) {
      console.error('Recording error', err);
    }
  };

  // Stop Video Recording
  const stopRecording = () => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
    setTimeout(() => {
      closeLiveCamera();
    }, 400);
  };

  // Photo management
  const handleRemovePhoto = (index: number) => {
    onChangePhotos(photoUrls.filter((_, i) => i !== index));
  };

  const handleSetCoverPhoto = (index: number) => {
    if (index === 0) return;
    const target = photoUrls[index];
    const rest = photoUrls.filter((_, i) => i !== index);
    onChangePhotos([target, ...rest]);
  };

  const handleAddUrl = () => {
    if (newPhotoUrl.trim()) {
      onChangePhotos([...photoUrls, newPhotoUrl.trim()]);
      setNewPhotoUrl('');
    }
  };

  const handlePresetPhoto = (url: string) => {
    if (!photoUrls.includes(url)) {
      onChangePhotos([...photoUrls, url]);
    }
  };

  return (
    <div id="media-upload-section" className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
      
      {/* Hidden File Inputs for Native Camera and Gallery Access */}
      <input 
        ref={photoGalleryInputRef}
        type="file" 
        accept="image/*" 
        multiple 
        className="hidden" 
        onChange={handlePhotoGalleryChange} 
      />
      <input 
        ref={videoGalleryInputRef}
        type="file" 
        accept="video/*" 
        className="hidden" 
        onChange={handleVideoGalleryChange} 
      />
      <input 
        ref={photoCameraInputRef}
        type="file" 
        accept="image/*" 
        capture="environment" 
        className="hidden" 
        onChange={handleDirectCameraPhotoChange} 
      />
      <input 
        ref={videoCameraInputRef}
        type="file" 
        accept="video/*" 
        capture="environment" 
        className="hidden" 
        onChange={handleDirectCameraVideoChange} 
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center font-black text-sm shadow-sm">
            1
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
              Property Photos & Video
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                {photoUrls.length} Photo{photoUrls.length === 1 ? '' : 's'}{videoUrl ? ' + 1 Video' : ''}
              </span>
            </h2>
            <p className="text-xs text-slate-500">
              Upload from your phone/computer gallery or snap directly with your camera
            </p>
          </div>
        </div>

        <div className="text-right hidden sm:block">
          <span className="text-xs font-semibold text-slate-400">First image will be the public cover</span>
        </div>
      </div>

      {/* Primary Action Buttons: Gallery + Camera for Photo & Video */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        
        {/* 1. Photo Gallery Option */}
        <button
          type="button"
          onClick={() => photoGalleryInputRef.current?.click()}
          className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border-2 border-dashed border-blue-200 bg-blue-50/50 hover:bg-blue-100/60 hover:border-blue-400 transition text-slate-800 text-center cursor-pointer group"
        >
          <div className="w-11 h-11 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md group-hover:scale-105 transition">
            <ImageIcon className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900">Photo Gallery</div>
            <div className="text-[10px] text-slate-500">Upload multiple photos</div>
          </div>
        </button>

        {/* 2. Camera Option for Photos */}
        <button
          type="button"
          onClick={() => {
            // Attempt live camera first; fallback to native camera file input
            if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
              startLiveCamera('photo');
            } else {
              photoCameraInputRef.current?.click();
            }
          }}
          className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border-2 border-dashed border-emerald-200 bg-emerald-50/50 hover:bg-emerald-100/60 hover:border-emerald-400 transition text-slate-800 text-center cursor-pointer group"
        >
          <div className="w-11 h-11 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md group-hover:scale-105 transition">
            <Camera className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900">Take Photo</div>
            <div className="text-[10px] text-slate-500">Use device camera</div>
          </div>
        </button>

        {/* 3. Video Gallery Option */}
        <button
          type="button"
          onClick={() => videoGalleryInputRef.current?.click()}
          className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border-2 border-dashed border-purple-200 bg-purple-50/50 hover:bg-purple-100/60 hover:border-purple-400 transition text-slate-800 text-center cursor-pointer group"
        >
          <div className="w-11 h-11 rounded-2xl bg-purple-600 text-white flex items-center justify-center shadow-md group-hover:scale-105 transition">
            <Film className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900">Video Gallery</div>
            <div className="text-[10px] text-slate-500">Choose MP4 / MOV</div>
          </div>
        </button>

        {/* 4. Record Video with Camera */}
        <button
          type="button"
          onClick={() => {
            if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
              startLiveCamera('video');
            } else {
              videoCameraInputRef.current?.click();
            }
          }}
          className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border-2 border-dashed border-rose-200 bg-rose-50/50 hover:bg-rose-100/60 hover:border-rose-400 transition text-slate-800 text-center cursor-pointer group"
        >
          <div className="w-11 h-11 rounded-2xl bg-rose-600 text-white flex items-center justify-center shadow-md group-hover:scale-105 transition">
            <Video className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900">Record Video</div>
            <div className="text-[10px] text-slate-500">Shoot walkthrough</div>
          </div>
        </button>

      </div>

      {/* Drag & Drop Box */}
      <div 
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`border-2 border-dashed rounded-2xl p-4 text-center transition-all ${
          dragOver 
            ? 'border-blue-600 bg-blue-50/80 scale-[1.01]' 
            : 'border-slate-200 bg-slate-50/60 hover:bg-slate-50'
        }`}
      >
        <div className="flex items-center justify-center gap-2 text-xs text-slate-600 font-medium">
          <Upload className="w-4 h-4 text-blue-600" />
          <span>Drag and drop property photos or video anywhere here, or tap above to browse</span>
        </div>
      </div>

      {/* Uploaded Photos Grid */}
      {photoUrls.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Uploaded Photos ({photoUrls.length})
            </span>
            <span className="text-[11px] text-slate-500">Tap "Make Cover" to set main photo</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {photoUrls.map((url, index) => (
              <div 
                key={index} 
                className={`relative aspect-4/3 rounded-2xl overflow-hidden border group bg-slate-100 ${
                  index === 0 ? 'border-blue-600 ring-2 ring-blue-600/30 shadow-md' : 'border-slate-200'
                }`}
              >
                <img 
                  src={url} 
                  alt={`Property photo ${index + 1}`} 
                  className="w-full h-full object-cover" 
                />

                {index === 0 ? (
                  <span className="absolute top-2 left-2 bg-blue-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-sm flex items-center gap-1">
                    <Check className="w-3 h-3" />
                    Cover Photo
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleSetCoverPhoto(index)}
                    className="absolute top-2 left-2 bg-slate-900/80 hover:bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full transition opacity-0 group-hover:opacity-100 cursor-pointer"
                  >
                    Make Cover
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => handleRemovePhoto(index)}
                  className="absolute top-2 right-2 bg-slate-900/80 hover:bg-red-600 text-white p-1.5 rounded-full transition cursor-pointer"
                  title="Remove Photo"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Uploaded Video Section */}
      {videoUrl && (
        <div className="p-4 bg-purple-50/70 border border-purple-200 rounded-2xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-purple-900 flex items-center gap-1.5">
              <Film className="w-4 h-4 text-purple-600" />
              Property Walkthrough Video Attached
            </span>
            <button
              type="button"
              onClick={() => onChangeVideo('')}
              className="text-xs text-red-600 hover:text-red-700 font-bold flex items-center gap-1 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              Remove Video
            </button>
          </div>

          <div className="aspect-video max-w-md mx-auto rounded-xl overflow-hidden bg-black shadow-md">
            <video 
              src={videoUrl} 
              controls 
              className="w-full h-full object-contain"
            />
          </div>
        </div>
      )}

      {/* URL Input & Quick Presets Toggle */}
      <div className="pt-2 border-t border-slate-100 space-y-3">
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="url"
            value={newPhotoUrl}
            onChange={(e) => setNewPhotoUrl(e.target.value)}
            placeholder="Or paste an image web link (https://...)"
            className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-hidden focus:border-blue-600"
          />
          <button
            type="button"
            onClick={handleAddUrl}
            className="bg-slate-800 hover:bg-slate-900 text-white px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer"
          >
            Add URL
          </button>
        </div>

        {/* One-click presets for quick testing */}
        <div>
          <span className="text-[11px] font-semibold text-slate-400 block mb-1.5">
            Quick property preset samples:
          </span>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => handlePresetPhoto('https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80')}
              className="text-[11px] bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1 rounded-lg font-medium cursor-pointer"
            >
              + Modern House
            </button>
            <button
              type="button"
              onClick={() => handlePresetPhoto('https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80')}
              className="text-[11px] bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1 rounded-lg font-medium cursor-pointer"
            >
              + Luxury Apartment
            </button>
            <button
              type="button"
              onClick={() => handlePresetPhoto('https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80')}
              className="text-[11px] bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1 rounded-lg font-medium cursor-pointer"
            >
              + Open Land / Plot
            </button>
            <button
              type="button"
              onClick={() => onChangeVideo('https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4')}
              className="text-[11px] bg-purple-100 hover:bg-purple-200 text-purple-800 px-2.5 py-1 rounded-lg font-medium cursor-pointer"
            >
              + Sample Video Tour
            </button>
          </div>
        </div>
      </div>

      {/* Live Camera Viewfinder Modal */}
      {cameraModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col text-white">
            
            {/* Modal Top Bar */}
            <div className="flex items-center justify-between p-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                {cameraMode === 'photo' ? (
                  <Camera className="w-5 h-5 text-emerald-400" />
                ) : (
                  <Video className="w-5 h-5 text-rose-400" />
                )}
                <span className="font-bold text-sm">
                  {cameraMode === 'photo' ? 'Capture Property Photo' : 'Record Property Video'}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={toggleFacingMode}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                  title="Switch Front / Back Camera"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={closeLiveCamera}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Viewfinder Stream Screen */}
            <div className="relative aspect-4/3 bg-black flex items-center justify-center overflow-hidden">
              {cameraError ? (
                <div className="p-6 text-center space-y-3">
                  <AlertCircle className="w-8 h-8 text-amber-400 mx-auto" />
                  <p className="text-xs text-slate-300">{cameraError}</p>
                  <div className="flex justify-center gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        closeLiveCamera();
                        if (cameraMode === 'photo') {
                          photoCameraInputRef.current?.click();
                        } else {
                          videoCameraInputRef.current?.click();
                        }
                      }}
                      className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs"
                    >
                      Open Native Camera
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <video 
                    ref={videoPreviewRef}
                    autoPlay 
                    playsInline 
                    muted={cameraMode === 'photo' || !isRecording}
                    className="w-full h-full object-cover"
                  />

                  {/* Crosshair guide overlay */}
                  <div className="absolute inset-8 border border-white/20 rounded-2xl pointer-events-none" />

                  {/* Recording indicator */}
                  {isRecording && (
                    <div className="absolute top-4 left-4 bg-red-600 text-white text-xs font-mono font-bold px-3 py-1 rounded-full flex items-center gap-2 animate-pulse">
                      <span className="w-2 h-2 rounded-full bg-white" />
                      REC 00:{recordSeconds < 10 ? `0${recordSeconds}` : recordSeconds} / 01:00
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Bottom Controls */}
            <div className="p-5 flex items-center justify-around bg-slate-950/80">
              
              {cameraMode === 'photo' ? (
                <button
                  type="button"
                  onClick={capturePhotoSnapshot}
                  disabled={!!cameraError}
                  className="w-16 h-16 rounded-full bg-white text-slate-950 flex items-center justify-center p-1 shadow-lg hover:scale-105 active:scale-95 transition disabled:opacity-50 cursor-pointer ring-4 ring-emerald-500/50"
                  title="Snap Photo"
                >
                  <div className="w-12 h-12 rounded-full bg-emerald-500 flex items-center justify-center">
                    <Camera className="w-6 h-6 text-white" />
                  </div>
                </button>
              ) : (
                <div className="flex items-center gap-4">
                  {!isRecording ? (
                    <button
                      type="button"
                      onClick={startRecording}
                      disabled={!!cameraError}
                      className="w-16 h-16 rounded-full bg-white flex items-center justify-center p-1 shadow-lg hover:scale-105 active:scale-95 transition disabled:opacity-50 cursor-pointer ring-4 ring-rose-500/50"
                      title="Start Recording Video"
                    >
                      <div className="w-12 h-12 rounded-full bg-rose-600 flex items-center justify-center">
                        <Video className="w-6 h-6 text-white" />
                      </div>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={stopRecording}
                      className="px-6 py-3 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-black text-sm flex items-center gap-2 shadow-lg transition active:scale-95 cursor-pointer"
                    >
                      <div className="w-3 h-3 bg-white rounded-xs animate-pulse" />
                      Stop & Save Video
                    </button>
                  )}
                </div>
              )}

              {/* Mode switch */}
              <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => {
                    if (isRecording) stopRecording();
                    startLiveCamera('photo');
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                    cameraMode === 'photo' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Photo
                </button>
                <button
                  type="button"
                  onClick={() => {
                    startLiveCamera('video');
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                    cameraMode === 'video' ? 'bg-rose-500 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Video
                </button>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
};
