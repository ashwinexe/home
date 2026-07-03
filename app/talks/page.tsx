import { getTalks } from "@/lib/mdx";
import { TalkCard } from "@/components/talks/TalkCard";
import topicsData from "@/content/talks/topics.json";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Talks",
  description: "Speaking engagements, conferences, and topics I love to discuss.",
};

export default async function TalksPage() {
  const talks = await getTalks();
  const upcomingTalks = talks.filter((talk) => talk.type === "upcoming");
  const pastTalks = talks.filter((talk) => talk.type === "past");

  return (
    <div>
      <header className="mb-12">
        <h1 className="text-3xl font-bold">Talks & Speaking</h1>
        <p className="mt-2 text-te-dark/60">
          I love sharing knowledge at conferences, meetups, and events.
        </p>
      </header>

      {/* Upcoming Talks */}
      {upcomingTalks.length > 0 && (
        <section className="mb-12">
          <h2 className="text-sm font-semibold text-te-dark/60 mb-6">
            📅 Upcoming
          </h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {upcomingTalks.map((talk) => (
              <TalkCard key={talk.slug} talk={talk} />
            ))}
          </div>
        </section>
      )}

      {/* Past Talks */}
      <section className="mb-16">
        <h2 className="text-sm font-semibold text-te-dark/60 mb-6">
          🎬 Past Talks
        </h2>
        {pastTalks.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {pastTalks.map((talk) => (
              <TalkCard key={talk.slug} talk={talk} />
            ))}
          </div>
        ) : (
          <p className="text-te-dark/60 py-8 text-center border-2 border-dashed border-te-gray rounded-te">
            Past talks will appear here. Stay tuned!
          </p>
        )}
      </section>

      {/* Topics I Speak About */}
      <section className="mb-16">
        <h2 className="text-sm font-semibold text-te-dark/60 mb-6">
          💡 Topics I Speak About
        </h2>
        <p className="text-te-dark/80 mb-6">
          Interested in having me speak at your event? Here are some topics I'm
          passionate about:
        </p>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {topicsData.topics.map((topic) => (
            <div
              key={topic.title}
              className="p-6 bg-white border-2 border-te-gray rounded-te"
            >
              <h3 className="font-bold">{topic.title}</h3>
              <p className="mt-2 text-sm text-te-dark/60">{topic.description}</p>
              <p className="mt-3 text-xs text-te-dark/40">
                Duration: {topic.duration}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Speaking CTA */}
      <section className="p-8 bg-te-dark text-te-beige rounded-te text-center">
        <h2 className="text-xl font-bold">Want me to speak at your event?</h2>
        <p className="mt-2 text-te-beige/80">
          I'd love to share my experiences with your community.
        </p>
        <a
          href="mailto:hello@ashwin.dev?subject=Speaking Inquiry"
          className="inline-block mt-4 px-6 py-2 bg-te-orange text-white rounded-te font-medium hover:bg-te-orange/90 transition-colors"
        >
          Get in touch
        </a>
      </section>
    </div>
  );
}
