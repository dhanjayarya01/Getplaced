"use client"

import { useState, useEffect } from "react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { JobList } from "@/components/getplaced/job-list"
import { ResumeSection } from "@/components/getplaced/resume-section"
import { useDebounce } from "@/hooks/use-debounce"
import { Briefcase, Search } from "lucide-react"

// Mocked data from the user payload for now, to be replaced with real API fetch
const jobData = [
  {
    "title": "Early Career Software Engineer Warfighter Systems",
    "company": "Anduril Industries",
    "location": "Bellevue",
    "description": "Anduril Industries is a defense technology company with a mission to transform U.S. and allied military capabilities with advanced technology...",
    "url": "https://remoteOK.com/remote-jobs/remote-early-career-software-engineer-warfighter-systems-anduril-industries-1130565",
    "source": "remoteok"
  },
  {
    "title": "Data Analyst II",
    "company": "ComputerCare",
    "location": "Remote",
    "description": "ComputerCare has spent more than 20 years building something rare in the IT world: a company where technical excellence and genuine human connection are valued equally...",
    "url": "https://remoteOK.com/remote-jobs/remote-data-analyst-ii-computercare-1130490",
    "source": "remoteok"
  },
  {
    "title": "Data Scientist",
    "company": "Solera Health",
    "location": "Remote",
    "description": "Job Summary Solera is seeking a Data Scientist to join our Insights team. You will work with large-scale claims and product engagement data to answer questions that matter to the business...",
    "url": "https://remoteOK.com/remote-jobs/remote-data-scientist-solera-health-1130479",
    "source": "remoteok"
  },
  {
    "title": "C++ Developer",
    "company": "Magic Media",
    "location": "Remote",
    "description": "Magic Media is a pioneering media, entertainment and tech group powered by creativity and innovation. We have a physical presence in 15 countries and expertise...",
    "url": "https://remoteOK.com/remote-jobs/remote-c-developer-magic-media-1130444",
    "source": "remoteok"
  },
  {
    "title": "Research Data Scientist",
    "company": "Swayable",
    "location": "Remote",
    "description": "About Swayable: Swayable is a fast-growing AI and automated data science platform that measures public opinion and the impact of messages and advertising content on it.",
    "url": "https://remoteOK.com/remote-jobs/remote-research-data-scientist-swayable-1130418",
    "source": "remoteok"
  },
  {
    "title": "Software Engineer",
    "company": "itD Tech",
    "location": "Arizona",
    "description": "itD is seeking a Software Engineer to design and scale the data pipelines that power next-generation foundation models for machine-generated data.",
    "url": "https://remoteOK.com/remote-jobs/remote-software-engineer-itd-tech-1130403",
    "source": "remoteok"
  },
  {
    "title": "Prompt Engineer",
    "company": "Viseven",
    "location": "Remote, Ukraine",
    "description": "Viseven Group — міжнародна MarTech компанія, що спеціалізується на інтерактивному контенті та хмарних рішеннях для глобальних фармацевтичних компаній.",
    "url": "https://remoteOK.com/remote-jobs/remote-prompt-engineer-viseven-1130289",
    "source": "remoteok"
  },
  {
    "title": "Senior Data Engineer",
    "company": "Oowlish Technology",
    "location": "Remote",
    "description": "Join Our Team Oowlish, one of Latin America's rapidly expanding software development companies, is seeking experienced technology professionals to enhance our diverse and vibrant team.",
    "url": "https://remoteOK.com/remote-jobs/remote-senior-data-engineer-oowlish-technology-1130284",
    "source": "remoteok"
  },
  {
    "title": "Data Science Intern Pricing Analytics",
    "company": "Gametime United",
    "location": "United States",
    "description": "About Us: Live experiences help people cross today's digital divide and focus on what truly connects us — the here, the now, this once-in-a-lifetime moment that's bringing us together.",
    "url": "https://remoteOK.com/remote-jobs/remote-data-science-intern-pricing-analytics-gametime-united-1130279",
    "source": "remoteok"
  },
  {
    "title": "Big Data Engineer",
    "company": "Oowlish Technology",
    "location": "Remote",
    "description": "Join Our Team Oowlish, one of Latin America's rapidly expanding software development companies, is seeking experienced technology professionals to enhance our diverse and vibrant team.",
    "url": "https://remoteOK.com/remote-jobs/remote-big-data-engineer-oowlish-technology-1130275",
    "source": "remoteok"
  },
  {
    "title": "Data Analyst 3",
    "company": "SkySlope",
    "location": "Remote",
    "description": "OUR ORIGIN STORY: In 2011 SkySlope started as an idea born at the kitchen table of our CEO, with just him and two others. Headquartered in Sacramento, California...",
    "url": "https://remoteOK.com/remote-jobs/remote-data-analyst-3-skyslope-1130196",
    "source": "remoteok"
  },
  {
    "title": "Senior Full stack Developer",
    "company": "Lemon.io",
    "location": "Remote",
    "description": "Are you a talented Senior Developer looking for a remote job that lets you show your skills and get decent compensation? Look no further than Lemon.io",
    "url": "https://remoteOK.com/remote-jobs/remote-senior-full-stack-developer-lemon-io-1130153",
    "source": "remoteok"
  },
  {
    "title": "GTM Automation Engineer",
    "company": "Postscript",
    "location": "Remote",
    "description": "Trusted by more than 18,000 Shopify and Shopify Plus stores—like Brooklinen, Ruggable, True Classic and Dr. Squatch—Postscript gives ecommerce brands the tools they need.",
    "url": "https://remoteOK.com/remote-jobs/remote-gtm-automation-engineer-postscript-1130114",
    "source": "remoteok"
  }
];

