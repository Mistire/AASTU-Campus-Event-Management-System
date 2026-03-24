import Link from 'next/link';
import { ArrowRight, ShieldCheck, CalendarRange, Users, Sparkles } from 'lucide-react';

export default function Home() {
  return (
    <main className="min-h-screen relative overflow-hidden bg-background">
      {/* Background decorations */}
      <div className="absolute top-0 -left-40 w-96 h-96 bg-primary/10 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-pulse" />
      <div className="absolute top-0 -right-40 w-96 h-96 bg-accent/10 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-pulse transition-all duration-1000" />
      <div className="absolute -bottom-40 left-20 w-96 h-96 bg-secondary/10 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-pulse transition-all duration-1000" />

      <div className="relative z-10 container mx-auto px-4 pt-32 pb-20 flex flex-col items-center justify-center min-h-[80vh] text-center">
        <div className="inline-flex items-center rounded-full border border-primary/20 bg-background/50 px-3 py-1 text-sm font-medium backdrop-blur-sm mb-8 transition-all hover:bg-primary/10">
          <Sparkles className="mr-2 h-4 w-4 text-primary" />
          The New Era of Campus Events
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-foreground mb-6">
          AASTU Campus <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">Event Management</span>
        </h1>

        <p className="max-w-2xl text-lg md:text-xl text-muted-foreground mb-10 leading-relaxed">
          Discover, organize, and participate in the vibrant life of AASTU. Whether you are a student looking for the next big hackathon, or staff organizing a seminar, everything is right here.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center max-w-md mx-auto sm:max-w-none">
          <Link
            href="/signup?role=STUDENT"
            className="group relative flex w-full sm:w-auto items-center justify-center overflow-hidden rounded-full bg-primary px-8 py-4 text-primary-foreground font-semibold shadow-[0_0_40px_-10px_rgba(0,0,0,0.3)] transition-all hover:scale-105 hover:shadow-[0_0_60px_-15px_rgba(0,0,0,0.5)]"
          >
            <span className="relative z-10 flex items-center gap-2 text-white">
              Get Started as Student
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </span>
          </Link>

          <Link
            href="/login"
            className="group flex w-full sm:w-auto items-center justify-center gap-2 rounded-full border border-border bg-background px-8 py-4 font-medium text-foreground transition-all hover:bg-muted"
          >
            <ShieldCheck className="h-5 w-5 text-primary" />
            Admin & Staff Portal
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-24 max-w-5xl mx-auto w-full">
          {[
            { icon: CalendarRange, title: "Discover Events", desc: "Browse a curated timeline of all upcoming campus events." },
            { icon: Users, title: "Connect & Network", desc: "Register for events and connect with peers grouping by interests." },
            { icon: ShieldCheck, title: "Secure Ticketing", desc: "Role-based dynamic QR ticketing system for flawless access." }
          ].map((feature, i) => (
            <div key={i} className="flex flex-col items-center text-center p-6 rounded-3xl bg-card border border-border shadow-sm transition-all hover:shadow-md hover:-translate-y-1">
              <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
                <feature.icon className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-xl font-bold bg-clip-text text-foreground mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
