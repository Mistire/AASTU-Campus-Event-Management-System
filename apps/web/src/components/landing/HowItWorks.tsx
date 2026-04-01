"use client";
import { CalendarPlus, Sparkles, BellRing, ScanLine } from "lucide-react";
import { motion, Variants } from "framer-motion";

const steps = [
  {
    icon: CalendarPlus,
    title: "Create & Publish",
    desc: "Organizers build events with venues, categories, tags, and ticketing — all in one place.",
  },
  {
    icon: Sparkles,
    title: "Discover & RSVP",
    desc: "Students browse upcoming events or get AI-powered recommendations tailored to their interests.",
  },
  {
    icon: BellRing,
    title: "Get Notified",
    desc: "Real-time alerts for event updates, reminders, and campus-wide SOS emergency broadcasts.",
  },
  {
    icon: ScanLine,
    title: "Attend & Engage",
    desc: "Check in via QR code, leave feedback, and track analytics — all from your phone.",
  },
];

const container: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const item: Variants = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } },
};

/**
 * A single curved connector drawn between two adjacent steps.
 * direction: "down" curves from top→bottom, "up" curves from bottom→top
 */
function Connector({ direction }: { direction: "down" | "up" }) {
  const d =
    direction === "down"
      ? "M 0 8 C 30 8, 30 52, 60 52"   // start top-left, end bottom-right
      : "M 0 52 C 30 52, 30 8, 60 8";  // start bottom-left, end top-right

  return (
    <motion.div 
      variants={item}
      className="hidden md:flex items-center shrink-0 w-16 self-stretch"
    >
      <svg
        viewBox="0 0 60 60"
        fill="none"
        className="w-full h-16"
        preserveAspectRatio="none"
      >
        <path
          d={d}
          stroke="rgb(56 189 248)"
          strokeOpacity="0.4"
          strokeWidth="2"
          strokeDasharray="6 5"
          strokeLinecap="round"
        />
      </svg>
    </motion.div>
  );
}

export default function HowItWorks() {
  const connectorDirections: Array<"down" | "up"> = ["down", "up", "down"];

  return (
    <section className="py-32 bg-linear-to-b from-white via-gray-50/30 to-white text-center overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           whileInView={{ opacity: 1, y: 0 }}
           viewport={{ once: true }}
           transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand/10 text-brand text-[10px] font-brand font-black uppercase tracking-widest mb-6">
            <ScanLine size={14} className="fill-brand/20" />
            The Blueprint
          </div>
          <h2 className="text-4xl md:text-5xl font-black mb-6 text-gray-900 tracking-tighter">How CEMS Works</h2>
          <p className="text-gray-500 mb-24 max-w-2xl mx-auto text-xl font-medium leading-relaxed">
            From creation to celebration — four simple steps to master campus coordination.
          </p>
        </motion.div>

        {/* ── Desktop: flex row with connectors between steps ── */}
        <motion.div 
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          className="hidden md:flex items-start justify-center max-w-6xl mx-auto gap-4"
        >
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isLow = index % 2 !== 0;

            return (
              <div key={index} className="contents">
                <motion.div
                  variants={item}
                  className="flex flex-col items-center text-center w-[240px] shrink-0 group"
                  style={{ marginTop: isLow ? "6rem" : "0" }}
                >
                  <div className="relative mb-8">
                    <div className="absolute -top-3 -right-3 bg-white border border-gray-100 text-brand text-[10px] font-brand font-black w-10 h-10 rounded-full flex items-center justify-center z-20 shadow-xl shadow-brand/10 ring-4 ring-gray-50/50">
                      0{index + 1}
                    </div>
                    <div className="bg-brand text-white w-24 h-24 flex items-center justify-center rounded-[2rem] shadow-2xl shadow-brand/20 transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 group-hover:shadow-brand/40 group-hover:-translate-y-2 relative overflow-hidden">
                      <Icon className="w-10 h-10 relative z-10" strokeWidth={1.5} />
                      <div className="absolute inset-0 bg-linear-to-tr from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>

                  <div className="p-6 rounded-[2.5rem] bg-white/60 backdrop-blur-md border border-gray-100 shadow-xl transition-all group-hover:shadow-2xl group-hover:bg-white group-hover:-translate-y-1">
                    <h3 className="font-brand font-black text-xs uppercase tracking-widest mb-3 text-brand">
                      Step 0{index + 1}
                    </h3>
                    <h4 className="font-black text-xl mb-4 text-gray-900 tracking-tight leading-tight">
                      {step.title}
                    </h4>
                    <p className="text-gray-500 text-sm leading-relaxed font-medium">{step.desc}</p>
                  </div>
                </motion.div>

                {index < steps.length - 1 && (
                  <Connector direction={connectorDirections[index]} />
                )}
              </div>
            );
          })}
        </motion.div>

        {/* ── Mobile: simple vertical stack ── */}
        <motion.div 
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="md:hidden flex flex-col items-center gap-12 px-6"
        >
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <motion.div 
                key={index} 
                variants={item}
                className="flex flex-col items-center text-center max-w-xs group"
              >
                <div className="relative mb-6">
                  <div className="absolute -top-3 -right-3 bg-white border border-gray-100 text-brand text-[10px] font-brand font-black w-8 h-8 rounded-full flex items-center justify-center z-20 shadow-lg ring-2 ring-gray-50">
                    0{index + 1}
                  </div>
                  <div className="bg-brand text-white w-20 h-20 flex items-center justify-center rounded-[1.8rem] shadow-xl shadow-brand/20">
                    <Icon className="w-8 h-8" strokeWidth={1.5} />
                  </div>
                </div>
                <div className="p-8 rounded-[2.5rem] bg-white border border-gray-100 shadow-lg">
                  <h3 className="font-brand font-black text-[10px] uppercase tracking-widest mb-2 text-brand">
                    Step 0{index + 1}
                  </h3>
                  <h4 className="font-black text-xl mb-3 text-gray-900">{step.title}</h4>
                  <p className="text-gray-500 text-sm leading-relaxed font-medium">{step.desc}</p>
                </div>

                {index < steps.length - 1 && (
                  <div className="w-0.5 h-12 mt-8 border-l-2 border-dashed border-brand/20" />
                )}
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}