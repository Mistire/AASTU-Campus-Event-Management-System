"use client";
import Image from "next/image";
import { Calendar, MapPin, Tag, ArrowRight, Clock, Users, BarChart } from "lucide-react";
import { motion } from "framer-motion";

const events = [
  {
    id: "EVT-2026-001",
    img: "/event1.jpg",
    title: "AASTU Music Festival 2026",
    date: "Apr 12, 2026",
    venue: "Main Campus Grounds",
    category: "Music",
    isFeatured: true,
    capacity: 85,
  },
  {
    id: "EVT-2026-002",
    img: "/event2.jpg",
    title: "Tech Innovation Summit",
    date: "Apr 18, 2026",
    venue: "Main Auditorium",
    category: "Tech",
  },
  {
    id: "EVT-2026-003",
    img: "/event3.jpg",
    title: "Art & Photography Expo",
    date: "Apr 20, 2026",
    venue: "Art Gallery",
    category: "Arts",
  },
  {
    id: "EVT-2026-004",
    img: "/event4.jpg",
    title: "Inter-department Sports",
    date: "Apr 25, 2026",
    venue: "Sports Complex",
    category: "Sports",
  },
  {
    id: "EVT-2026-005",
    img: "/event5.jpg",
    title: "Grand Debate Competition",
    date: "May 02, 2026",
    venue: "Block 45 Hall",
    category: "Academic",
  },
  {
    id: "EVT-2026-006",
    img: "/event6.jpg",
    title: "Full-Stack Coding Bootcamp",
    date: "May 10, 2026",
    venue: "IT Lab 3",
    category: "Tech",
  },
  {
    id: "EVT-2026-007",
    img: "/event7.jpg",
    title: "Heritage & Cultural Day",
    date: "May 15, 2026",
    venue: "Student Plaza",
    category: "Culture",
  },
  {
    id: "EVT-2026-008",
    img: "/event8.jpg",
    title: "Alumni Networking Night",
    date: "May 22, 2026",
    venue: "Campus Hotel",
    category: "Networking",
  },
  {
    id: "EVT-2026-009",
    img: "/event9.jpg",
    title: "Annual Mega Career Fair",
    date: "Jun 05, 2026",
    venue: "Multi-purpose Hall",
    category: "Career",
  },
  {
    id: "EVT-2026-010",
    img: "/event10.jpg",
    title: "Senior Graduation Party",
    date: "Jun 20, 2026",
    venue: "Main Stadium",
    category: "Social",
  },
];

