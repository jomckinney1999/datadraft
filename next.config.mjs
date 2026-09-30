/** @type {import('next').NextConfig} */
const nextConfig = {
  // Routes that moved when the site narrowed to questions / courses /
  // projects. Anyone holding a link from before — a bookmark, a shared URL,
  // a search result — lands on the thing that replaced it instead of a 404.
  async redirects() {
    return [
      { source: "/interview", destination: "/projects", permanent: true },
      {
        source: "/interview/:caseId",
        destination: "/projects/case/:caseId",
        permanent: true,
      },
      {
        source: "/learn/project/:projectId",
        destination: "/projects/:projectId",
        permanent: true,
      },
      // The career surfaces are gone entirely, so these land on the nearest
      // thing that still exists rather than pretending they moved.
      { source: "/resources", destination: "/projects", permanent: false },
      { source: "/learn/path", destination: "/learn", permanent: false },
      { source: "/learn/path/:roleId", destination: "/learn", permanent: false },
      { source: "/learn/start", destination: "/learn", permanent: false },
      { source: "/learn/studio", destination: "/learn", permanent: false },
      {
        source: "/learn/studio/:courseId",
        destination: "/learn",
        permanent: false,
      },
      { source: "/learn/draft", destination: "/learn", permanent: false },
      // "Courses" is what the nav calls it; /learn is where it has always
      // lived. Support the obvious URL rather than rewriting every link.
      { source: "/courses", destination: "/learn", permanent: false },
    ];
  },
};

export default nextConfig;
