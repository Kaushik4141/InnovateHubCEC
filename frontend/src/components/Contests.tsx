import React, { useEffect, useState } from "react";
import { listContests, Contest } from "../services/contestApi";
import { Link } from "react-router-dom";
import { Search, Calendar, Clock, Users, Award, ChevronRight, Filter, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const Contests: React.FC = () => {
  const [contests, setContests] = useState<Contest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filter, setFilter] = useState<"All" | "Upcoming" | "Running" | "Ended">("All");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<"Recently Added" | "Earliest First">("Recently Added");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const data = await listContests();
        setContests(data);
      } catch (e: any) {
        setError(e?.message || "Failed to load contests");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const now = Date.now();

  // Filter & Search
  let filtered = contests.filter((c) => {
    const start = new Date(c.startAt).getTime();
    const end = new Date(c.endAt).getTime();
    const status = now < start ? "Upcoming" : now > end ? "Ended" : "Running";
    if (filter !== "All" && filter !== status) return false;
    if (search && !c.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  // Sort
  if (sort === "Recently Added") {
    filtered.sort((a, b) => new Date(b.startAt).getTime() - new Date(a.startAt).getTime());
  } else {
    filtered.sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime());
  }

  // Loading state
  if (loading) {
    return (
      <div className="max-w-[1200px] mx-auto p-6">
        <div className="animate-pulse">
          {/* Header skeleton */}
          <div className="text-center mb-8">
            <div className="h-10 bg-gray-700 rounded w-1/3 mx-auto mb-4"></div>
            <div className="h-4 bg-gray-700 rounded w-2/3 mx-auto"></div>
          </div>
          
          {/* Controls skeleton */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6 p-4 bg-gray-900/40 rounded-xl">
            <div className="flex gap-3">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-10 bg-gray-700 rounded-full w-24"></div>
              ))}
            </div>
            <div className="flex gap-4">
              <div className="h-10 bg-gray-700 rounded-lg w-40"></div>
              <div className="h-10 bg-gray-700 rounded-lg w-32"></div>
            </div>
          </div>
          
          {/* Contest cards skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="bg-gray-900 rounded-xl border border-gray-800 p-5 h-72">
                <div className="h-6 bg-gray-700 rounded-full w-20 mb-4"></div>
                <div className="h-6 bg-gray-700 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-700 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-700 rounded w-2/3 mb-6"></div>
                <div className="h-4 bg-gray-700 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-700 rounded w-2/3 mb-4"></div>
                <div className="flex justify-between">
                  <div className="h-6 bg-gray-700 rounded-full w-24"></div>
                  <div className="h-6 bg-gray-700 rounded-full w-20"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1200px] mx-auto p-6">
      {/* Header */}
      <motion.div 
        className="text-center mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-4xl font-bold text-white mb-2 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
          Coding Contests
        </h1>
        <p className="text-gray-400 max-w-2xl mx-auto">
          Challenge your skill, learn from the best, and climb the leaderboard in our exciting programming competitions.
        </p>
      </motion.div>

      {/* Mobile filter toggle */}
      <div className="md:hidden flex justify-between items-center mb-4">
        <button
          onClick={() => setMobileFiltersOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-800 text-gray-200"
        >
          <Filter size={16} />
          Filters
        </button>
        
        <div className="text-sm text-gray-400">
          {filtered.length} Contest{filtered.length !== 1 && "s"}
        </div>
      </div>

      {/* Tabs + Search */}
      <motion.div 
        className="hidden md:flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6 p-4 bg-gray-900/40 rounded-xl border border-gray-800 backdrop-blur-sm"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <div className="flex gap-3">
          {[
            { name: "All Contests", key: "All" },
            { name: "Upcoming", key: "Upcoming", icon: <Calendar size={16} /> },
            { name: "Running", key: "Running", icon: <Users size={16} /> },
            { name: "Ended", key: "Ended", icon: <Clock size={16} /> },
          ].map((tab) => (
            <motion.button
              key={tab.key}
              onClick={() => setFilter(tab.key as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                filter === tab.key
                  ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg"
                  : "bg-gray-800 text-gray-300 hover:bg-gray-700"
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {tab.icon}
              {tab.name}
            </motion.button>
          ))}
        </div>

        <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-6">
          {/* Search */}
          <motion.div 
            className="relative"
            whileFocus={{ scale: 1.02 }}
          >
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search contests..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 rounded-lg bg-gray-800 text-gray-200 placeholder-gray-500 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
            />
          </motion.div>

          {/* Sort */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400">Sort by:</span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as any)}
              className="bg-gray-800 text-gray-200 px-3 py-2 rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
            >
              <option>Recently Added</option>
              <option>Earliest First</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* Mobile Filters Panel */}
      <AnimatePresence>
        {mobileFiltersOpen && (
          <>
            <motion.div 
              className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileFiltersOpen(false)}
            />
            <motion.div 
              className="fixed top-0 left-0 h-full w-3/4 max-w-sm bg-gray-900 z-50 p-4 shadow-xl md:hidden"
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: "tween" }}
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-white">Filters</h2>
                <button onClick={() => setMobileFiltersOpen(false)} className="text-gray-400">
                  <X size={24} />
                </button>
              </div>
              
              <div className="mb-6">
                <h3 className="text-gray-400 text-sm font-medium mb-3">STATUS</h3>
                <div className="flex flex-col gap-2">
                  {['All', 'Upcoming', 'Running', 'Ended'].map(tab => (
                    <button
                      key={tab}
                      onClick={() => {
                        setFilter(tab as any);
                        setMobileFiltersOpen(false);
                      }}
                      className={`px-4 py-2 rounded-lg text-left transition ${
                        filter === tab
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="mb-6">
                <h3 className="text-gray-400 text-sm font-medium mb-3">SORT BY</h3>
                <div className="flex flex-col gap-2">
                  {['Recently Added', 'Earliest First'].map(option => (
                    <button
                      key={option}
                      onClick={() => {
                        setSort(option as any);
                        setMobileFiltersOpen(false);
                      }}
                      className={`px-4 py-2 rounded-lg text-left transition ${
                        sort === option
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Contest Count */}
      <motion.p 
        className="text-white font-medium mb-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        {filtered.length} Contest{filtered.length !== 1 && "s"} Found
        {filter !== "All" && ` in ${filter}`}
        {search && ` matching "${search}"`}
      </motion.p>

      {/* Error Message */}
      {error && (
        <motion.div
          className="mb-6 p-4 bg-red-900/20 rounded-lg border border-red-800/50 flex items-start gap-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="h-5 w-5 rounded-full bg-red-500 flex items-center justify-center mt-0.5 flex-shrink-0">
            <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <p className="text-red-300">{error}</p>
        </motion.div>
      )}

      {/* Contest Cards */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        variants={{
          hidden: { opacity: 0 },
          show: {
            opacity: 1,
            transition: {
              staggerChildren: 0.1
            }
          }
        }}
        initial="hidden"
        animate="show"
      >
        <AnimatePresence mode="popLayout">
          {filtered.map((c) => {
            const start = new Date(c.startAt).getTime();
            const end = new Date(c.endAt).getTime();
            const status = now < start ? "Upcoming" : now > end ? "Ended" : "Running";
            const durationMins = Math.max(0, Math.round((end - start) / 60000));
            const hours = Math.floor(durationMins / 60);
            const minutes = durationMins % 60;

            return (
              <motion.div
                key={c._id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                whileHover={{ y: -5 }}
              >
                <Link to={`/contests/${c._id}`}>
                  <div className="group bg-gray-900 rounded-xl border border-gray-800 p-5 hover:shadow-lg hover:border-purple-500/50 transition-all duration-300 h-full flex flex-col">
                    {/* Status */}
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-medium mb-3 self-start ${
                        status === "Running"
                          ? "bg-green-900/50 text-green-300"
                          : status === "Upcoming"
                          ? "bg-yellow-900/50 text-yellow-300"
                          : "bg-gray-700 text-gray-300"
                      }`}
                    >
                      {status}
                    </span>

                    {/* Title + Desc */}
                    <h2 className="text-lg font-semibold text-white mb-2 group-hover:text-purple-300 transition-colors">
                      {c.title}
                    </h2>
                    <p className="text-gray-400 text-sm mb-4 line-clamp-3 flex-grow">
                      {c.description}
                    </p>

                    {/* Date + Duration */}
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-gray-400 text-sm">
                        <Calendar size={14} className="text-purple-400" />
                        <span className="font-medium text-gray-300">Starts:</span>
                        {new Date(c.startAt).toLocaleString()}
                      </div>
                      <div className="flex items-center gap-2 text-gray-400 text-sm">
                        <Clock size={14} className="text-blue-400" />
                        <span className="font-medium text-gray-300">Duration:</span>
                        {hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`}
                      </div>
                    </div>

                    {/* Problems + CTA */}
                    <div className="flex justify-between items-center mt-auto">
                      <span className="px-3 py-1 rounded-full text-xs bg-purple-900/40 text-purple-300 border border-purple-800/50 flex items-center gap-1">
                        <Award size={14} />
                        {c.problems?.length || 0} problems
                      </span>
                      <span className="text-sm font-medium text-purple-400 group-hover:text-purple-300 transition-colors flex items-center gap-1">
                        View details <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                      </span>
                    </div>

                    {/* Hover effect overlay */}
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 rounded-xl transition-opacity pointer-events-none" />
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </motion.div>

      {/* Empty state */}
      {filtered.length === 0 && !error && (
        <motion.div 
          className="text-center py-16 text-gray-400"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-gray-800 mb-4">
            <svg className="h-8 w-8 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-300 mb-2">No contests found</h3>
          <p className="max-w-md mx-auto">
            {search || filter !== "All" 
              ? `Try adjusting your search or filter settings to find what you're looking for.`
              : 'Check back later for new contests and challenges.'}
          </p>
          {(search || filter !== "All") && (
            <button
              onClick={() => {
                setSearch("");
                setFilter("All");
              }}
              className="mt-4 px-4 py-2 text-sm text-purple-300 hover:text-purple-200 transition-colors"
            >
              Clear all filters
            </button>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default Contests;