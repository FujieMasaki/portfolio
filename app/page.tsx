import Hero from "@/components/Hero";
import About from "@/components/About";
import ThingsILike from "@/components/ThingsILike";
import PlacesToKnowMe from "@/components/PlacesToKnowMe";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div className="container">
      <Hero />
      <About />
      <ThingsILike />
      <PlacesToKnowMe />
      <Contact />
      <Footer />
    </div>
  );
}
