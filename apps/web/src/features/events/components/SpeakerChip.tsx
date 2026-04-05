import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";

interface SpeakerChipProps {
  fullName: string;
  title?: string;
  bio?: string;
  profileImage?: string;
}

export function SpeakerChip({ fullName, title, bio, profileImage }: SpeakerChipProps) {
  const initials = fullName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-2 group cursor-help transition-all">
            <Avatar className="w-8 h-8 rounded-xl border border-gray-100 shadow-sm group-hover:scale-110 group-hover:border-brand/20 transition-all">
              {profileImage && <AvatarImage src={profileImage} alt={fullName} />}
              <AvatarFallback className="bg-brand/5 text-[10px] font-black text-brand uppercase tracking-widest border-none">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col min-w-0">
               <span className="text-xs font-black text-gray-900 group-hover:text-brand transition-colors truncate">
                 {fullName}
               </span>
               {title && (
                 <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest truncate">
                   {title}
                 </span>
               )}
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent className="p-4 w-64 rounded-2xl shadow-2xl border-gray-100 bg-white">
           <div className="space-y-2">
              <div className="flex items-center gap-3">
                 <Avatar className="w-12 h-12 rounded-xl">
                    {profileImage && <AvatarImage src={profileImage} alt={fullName} />}
                    <AvatarFallback className="bg-brand/10 text-brand font-black">{initials}</AvatarFallback>
                 </Avatar>
                 <div>
                    <p className="text-sm font-black text-gray-900 leading-none mb-1">{fullName}</p>
                    <Badge variant="outline" className="text-[8px] font-black uppercase tracking-[0.2em] text-brand border-brand/20 py-0">{title || "Speaker"}</Badge>
                 </div>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed italic">
                 {bio || "Guest speaker and field expert sharing insights at CEMS."}
              </p>
           </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