export default function JobsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const debouncedSearch = useDebounce(searchQuery, 300)
  const [jobs, setJobs] = useState(jobData)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    setIsLoading(true);
    const timeout = setTimeout(() => {
      if (debouncedSearch) {
        const lowerSearch = debouncedSearch.toLowerCase();
        const filtered = jobData.filter(job =>
          job.title.toLowerCase().includes(lowerSearch) ||
          job.company.toLowerCase().includes(lowerSearch) ||
          job.location.toLowerCase().includes(lowerSearch) ||
          job.description.toLowerCase().includes(lowerSearch)
        );
        setJobs(filtered);
      } else {
        setJobs(jobData);
      }
      setIsLoading(false);
    }, 200);
    return () => clearTimeout(timeout);
  }, [debouncedSearch]);

  return (
    <div className="h-screen overflow-y-auto no-scrollbar bg-background">
      <Navbar />

      {/* Hero — scrolls away */}
      <div className="pt-16">
        <section className="relative overflow-hidden bg-background pt-16 pb-12 border-b border-border">
          <div className="absolute inset-0 bg-grid-pattern opacity-[0.02]" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] opacity-30 pointer-events-none">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-blue-500/20 to-purple-500/20 blur-3xl rounded-full" />
          </div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary mb-6 border border-primary/20">
              <Briefcase className="w-4 h-4" />
              <span className="text-sm font-semibold">Latest Opportunities</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
              Find Your Next <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-600">Dream Job</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Discover the latest roles at top tech companies. Scraped in real-time to keep you ahead of the competition.
            </p>
          </div>
        </section>
      </div>

      {/* Sticky two-column layout */}
      <div className="sticky top-16 h-[calc(100vh-4rem)] flex max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 gap-8 overflow-hidden">
        {/* Main content */}
        <div className="flex-1 overflow-y-auto no-scrollbar py-6 space-y-6">
          {/* Search Bar */}
          <div className="bg-card rounded-2xl border border-border p-6">
            <h2 className="text-xl font-bold mb-4">Search Job Postings</h2>
            <div className="relative flex items-center">
              <Search className="absolute left-4 w-5 h-5 text-muted-foreground" />
              <input
                className="flex h-14 w-full rounded-xl border border-input bg-transparent px-3 py-1 text-lg shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary pl-12"
                placeholder="Search by role, company, location, or keywords..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <JobList jobs={jobs} loading={isLoading} />
        </div>

        {/* Filter sidebar */}
        <aside className="w-72 shrink-0 overflow-y-auto no-scrollbar py-6 space-y-6">
          <div className="bg-card border border-border rounded-xl p-6">
            <h3 className="font-bold text-lg mb-4">Filters</h3>
            <p className="text-sm text-muted-foreground mb-4">Advanced filtering options coming soon.</p>
          </div>
          <ResumeSection />
        </aside>
      </div>
    </div>
  )
}
