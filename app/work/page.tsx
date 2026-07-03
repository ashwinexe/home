import { Timeline } from "@/components/work/Timeline";
import experiencesData from "@/content/work/experiences.json";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Work",
  description: "My professional journey and experience.",
};

export default function WorkPage() {
  return (
    <div>
      <header className="mb-12">
        <h1 className="text-3xl font-bold">Work Experience</h1>
        <p className="mt-2 text-te-dark/60">
          My journey through the tech and community space.
        </p>
      </header>

      <Timeline experiences={experiencesData.experiences} />

      {/* Contact CTA */}
      <section className="mt-16 p-8 bg-te-dark text-te-beige rounded-te text-center">
        <h2 className="text-xl font-bold">Interested in working together?</h2>
        <p className="mt-2 text-te-beige/80">
          I'm always open to discussing community building, DevRel, or exciting
          projects.
        </p>
        <a
          href="https://twitter.com/ashwinexe"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block mt-4 px-6 py-2 bg-te-orange text-white rounded-te font-medium hover:bg-te-orange/90 transition-colors"
        >
          Get in touch
        </a>
      </section>
    </div>
  );
}
