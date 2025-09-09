import { useState, useEffect } from "react";
import Header from "./Header";
import {
  Users,
  UserPlus,
  Search,
  MessageCircle,
  UserCheck,
  Star,
  Calendar,
  Award,
  Code,
  X,
} from "lucide-react";
import {
  NetworkStats,
  Connection,
  ConnectionSuggestion,
  ConnectionRequest,
  networkApi,
} from "../services/networkApi";
import { useNavigate } from "react-router-dom";

const Network = () => {
  const [activeTab, setActiveTab] = useState("suggestions");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<NetworkStats | null>(null);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [suggestions, setSuggestions] = useState<ConnectionSuggestion[]>([]);
  const [invitations, setInvitations] = useState<ConnectionRequest[]>([]);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const apiBase = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();

  useEffect(() => {
    loadNetworkData();
  }, []);

  const avatarUrlFrom = (id: string, name: string, avatar?: string) => {
    const isUsable = avatar && (avatar.startsWith('http') || avatar.startsWith('/'));
    const isDefault = avatar && avatar.includes('default_avatar');
    if (!isUsable || isDefault) {
      const seed = id || name || 'user';
      return `https://api.dicebear.com/9.x/thumbs/svg?seed=${encodeURIComponent(seed)}&size=64`;
    }
    return avatar as string;
  };

  useEffect(() => {
    if (searchTerm) {
      const timeoutId = setTimeout(() => {
        loadTabData();
      }, 500);
      return () => clearTimeout(timeoutId);
    } else {
      loadTabData();
    }
  }, [activeTab, searchTerm]);

  const loadNetworkData = async () => {
    try {
      setLoading(true);
      const [statsData, connectionsData, suggestionsData, invitationsData] =
        await Promise.all([
          networkApi.getNetworkStats(),
          networkApi.getConnections(searchTerm),
          networkApi.getConnectionSuggestions(searchTerm),
          networkApi.getPendingRequests(),
        ]);

      setStats(statsData);
      setConnections(connectionsData);
      setSuggestions(suggestionsData);
      setInvitations(invitationsData);
    } catch (error) {
      console.error("Failed to load network data:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadTabData = async () => {
    try {
      setLoading(true);
      if (activeTab === "connections") {
        const connectionsData = await networkApi.getConnections(searchTerm);
        setConnections(connectionsData || []);
      } else if (activeTab === "suggestions") {
        const suggestionsData = await networkApi.getConnectionSuggestions(
          searchTerm
        );
        setSuggestions(suggestionsData || []);
      } else if (activeTab === "invitations") {
        const invitationsData = await networkApi.getPendingRequests();
        setInvitations(invitationsData || []);
      }
    } catch (error) {
      console.error("Failed to load tab data:", error);
      // Set empty arrays as fallback to prevent white screen
      if (activeTab === "connections") {
        setConnections([]);
      } else if (activeTab === "suggestions") {
        setSuggestions([]);
      } else if (activeTab === "invitations") {
        setInvitations([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async (userId: string) => {
    try {
      await networkApi.sendConnectionRequest(userId);
      // Remove from suggestions and reload data
      setSuggestions((prev) => prev.filter((s) => s._id !== userId));
      loadNetworkData();
    } catch (error) {
      console.error("Failed to send connection request:", error);
    }
  };

  const handleAcceptInvitation = async (fromUserId: string) => {
    try {
      await networkApi.acceptConnectionRequest(fromUserId);
      // Remove from invitations and reload data
      setInvitations((prev) => prev.filter((i) => i.from._id !== fromUserId));
      loadNetworkData();
    } catch (error) {
      console.error("Failed to accept invitation:", error);
    }
  };

  const handleDeclineInvitation = async (fromUserId: string) => {
    try {
      await networkApi.declineConnectionRequest(fromUserId);
      // Remove from invitations
      setInvitations((prev) => prev.filter((i) => i.from._id !== fromUserId));
    } catch (error) {
      console.error("Failed to decline invitation:", error);
    }
  };

  const clearSearch = () => {
    setSearchTerm("");
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">My Network</h1>
          <p className="text-gray-400 text-sm md:text-base">
            Manage your connections and discover new people
          </p>
        </div>

        {/* Stats - Horizontal scroll on mobile */}
        <div className="overflow-x-auto pb-2 mb-6 hide-scrollbar">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 min-w-max">
            <div className="bg-gray-800 rounded-xl p-4 md:p-6 border border-gray-700 min-w-[150px]">
              <div className="flex items-center">
                <Users className="h-6 w-6 md:h-8 md:w-8 text-blue-400 mr-2 md:mr-3" />
                <div>
                  <p className="text-xl md:text-2xl font-bold text-white">
                    {stats?.connections || 0}
                  </p>
                  <p className="text-xs md:text-sm text-gray-400">Connections</p>
                </div>
              </div>
            </div>
            <div className="bg-gray-800 rounded-xl p-4 md:p-6 border border-gray-700 min-w-[150px]">
              <div className="flex items-center">
                <UserPlus className="h-6 w-6 md:h-8 md:w-8 text-green-400 mr-2 md:mr-3" />
                <div>
                  <p className="text-xl md:text-2xl font-bold text-white">
                    {stats?.pendingInvitations || 0}
                  </p>
                  <p className="text-xs md:text-sm text-gray-400">Pending</p>
                </div>
              </div>
            </div>
            <div className="bg-gray-800 rounded-xl p-4 md:p-6 border border-gray-700 min-w-[150px]">
              <div className="flex items-center">
                <Star className="h-6 w-6 md:h-8 md:w-8 text-yellow-400 mr-2 md:mr-3" />
                <div>
                  <p className="text-xl md:text-2xl font-bold text-white">
                    {stats?.followers || 0}
                  </p>
                  <p className="text-xs md:text-sm text-gray-400">Followers</p>
                </div>
              </div>
            </div>
            <div className="bg-gray-800 rounded-xl p-4 md:p-6 border border-gray-700 min-w-[150px]">
              <div className="flex items-center">
                <Award className="h-6 w-6 md:h-8 md:w-8 text-purple-400 mr-2 md:mr-3" />
                <div>
                  <p className="text-xl md:text-2xl font-bold text-white">
                    {stats?.following || 0}
                  </p>
                  <p className="text-xs md:text-sm text-gray-400">Following</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs - Improved mobile scrolling */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 mb-8">
          <div className="flex border-b border-gray-700 overflow-x-auto hide-scrollbar">
            <button
              onClick={() => setActiveTab("suggestions")}
              className={`px-4 py-3 font-medium transition-colors whitespace-nowrap ${activeTab === "suggestions"
                  ? "text-purple-400 border-b-2 border-purple-400"
                  : "text-gray-400 hover:text-white"
                }`}
            >
              Suggestions ({suggestions.length})
            </button>
            <button
              onClick={() => setActiveTab("connections")}
              className={`px-4 py-3 font-medium transition-colors whitespace-nowrap ${activeTab === "connections"
                  ? "text-purple-400 border-b-2 border-purple-400"
                  : "text-gray-400 hover:text-white"
                }`}
            >
              Connections ({connections.length})
            </button>
            <button
              onClick={() => setActiveTab("invitations")}
              className={`px-4 py-3 font-medium transition-colors whitespace-nowrap ${activeTab === "invitations"
                  ? "text-purple-400 border-b-2 border-purple-400"
                  : "text-gray-400 hover:text-white"
                }`}
            >
              Invitations ({invitations.length})
            </button>
          </div>

          <div className="p-4 md:p-6">
            {/* Search bar for Suggestions and Connections tabs */}
            {(activeTab === "suggestions" || activeTab === "connections") && (
              <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder={`Search ${activeTab}...`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setIsSearchFocused(false)}
                  className="w-full pl-10 pr-10 py-3 md:py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-400"
                />
                {searchTerm && (
                  <button 
                    onClick={clearSearch}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    <X className="h-5 w-5" />
                  </button>
                )}
              </div>
            )}

            {activeTab === "connections" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {loading ? (
                  <div className="col-span-full flex justify-center py-8">
                    <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : connections.length === 0 ? (
                  <div className="col-span-full text-center py-8 text-gray-400">
                    {searchTerm ? "No connections match your search" : "No connections yet"}
                  </div>
                ) : (
                  connections.map((person) => (
                    <div
                      key={person._id}
                      className="bg-gray-700 rounded-xl p-4 md:p-6 border border-gray-600 hover:border-purple-500 transition-all duration-300"
                    >
                      <div className="flex items-center mb-4">
                        <div className="relative" onClick={() => navigate(`/profile/c/${encodeURIComponent(person.fullname)}`)}>
                          <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg mr-3 md:mr-4 overflow-hidden">
                            <img
                              src={avatarUrlFrom(person._id, person.fullname, person.avatar)}
                              alt={person.fullname}
                              className="w-full h-full rounded-full object-cover"
                              onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = ((apiBase ? apiBase.replace(/\/$/, '') : '') + '/default_avatar.png'); }}
                            />
                          </div>
                          {person.isOnline && (
                            <div className="absolute -bottom-1 -right-1 w-3 h-3 md:w-4 md:h-4 bg-green-400 rounded-full border-2 border-gray-700"></div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-white cursor-pointer hover:underline truncate" onClick={() => navigate(`/profile/c/${encodeURIComponent(person.fullname)}`)}>
                            {person.fullname}
                          </h3>
                          <p className="text-xs md:text-sm text-gray-400">
                            Year {person.year}
                          </p>
                          <p className="text-xs md:text-sm text-purple-400 line-clamp-2">
                            {person.bio || "Student"}
                          </p>
                        </div>
                        <Code className="h-4 w-4 md:h-5 md:w-5 text-gray-400 flex-shrink-0" />
                      </div>

                      <div className="space-y-2 mb-4 text-xs md:text-sm text-gray-400">
                        <div className="flex items-center">
                          <Calendar className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
                          {person.isOnline
                            ? "Online now"
                            : `Active ${person.lastActive
                              ? new Date(
                                person.lastActive
                              ).toLocaleDateString()
                              : "Recently"
                            }`}
                        </div>
                      </div>

                      <div className="mb-4">
                        <div className="flex flex-wrap gap-1 md:gap-2">
                          {person.skills?.slice(0, 3).map((skill) => (
                            <span
                              key={skill}
                              className="px-2 py-1 bg-purple-600 bg-opacity-20 text-purple-300 rounded text-xs"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button className="flex-1 bg-purple-600 text-white py-2 rounded-lg font-medium hover:bg-purple-700 transition-colors flex items-center justify-center text-sm" onClick={() => navigate(`/messages?to=${person._id}`)}>
                          <MessageCircle className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
                          Message
                        </button>
                        <button className="w-10 bg-gray-600 text-gray-300 rounded-lg font-medium hover:bg-gray-500 transition-colors flex items-center justify-center">
                          <UserCheck className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === "suggestions" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {loading ? (
                  <div className="col-span-full flex justify-center py-8">
                    <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : suggestions.length === 0 ? (
                  <div className="col-span-full text-center py-8 text-gray-400">
                    {searchTerm ? "No suggestions match your search" : "No suggestions available"}
                  </div>
                ) : (
                  suggestions.map((person) => (
                    <div
                      key={person._id}
                      className="bg-gray-700 rounded-xl p-4 md:p-6 border border-gray-600 hover:border-purple-500 transition-all duration-300"
                    >
                      <div className="flex items-center mb-4">
                        <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg mr-3 md:mr-4 overflow-hidden" onClick={() => navigate(`/profile/c/${encodeURIComponent(person.fullname)}`)}>
                          <img
                            src={avatarUrlFrom(person._id, person.fullname, person.avatar)}
                            alt={person.fullname}
                            className="w-full h-full rounded-full object-cover"
                            onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = ((apiBase ? apiBase.replace(/\/$/, '') : '') + '/default_avatar.png'); }}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-white cursor-pointer hover:underline truncate" onClick={() => navigate(`/profile/c/${encodeURIComponent(person.fullname)}`)}>
                            {person.fullname}
                          </h3>
                          <p className="text-xs md:text-sm text-gray-400">
                            Year {person.year}
                          </p>
                          <p className="text-xs md:text-sm text-purple-400 line-clamp-2">
                            {person.bio || "Student"}
                          </p>
                        </div>
                        <Code className="h-4 w-4 md:h-5 md:w-5 text-gray-400 flex-shrink-0" />
                      </div>

                      <div className="space-y-2 mb-4 text-xs md:text-sm text-gray-400">
                        <div className="flex items-center">
                          <Users className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
                          {person.mutualConnections} mutual connections
                        </div>
                        <p className="text-blue-400 text-xs md:text-sm">{person.reason}</p>
                      </div>

                      <div className="mb-4">
                        <div className="flex flex-wrap gap-1 md:gap-2">
                          {person.skills?.slice(0, 3).map((skill) => (
                            <span
                              key={skill}
                              className="px-2 py-1 bg-purple-600 bg-opacity-20 text-purple-300 rounded text-xs"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>

                      <button
                        onClick={() => handleConnect(person._id)}
                        className="w-full bg-purple-600 text-white py-2 rounded-lg font-medium hover:bg-purple-700 transition-colors flex items-center justify-center text-sm"
                      >
                        <UserPlus className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
                        Connect
                      </button>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === "invitations" && (
              <div className="space-y-4 md:space-y-6">
                {loading ? (
                  <div className="flex justify-center py-8">
                    <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : invitations.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    No pending invitations
                  </div>
                ) : (
                  invitations.map((invitation) => (
                    <div
                      key={invitation._id}
                      className="bg-gray-700 rounded-xl p-4 md:p-6 border border-gray-600"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center">
                          <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg mr-3 md:mr-4 overflow-hidden" onClick={() => navigate(`/profile/c/${encodeURIComponent(invitation.from.fullname)}`)}>
                            <img
                              src={avatarUrlFrom(invitation.from._id, invitation.from.fullname, invitation.from.avatar)}
                              alt={invitation.from.fullname}
                              className="w-full h-full rounded-full object-cover"
                              onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = ((apiBase ? apiBase.replace(/\/$/, '') : '') + '/default_avatar.png'); }}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-white cursor-pointer hover:underline truncate" onClick={() => navigate(`/profile/c/${encodeURIComponent(invitation.from.fullname)}`)}>
                              {invitation.from.fullname}
                            </h3>
                            <p className="text-xs md:text-sm text-gray-400">
                              Year {invitation.from.year}
                            </p>
                            <p className="text-xs md:text-sm text-purple-400 line-clamp-2">
                              {invitation.from.bio || "Student"}
                            </p>
                          </div>
                        </div>
                        <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
                          {new Date(invitation.date).toLocaleDateString()}
                        </span>
                      </div>

                      <div className="mt-4 p-3 md:p-4 bg-gray-600 rounded-lg">
                        <p className="text-gray-300 text-xs md:text-sm italic">
                          "Hi! I'd like to connect with you."
                        </p>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-2 mt-4">
                        <button
                          onClick={() =>
                            handleAcceptInvitation(invitation.from._id)
                          }
                          className="flex-1 bg-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-purple-700 transition-colors text-sm"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() =>
                            handleDeclineInvitation(invitation.from._id)
                          }
                          className="flex-1 bg-gray-600 text-gray-300 px-4 py-2 rounded-lg font-medium hover:bg-gray-500 transition-colors text-sm"
                        >
                          Decline
                        </button>
                        <button className="flex-1 bg-gray-600 text-gray-300 px-4 py-2 rounded-lg font-medium hover:bg-gray-500 transition-colors flex items-center justify-center text-sm" onClick={() => navigate(`/messages?to=${invitation.from._id}`)}>
                          <MessageCircle className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
                          Message
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};

export default Network;