import { AppCTA } from "@/components/AppCTA";
import { Benefits } from "@/components/Benefits";
import { Footer } from "@/components/Footer";
import { Hero } from "@/components/Hero";
import { HowItWorks } from "@/components/HowItWorks";
import { Navbar } from "@/components/Navbar";
import { Services } from "@/components/Services";

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main id="top" className="overflow-x-clip">
        <Hero />
        <Services />
        <HowItWorks />
        <Benefits />
        <AppCTA />
      </main>
      <Footer />
    </>
  );
}