export default function Features() {
  const featuredEvent = events.find((e) => e.isFeatured);
  const sideEvents = events.slice(1, 3); // Two events for the sidebar
  const bottomEvents = events.slice(3); // The rest for the bottom grid

  return (
    <section id="features" className="relative py-32 px-8 bg-linear-to-b from-white via-gray-50/20 to-white overflow-hidden">
      
      {/* ── Background Decorations ── */}
      <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#0ea5e9_1px,transparent_1px)] bg-size-[50px_50px]" />
      <div className="absolute top-1/4 -right-20 w-96 h-96 bg-brand/5 rounded-full blur-3xl opacity-60 z-0" />
      <div className="absolute bottom-1/4 -left-20 w-80 h-80 bg-blue-100/10 rounded-full blur-3xl opacity-40 z-0" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-20">
          <div className="h-10" />
          <h2 className="text-4xl md:text-6xl font-black text-gray-900 mb-6 tracking-tighter">
            Upcoming <span className="text-brand">Discovery.</span>
          </h2>
          <p className="text-gray-500 max-w-2xl mx-auto text-xl font-medium leading-relaxed">
            Secure your spot in the next generation of campus experiences at AASTU.
          </p>
        </div>

        {/* Top Feature Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
          {/* Featured Event Spotlight */}
          {featuredEvent && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="lg:col-span-8 group relative rounded-[3.5rem] overflow-hidden shadow-2xl h-[550px] border border-gray-100 flex flex-col justify-end p-10"
            >
              <Image
                src={featuredEvent.img}
                alt={featuredEvent.title}
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-1000 ease-out"
                priority
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/95 via-black/40 to-transparent z-1" />

              {/* Event ID Tag */}
              <div className="absolute top-10 right-10 z-20">
                <div className="font-brand font-black text-[10px] tracking-widest text-white/40 group-hover:text-brand transition-colors duration-500">
                  {featuredEvent.id}
                </div>
              </div>

              <div className="relative z-10 w-full">
                <div className="p-12 rounded-[3rem] bg-black/30 backdrop-blur-3xl border border-white/10 shadow-3xl">
                  <div className="flex items-center gap-4 mb-8">
                    <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand text-white text-[10px] font-brand font-black uppercase tracking-widest shadow-xl shadow-brand/20">
                      <Tag className="w-3.5 h-3.5" /> Featured {featuredEvent.category}
                    </span>
                    <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-500/20 backdrop-blur-md border border-red-500/30 text-red-400 text-[10px] font-brand font-black uppercase tracking-widest">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
                      Live Entry Open
                    </span>
                  </div>
                  
                  <h3 className="text-4xl md:text-6xl font-black text-white mb-8 tracking-tighter leading-[0.95]">
                    {featuredEvent.title}
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                    <div className="flex flex-wrap items-center gap-6 text-white/60 text-sm font-medium">
                      <span className="flex items-center gap-2.5">
                        <Calendar className="w-5 h-5 text-brand" /> {featuredEvent.date}
                      </span>
                      <span className="flex items-center gap-2.5">
                        <MapPin className="w-5 h-5 text-brand" /> {featuredEvent.venue}
                      </span>
                    </div>
                    
                    {/* Micro-UI: Capacity Bar */}
                    <div className="flex flex-col gap-2">
                       <div className="flex justify-between text-[10px] font-brand font-black uppercase tracking-widest text-white/40">
                         <span>Registration Capacity</span>
                         <span className="text-brand">85% Full</span>
                       </div>
                       <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                         <motion.div 
                           initial={{ width: 0 }}
                           whileInView={{ width: "85%" }}
                           transition={{ duration: 1.5, ease: "easeOut" }}
                           className="h-full bg-brand shadow-[0_0_10px_rgba(14,165,233,0.5)]" 
                          />
                       </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                    <button className="group relative inline-flex items-center gap-4 bg-brand hover:bg-brand-hover text-white px-12 py-5 rounded-2xl font-brand font-black text-xs uppercase tracking-widest transition-all shadow-2xl shadow-brand/40 overflow-hidden">
                      <span className="relative z-10">RSVP SECURE SLOT</span>
                      <ArrowRight size={18} className="relative z-10 group-hover:translate-x-1 transition-transform" />
                      <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                    </button>

                    {/* Micro-UI: Attendee Stack */}
                    <div className="flex items-center gap-4">
                       <div className="flex -space-x-3">
                         {[1,2,3].map(i => (
                           <div key={i} className="w-10 h-10 rounded-full border-2 border-gray-800 bg-gray-700 flex items-center justify-center text-[8px] font-black text-white/50">
                             U{i}
                           </div>
                         ))}
                         <div className="w-10 h-10 rounded-full border-2 border-gray-800 bg-brand text-white flex items-center justify-center text-[8px] font-black">
                           +1.2k
                         </div>
                       </div>
                       <div className="text-[10px] font-brand font-black uppercase tracking-widest text-white/40 flex items-center gap-2">
                         <Users size={12} className="text-brand" />
                         Joined
                       </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          <div className="lg:col-span-4 flex flex-col gap-8">
            {sideEvents.map((event, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group relative rounded-[3rem] overflow-hidden shadow-xl h-[260px] border border-gray-100 flex flex-col justify-end p-8 transition-all hover:shadow-2xl hover:-translate-y-1"
              >
                <Image
                  src={event.img}
                  alt={event.title}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/95 via-black/30 to-transparent z-1" />

                <div className="absolute top-6 right-6 z-20">
                  <div className="font-brand font-black text-[8px] tracking-[.2em] text-white/20 uppercase">
                    {event.id}
                  </div>
                </div>

                <div className="relative z-10">
                  <span className="inline-block px-3 py-1 rounded-lg bg-brand/90 backdrop-blur-md text-white text-[8px] font-brand font-black uppercase tracking-widest mb-3 border border-white/10">
                    {event.category}
                  </span>
                  <h3 className="text-xl font-black text-white mb-3 leading-tight tracking-tight uppercase">
                    {event.title}
                  </h3>
                  <div className="flex items-center gap-4 text-white/60 text-[11px] mb-6 font-medium">
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-brand" /> {event.date}
                    </span>
                  </div>
                  <button className="text-white text-[10px] font-brand font-black uppercase tracking-[.2em] hover:text-brand transition-colors flex items-center gap-2 group/btn">
                    Details <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {bottomEvents.map((event, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group relative rounded-[2.5rem] overflow-hidden shadow-lg h-[320px] border border-gray-100 p-8 flex flex-col justify-end transition-all hover:shadow-2xl hover:border-brand/20"
            >
              <Image
                src={event.img}
                alt={event.title}
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/95 via-black/60 to-transparent z-1" />

              <div className="relative z-10">
                <div className="flex justify-between items-start mb-4">
                  <span className="px-3 py-1 rounded-lg bg-white/10 backdrop-blur-md text-brand text-[8px] font-brand font-black uppercase tracking-widest border border-white/10">
                    {event.category}
                  </span>
                  <div className="text-[7px] font-brand font-black text-white/20 tracking-tighter uppercase mt-1">
                    {event.id}
                  </div>
                </div>
                
                <h3 className="text-lg font-black text-white mb-3 leading-tight tracking-tight uppercase">
                  {event.title}
                </h3>
                
                <div className="flex items-center gap-3 text-white/60 text-[10px] mb-6 font-medium">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-brand" /> {event.date}
                  </span>
                </div>
                
                <button className="w-full py-3.5 bg-white/10 hover:bg-brand backdrop-blur-md border border-white/20 hover:border-brand text-white rounded-2xl text-[9px] font-brand font-black uppercase tracking-widest transition-all shadow-xl hover:shadow-brand/20 flex items-center justify-center gap-2">
                  <BarChart size={12} /> Book Slot
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}