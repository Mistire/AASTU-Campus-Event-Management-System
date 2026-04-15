import { Globe, Lock, Mail, Users, Trash2, FileUp, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { InputController } from "@/components/shared/InputController";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { EventFormData } from "../EventCreateWizard";
import { WizardSection } from "../wizard/WizardSection";

interface AccessStepProps {
  data: EventFormData;
  onUpdate: (data: Partial<EventFormData>) => void;
}

export function AccessStep({ data, onUpdate }: AccessStepProps) {
  const [emailInput, setEmailInput] = useState("");
  const accessType = data.accessType || "PUBLIC";
  const invites = data.invites || [];

  const updateAccess = (type: string) => {
    onUpdate({ accessType: type });
  };

  const addInvite = (email: string) => {
    const trimmed = email.trim();
    if (trimmed && !invites.includes(trimmed)) {
      onUpdate({ invites: [...invites, trimmed] });
    }
    setEmailInput("");
  };

  const removeInvite = (email: string) => {
    onUpdate({ invites: invites.filter((e: string) => e !== email) });
  };

  const handleCsvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const emails = text
        .split(/[\n,]/)
        .map(e => e.trim())
        .filter(e => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e));
      
      const newInvites = Array.from(new Set([...invites, ...emails]));
      onUpdate({ invites: newInvites });
    };
    reader.readAsText(file);
  };

  const accessOptions = [
    {
      id: "PUBLIC",
      title: "Public Event",
      description: "Visible to everyone. Anyone with the link can register.",
      icon: Globe,
      color: "text-emerald-500",
      bg: "bg-emerald-50"
    },
    {
      id: "PRIVATE",
      title: "Private Listing",
      description: "Only visible to people with the direct invitation link.",
      icon: Lock,
      color: "text-amber-500",
      bg: "bg-amber-50"
    },
    {
      id: "INVITE_ONLY",
      title: "Restricted Access",
      description: "Manual invitation only. Only white-listed emails can register.",
      icon: Mail,
      color: "text-brand",
      bg: "bg-blue-50"
    }
  ];

  return (
    <div className="space-y-12">
      <WizardSection 
        icon={Lock} 
        title="Access & Visibility" 
        subtitle="Control who can see and join your event"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {accessOptions.map((option) => {
            const isSelected = accessType === option.id;
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => updateAccess(option.id)}
                className={cn(
                  "flex flex-col items-start p-6 rounded-xl border-2 transition-all duration-300 text-left group gap-4",
                  isSelected
                    ? "bg-white border-brand shadow-2xl shadow-brand/10 scale-[1.02]"
                    : "bg-gray-50/50 border-gray-100/50 hover:bg-white hover:border-brand/30 hover:shadow-xl hover:shadow-gray-200/40"
                )}
              >
                <div className={cn(
                  "w-12 h-12 rounded-2xl flex items-center justify-center transition-colors shadow-sm",
                  isSelected ? "bg-brand text-white" : cn(option.bg, option.color)
                )}>
                  <option.icon size={20} />
                </div>
                <div>
                  <h4 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-1">{option.title}</h4>
                  <p className="text-[10px] font-bold text-gray-400 leading-relaxed uppercase tracking-tighter">{option.description}</p>
                </div>
                {isSelected && (
                  <div className="mt-auto pt-2">
                    <div className="flex items-center gap-1.5 text-brand">
                      <div className="w-5 h-5 rounded-full bg-brand flex items-center justify-center">
                        <Check size={10} className="text-white" />
                      </div>
                      <span className="text-[9px] font-black uppercase tracking-widest">Active Choice</span>
                    </div>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </WizardSection>

      {/* Invite Only Section */}
      {accessType === "INVITE_ONLY" && (
        <div className="space-y-8 p-10 bg-gray-50/30 rounded-xl border border-gray-100/50 animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center border border-gray-100 shadow-sm">
                <Users className="text-brand" size={18} />
              </div>
              <div>
                <h3 className="text-[11px] font-black text-gray-900 uppercase tracking-widest leading-none">Guest List Export</h3>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter mt-1.5">Manage white-listed participants</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <input 
                type="file" 
                id="csv-upload" 
                accept=".csv,.txt"
                className="hidden" 
                onChange={handleCsvUpload}
              />
              <label 
                htmlFor="csv-upload"
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl border border-gray-200 bg-white text-[10px] font-black uppercase tracking-widest text-gray-500 hover:border-brand hover:text-brand cursor-pointer transition-all shadow-sm active:scale-95"
              >
                <FileUp size={14} />
                Import CSV
              </label>
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <div className="flex gap-4">
              <div className="flex-1">
                <InputController
                  placeholder="Enter email address..."
                  className="h-12 bg-white"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addInvite(emailInput);
                    }
                  }}
                />
              </div>
              <Button 
                type="button"
                onClick={() => addInvite(emailInput)}
                className="h-12 px-8 rounded-xl bg-gray-900 hover:bg-gray-800 text-white font-black text-xs uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-gray-200"
              >
                Add
              </Button>
            </div>

            <div className="flex flex-wrap gap-2">
              {invites.length === 0 ? (
                <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest italic py-4">No guests invited yet...</p>
              ) : (
                invites.map((email) => (
                  <div key={email} className="flex items-center gap-2 bg-white border border-gray-100 px-4 py-2 rounded-xl group/invite shadow-sm hover:border-brand/30 transition-all">
                    <span className="text-[11px] font-bold text-gray-600">{email}</span>
                    <button 
                      type="button"
                      onClick={() => removeInvite(email)}
                      className="text-gray-300 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
