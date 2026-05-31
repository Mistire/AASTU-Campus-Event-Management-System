import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import HowItWorks from "@/components/landing/HowItWorks";
import Testimonials from "@/components/landing/Testimonials";
import Features from "@/components/landing/Features";
import Footer from "@/components/landing/Footer";
import CoreFeatures from "@/components/landing/CoreFeatures";
import FinalCTA from "@/components/landing/FinalCTA";
import SmoothScroll from "@/components/ui/SmoothScroll";

export default function Home() {
  return (
    <SmoothScroll>
      <main className="min-h-screen flex flex-col">
        <Navbar />
        <Hero />
        <CoreFeatures />
        <Features />
        <HowItWorks />
        <Testimonials />
        <FinalCTA />
        <Footer />
      </main>
    </SmoothScroll>
  );
}
