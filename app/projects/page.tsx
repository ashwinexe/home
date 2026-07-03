import { ProjectCard } from "@/components/projects/ProjectCard";
import projectsData from "@/content/projects/projects.json";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Projects",
  description: "Side projects and experiments I've built.",
};

export default function ProjectsPage() {
  return (
    <div>
      <header className="mb-12">
        <h1 className="text-3xl font-bold">Projects</h1>
        <p className="mt-2 text-te-dark/60">
          Things I've built, experiments I've run, and ideas I've explored.
        </p>
      </header>

      {/* Featured Projects */}
      <section className="mb-16">
        <h2 className="text-sm font-semibold text-te-dark/60 mb-6">
          ⭐ Featured
        </h2>
        <div className="grid gap-6 md:grid-cols-2">
          {projectsData.featured.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      </section>

      {/* Project Dump */}
      <section>
        <h2 className="text-sm font-semibold text-te-dark/60 mb-6">
          🧪 Experiments & Quick Projects
        </h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {projectsData.dump.map((item) => (
            <a
              key={item.name}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group p-4 bg-white border-2 border-te-gray rounded-te hover:border-te-dark transition-colors"
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl">{item.emoji}</span>
                <div>
                  <h3 className="font-medium group-hover:text-te-orange transition-colors">
                    {item.name}
                  </h3>
                  <p className="text-sm text-te-dark/60">{item.description}</p>
                </div>
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mt-16 p-8 border-2 border-dashed border-te-gray rounded-te text-center">
        <p className="text-te-dark/60">
          Want to see more? Check out my{" "}
          <a
            href="https://github.com/ashwinexe"
            target="_blank"
            rel="noopener noreferrer"
            className="text-te-orange hover:underline"
          >
            GitHub profile
          </a>{" "}
          for all my open source work.
        </p>
      </section>
    </div>
  );
}
