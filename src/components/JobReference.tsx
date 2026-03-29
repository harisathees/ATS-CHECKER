import React from "react";
import { Link2, ExternalLink, Briefcase, Globe } from "lucide-react";

const jobPortals = [
  {
    name: "LinkedIn",
    description: "The world's largest professional network.",
    url: "https://www.linkedin.com/jobs/",
    icon: Briefcase,
    color: "from-blue-600 to-blue-800",
  },
  {
    name: "Naukri",
    description: "India's No. 1 Job Portal.",
    url: "https://www.naukri.com/",
    icon: Globe,
    color: "from-blue-400 to-blue-600",
  },
  {
    name: "Indeed",
    description: "Job search engine with millions of listings.",
    url: "https://www.indeed.com/",
    icon: Link2,
    color: "from-blue-700 to-blue-900",
  },
  {
    name: "Glassdoor",
    description: "Search jobs and company reviews.",
    url: "https://www.glassdoor.com/Job/index.htm",
    icon: ExternalLink,
    color: "from-green-500 to-green-700",
  },
  {
    name: "Wellfound (AngelList)",
    description: "Where startup jobs are found.",
    url: "https://wellfound.com/jobs",
    icon: Briefcase,
    color: "from-slate-700 to-slate-900",
  },
  {
    name: "Monster",
    description: "Find jobs and career advice.",
    url: "https://www.monster.com/",
    icon: Globe,
    color: "from-purple-600 to-purple-800",
  }
];

export function JobReference() {
  return (
    <div className="space-y-6">
      <div className="text-center sm:text-left">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Job Search Portals</h2>
        <p className="text-gray-500 dark:text-gray-400 mt-2 max-w-2xl">
          Use the optimized resume evaluated above to apply directly on these leading platforms.
          Click the links below to start applying.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
        {jobPortals.map((portal) => {
          const Icon = portal.icon;
          return (
            <a
              key={portal.name}
              href={portal.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group block relative overflow-hidden rounded-2xl bg-white dark:bg-[#111] border border-gray-200 dark:border-white/10 hover:border-violet-500/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-violet-500/10"
            >
              <div
                className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity"
                style={{
                  backgroundImage: `linear-gradient(to right, var(--tw-gradient-stops))`
                }}
              />
              <div className="p-6">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${portal.color} flex items-center justify-center mb-4 shadow-lg text-white`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                  {portal.name}
                  <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-violet-500 transition-colors" />
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                  {portal.description}
                </p>
              </div>
            </a>
          );
        })}
      </div>
    </div>
  );
}
