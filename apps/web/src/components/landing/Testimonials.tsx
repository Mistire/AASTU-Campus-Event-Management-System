"use client";

import { motion } from "framer-motion";
import Image from "next/image";

const testimonials = [
  {
    img: "/stud1.webp",
    quote: "CEMS made it so easy to find and join events! The event suggestions are spot on.",
    name: "Hanna Tesfaye",
    role: "Software Engineering Student",
  },
  {
    img: "/org1.webp",
    quote: "Managing club activities was a nightmare before. CEMS unified everything for us.",
    name: "Abebe Kebede",
    role: "Tech Club President",
  },
  {
    img: "/stud2.png",
    quote: "I never miss events anymore. The real-time alerts and SOS feature are literal life-savers.",
    name: "Sara Mengistu",
    role: "Freshman Student",
  },
  {
    img: "/stud1.webp",
    quote: "The QR check-in is so fast. No more long queues at the auditorium entrance!",
    name: "Dawit Isaac",
    role: "Data Science Major",
  },
  {
    img: "/org1.webp",
    quote: "The analytics dashboard helps us understand student engagement like never before.",
    name: "Marta Hailu",
    role: "Event Coordinator",
  },
  {
    img: "/stud2.png",
    quote: "Finally, a campus system that feels modern and works on my phone perfectly.",
    name: "Yonas Biru",
    role: "Mechanical Engineering Student",
  },
];

export default function Testimonials() {
  // Duplicate the list for seamless infinite loop
  const doubledTestimonials = [...testimonials, ...testimonials];

  return (
    <section className="py-32 relative bg-linear-to-b from-white via-gray-50/20 to-white overflow-hidden">
      
      {/* ── Background Decorations ── */}
      <div className="absolute inset-0 z-0 opacity-[0.02] pointer-events-none bg-[radial-gradient(#0ea5e9_1px,transparent_1px)] bg-size-[40px_40px]" />
      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-96 h-96 bg-brand/5 rounded-full blur-3xl opacity-50 z-0" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-blue-100/10 rounded-full blur-[120px] opacity-30 z-0" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="relative z-10 text-center mb-20 px-6"
      >
        <div className="h-10" />
        <h2 className="text-4xl md:text-6xl font-black mb-6 text-gray-900 tracking-tighter">What Students Say</h2>
        <p className="text-gray-500 max-w-2xl mx-auto text-xl font-medium leading-relaxed">
          Trusted by student organizations and thousands of students across the AASTU campus.
        </p>
      </motion.div>

      {/* Marquee Row */}
      <div className="relative flex overflow-x-hidden group">
        <motion.div
          className="flex whitespace-nowrap gap-8 py-10 px-8"
          animate={{
            x: [0, -2600], // Adjust based on total cards width
          }}
          transition={{
            x: {
              repeat: Infinity,
              repeatType: "loop",
              duration: 50,
              ease: "linear",
            },
          }}
          whileHover={{ animationPlayState: "paused" }}
        >
          {doubledTestimonials.map((t, i) => (
            <div
              key={i}
              className="w-[420px] shrink-0 p-10 bg-white/40 backdrop-blur-3xl rounded-[3rem] border border-white/40 shadow-2xl transition-all duration-500 hover:shadow-brand/10 hover:border-brand/20 hover:-translate-y-2 group/card flex flex-col justify-between relative overflow-hidden"
            >
              {/* Card Meta Log */}
              <div className="absolute top-0 right-0 p-8">
                <div className="font-brand font-black text-[9px] tracking-widest text-brand opacity-20 group-hover/card:opacity-100 transition-opacity">
                  VERIFIED LOG — 0{ (i % 6) + 1 }
                </div>
              </div>

              <div>
                <div className="flex gap-1 mb-8">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-brand drop-shadow-[0_0_8px_rgba(14,165,233,0.4)]">★</span>
                  ))}
                </div>
                <p className="text-gray-600 mb-10 text-lg leading-relaxed font-medium italic whitespace-normal opacity-90">
                  &ldquo;{t.quote}&rdquo;
                </p>
              </div>
              
              <div className="flex items-center gap-5">
                <div className="relative w-16 h-16 rounded-[1.25rem] overflow-hidden shadow-lg border-2 border-white ring-4 ring-brand/5">
                  <Image
                    src={t.img}
                    alt={t.name}
                    fill
                    className="object-cover group-hover/card:scale-110 transition-transform duration-700"
                  />
                </div>
                <div className="text-left">
                  <h4 className="font-brand font-black text-gray-900 text-sm tracking-tight mb-1">{t.name}</h4>
                  <p className="text-[10px] text-brand font-brand font-black uppercase tracking-widest bg-brand/5 px-2 py-1 rounded-lg">
                    {t.role}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </motion.div>

        {/* Gradient Overlays for smooth edges */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-48 bg-linear-to-r from-white via-white/50 to-transparent z-10" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-48 bg-linear-to-l from-white via-white/50 to-transparent z-10" />
      </div>
    </section>
  );
}