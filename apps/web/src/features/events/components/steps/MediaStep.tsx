import { Image as ImageIcon, Upload, X, FileCode, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useRef } from "react";
import { EventFormData } from "../EventCreateWizard";
import { WizardSection } from "../wizard/WizardSection";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface MediaStepProps {
  data: EventFormData;
  onUpdate: (data: Partial<EventFormData>) => void;
}

export function MediaStep({ data, onUpdate }: MediaStepProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const thumbnail = data.thumbnailUrl;

  const handleFile = async (file: File) => {
    try {
      setIsUploading(true);
      toast.loading("Uploading thumbnail...", { id: "media-upload" });
      
      const uploadedUrl = await uploadToCloudinary(file);
      
      onUpdate({ thumbnailUrl: uploadedUrl });
      toast.success("Thumbnail uploaded successfully", { id: "media-upload" });
    } catch (error: any) {
      toast.error(error.message || "Failed to upload thumbnail", { id: "media-upload" });
    } finally {
      setIsUploading(false);
    }
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => {
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      handleFile(file);
    }
  };

  return (
    <div className="space-y-12">
      <WizardSection 
        icon={ImageIcon} 
        title="Visual Identity" 
        subtitle="Upload a thumbnail to make your event stand out"
      >
        <div 
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          className={cn(
            "relative aspect-video rounded-xl border-2 border-dashed transition-all duration-500 overflow-hidden group",
            thumbnail 
              ? "border-brand shadow-2xl shadow-brand/10" 
              : isDragging 
                ? "border-brand bg-brand/5 scale-[1.01]" 
                : "border-gray-100 bg-gray-50/30 hover:bg-white hover:border-brand/30"
          )}
        >
          {thumbnail ? (
            <>
              <img 
                src={thumbnail} 
                alt="Thumbnail Preview" 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 backdrop-blur-[2px]">
                <button 
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-12 h-12 rounded-2xl bg-white text-gray-900 flex items-center justify-center shadow-xl hover:scale-110 active:scale-95 transition-all"
                >
                  <Upload size={18} />
                </button>
                <button 
                  type="button"
                  onClick={() => onUpdate({ thumbnailUrl: "" })}
                  className="w-12 h-12 rounded-2xl bg-red-500 text-white flex items-center justify-center shadow-xl hover:scale-110 active:scale-95 transition-all"
                >
                  <X size={18} />
                </button>
              </div>
              <div className="absolute top-6 left-6 flex items-center gap-2 bg-white/90 backdrop-blur-md px-4 py-2 rounded-xl shadow-sm border border-white/20">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[9px] font-black text-gray-900 uppercase tracking-widest">Optimized & Ready</span>
              </div>
            </>
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center">
              <div className="w-24 h-24 rounded-xl bg-white shadow-2xl shadow-gray-200/50 flex items-center justify-center mb-8 border border-gray-50 group-hover:scale-110 transition-transform duration-500">
                {isUploading ? (
                    <Loader2 className="text-brand animate-spin" size={32} />
                ) : (
                    <Upload className="text-brand/40 group-hover:text-brand transition-colors" size={32} />
                )}
              </div>
              <h4 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-2">
                  {isUploading ? "Uploading..." : "Drop your masterpiece here"}
              </h4>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter max-w-[240px] leading-relaxed">
                Supports High-Res PNG, JPG or WebP. <br/> Minimum 1280x720 recommended.
              </p>
              <button 
                type="button"
                disabled={isUploading}
                onClick={() => fileInputRef.current?.click()}
                className="mt-8 px-8 py-3.5 rounded-2xl bg-gray-900 text-white font-black text-[10px] uppercase tracking-widest hover:bg-brand transition-all shadow-xl shadow-gray-200 active:scale-95 disabled:opacity-50"
              >
                {isUploading ? "Please Wait..." : "Browse Files"}
              </button>
            </div>
          )}
          <input 
            type="file" 
            ref={fileInputRef}
            className="hidden" 
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
            }}
          />
        </div>
      </WizardSection>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="p-8 bg-brand/5 rounded-xl border border-brand/10 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-brand text-white flex items-center justify-center shadow-sm">
              <Info size={14} />
            </div>
            <h4 className="text-[10px] font-black text-gray-900 uppercase tracking-widest">Visual Guidelines</h4>
          </div>
          <ul className="space-y-3">
            {[
              "Clear, high-contrast imagery works best",
              "Avoid too much text in the thumbnail",
              "Feature people or key event highlights",
              "Brand colors maintain consistency"
            ].map((tip, i) => (
              <li key={i} className="flex items-center gap-2">
                <div className="w-1 h-1 rounded-full bg-brand" />
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-tighter">{tip}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="p-8 bg-gray-50/50 rounded-xl border border-gray-100 space-y-4 flex flex-col justify-center">
           <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gray-900 text-white flex items-center justify-center shadow-sm">
              <FileCode size={14} />
            </div>
            <h4 className="text-[10px] font-black text-gray-900 uppercase tracking-widest">Technical Specs</h4>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Max Size</p>
              <p className="text-xs font-black text-gray-900">5.0 MB</p>
            </div>
            <div>
              <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Ratio</p>
              <p className="text-xs font-black text-gray-900">16:9 Aspect</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
