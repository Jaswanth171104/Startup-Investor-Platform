import React, { useState, useEffect } from 'react';
import { Search, Filter, Send, Clock, CheckCircle, XCircle, Settings, Eye, Heart, TrendingUp, Users, DollarSign, MapPin } from 'lucide-react';
import { getAuthHeaders, getUserId, viewPitchDeck } from '../utils/auth';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

interface Startup {
  id: number;
  user_id: number;
  company_name: string;
  email: string;
  industry: string;
  stage?: string;
  funding_needed?: string;
  pitch_deck_filename?: string;
  created_at: string;
  short_description?: string; // Added for new card layout
  amount_seeking?: string; // Added for new card layout
  total_funding_raised?: string; // Added for new card layout
  country?: string; // Added for new card layout
  funding_stage?: string; // Added for new card layout
  // Removed check_size_range as it's not a startup field
  company_description?: string; // Added for new card layout
  website_link?: string;
  district?: string;
  state?: string;
  investment_type?: string;
  max_equity_percentage?: string;
  pre_money_valuation?: string;
  team_size?: number;
  total_paying_customers?: number;
  monthly_customer_growth_rate?: number;
  customer_acquisition_cost?: number;
  customer_lifetime_value?: number;
  monthly_burn_rate?: number;
  business_model_description?: string;
  competitive_advantage?: string;
  product_demo_video_link?: string;
}



interface ApplicationLog {
  id: number;
  startup_id: number;
  investor_id: number;
  pitch_deck_filename: string;
  sent_at: string;
  startup_name?: string;
}

interface InterestStatus {
  id: number;
  startup_id: number;
  investor_id: number;
  status: string; // interested, not_interested
  created_at: string;
  startup_name?: string;
}



const tabs = [
  { key: 'startups', label: 'Browse Startups' },
  { key: 'interested', label: 'Interested Startups' },
  { key: 'logs', label: 'Pitch Deck Logs' },
];



const InvestorDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('startups');
  const [startups, setStartups] = useState<Startup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState('');
  const [selectedFundingStage, setSelectedFundingStage] = useState('');
  const [showFilters, setShowFilters] = useState(true); // Always show filters by default
  // Removed selectedCheckSize as it's not applicable to startups

  // Application states
  const [selectedStartup, setSelectedStartup] = useState<Startup | null>(null);
  const [applicationMessage, setApplicationMessage] = useState('');
  const [sendingApplication, setSendingApplication] = useState(false);
  const [viewingStartupProfile, setViewingStartupProfile] = useState<Startup | null>(null);
  const [updatingInterest, setUpdatingInterest] = useState<number | null>(null);

  const [logs, setLogs] = useState<ApplicationLog[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(true);
  const [errorLogs, setErrorLogs] = useState('');
  const [interestStatuses, setInterestStatuses] = useState<InterestStatus[]>([]);
  const [pitchDeckUrl, setPitchDeckUrl] = useState<string | null>(null);
  const [showPitchDeckModal, setShowPitchDeckModal] = useState(false);
  const [pitchDeckFileName, setPitchDeckFileName] = useState<string | null>(null);

    useEffect(() => {
    // Fetch data on component mount
    console.log('🚀 InvestorDashboard mounted');
    fetchStartups();
    fetchLogs(); // Fetch received pitch decks on mount
  }, []); // Empty dependency array - only run once on mount



  const fetchStartups = async () => {
    setLoading(true); // Use the main loading state
    try {
      console.log('🔍 Fetching startups...');
      const response = await fetch(`${API_BASE_URL}/startup-profile/all`, {
        headers: getAuthHeaders(),
      });
      
      console.log('📡 Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Startups data:', data);
        setStartups(data);
      } else {
        const errorText = await response.text();
        console.error('❌ Failed to fetch startups:', response.status, errorText);
        setError('Failed to fetch startups');
      }
    } catch (err) {
      console.error('❌ Network error:', err);
      setError('Network error. Please check your connection.');
    } finally {
      setLoading(false); // Use the main loading state
    }
  };



  const fetchLogs = async () => {
    setLoadingLogs(true);
    setErrorLogs('');
    try {
      const userId = getUserId();
      const response = await fetch(`${API_BASE_URL}/applications/investor/${userId}/received-pitch-decks`, {
        headers: getAuthHeaders(),
      });
      
      if (response.ok) {
        const data = await response.json();
        setLogs(data);
      } else {
        setErrorLogs('Unable to fetch received pitch decks');
      }
    } catch (err) {
      setErrorLogs('Unable to fetch received pitch decks');
    } finally {
      setLoadingLogs(false);
    }
  };



  const handleInterestStatus = async (startupId: number, status: 'interested' | 'not_interested') => {
    setUpdatingInterest(startupId);
    setError('');
    
    try {
      const response = await fetch(`${API_BASE_URL}/applications/update-interest`, {
        method: 'POST',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          startup_id: startupId,
          status: status,
        }),
      });
      
      if (response.ok) {
        // Refresh interest statuses
  
      } else {
        setError('Failed to update interest status');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setUpdatingInterest(null);
    }
  };

  const getInterestStatus = (startupId: number) => {
    // Find the startup to get the user_id
    const startup = startups.find(s => s.id === startupId);
    if (!startup) return null;
    
    const interestStatus = interestStatuses.find(status => status.startup_id === startup.id);
    return interestStatus?.status || null;
  };

  const sendApplication = async (startupId: number) => {
    if (!applicationMessage.trim()) {
      alert('Please enter a message');
      return;
    }

    setSendingApplication(true);
    try {
      const response = await fetch(`${API_BASE_URL}/applications/update-interest`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify({
          startup_id: startupId,
          status: 'interested'
        }),
      });

      if (response.ok) {
        setApplicationMessage('');
        setSelectedStartup(null);

        alert('Interest expressed successfully!');
      } else {
        const errorData = await response.json().catch(() => ({}));
        alert(`Failed to express interest: ${errorData.detail || 'Unknown error'}`);
      }
    } catch (err) {
      console.error('Express interest error:', err);
      alert('Network error. Please try again.');
    } finally {
      setSendingApplication(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'accepted':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };



  const filteredStartups = startups.filter(startup => {
    console.log('🔍 Filtering startup:', startup.company_name);
    
    // Check if this investor has already expressed interest in this startup
    const hasExpressedInterest = interestStatuses.some(status => 
      status.startup_id === startup.id && status.investor_id === getUserId()
    );
    
    console.log('   Interest statuses:', interestStatuses.length);
    console.log('   Has expressed interest:', hasExpressedInterest);
    
    // If interest already expressed, exclude from dashboard
    if (hasExpressedInterest) {
      console.log('   ❌ Excluding - already expressed interest');
      return false;
    }
    
    // Only apply search filter if search term is not empty
    const matchesSearch = !searchTerm || 
      startup.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      startup.industry?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      startup.funding_stage?.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Only apply filters if they are explicitly selected
    const matchesIndustry = !selectedIndustry || (startup.industry === selectedIndustry);
    const matchesFundingStage = !selectedFundingStage || (startup.funding_stage === selectedFundingStage);
    
    const shouldShow = matchesSearch && matchesIndustry && matchesFundingStage;
    console.log('   ✅ Should show:', shouldShow);
    
    return shouldShow;
  });

  // Debug effect to log startup counts
  useEffect(() => {
    console.log('📊 Startup counts:');
    console.log('   Total startups:', startups.length);
    console.log('   Filtered startups:', filteredStartups.length);
    console.log('   Interest statuses:', interestStatuses.length);
    console.log('   Loading state:', loading);
    console.log('   Error state:', error);
  }, [startups, filteredStartups, interestStatuses, loading, error]);

  const getUniqueStringValues = (arr: Startup[], key: keyof Startup) => {
    const uniqueValues = new Set<string>();
    arr.forEach(item => {
      const value = item[key];
      if (value && typeof value === 'string') {
        uniqueValues.add(value);
      }
    });
    return Array.from(uniqueValues).sort();
  };

  // Helper function to detect file type
  const getFileType = (filename: string): 'pdf' | 'powerpoint' | 'unknown' => {
    const extension = filename.toLowerCase().split('.').pop();
    if (extension === 'pdf') return 'pdf';
    if (extension === 'ppt' || extension === 'pptx') return 'powerpoint';
    return 'unknown';
  };



  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-yellow-50">
      {/* Premium Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Investor Dashboard</h1>
              <p className="text-gray-600 mt-1">Discover and connect with innovative startups</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl border border-yellow-200">
                <Users className="w-4 h-4 text-yellow-600" />
                <span className="text-sm font-medium text-gray-700">
                  {filteredStartups.length} Startups
                </span>
              </div>
              <button
                onClick={() => window.location.href = '/investor-profile-edit'}
                className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-xl font-medium hover:from-yellow-600 hover:to-orange-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <Settings className="w-4 h-4" />
                <span>Edit Profile</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Premium Tab Navigation */}
        <div className="flex space-x-1 bg-white/60 backdrop-blur-sm rounded-2xl p-2 shadow-lg border border-gray-100 mb-8">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                activeTab === tab.key
                  ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-lg'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-white/80'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Main Content */}
        <div className="space-y-8">
          
          {/* Startups Tab */}
          {activeTab === 'startups' && (
            <div>
              {/* Enhanced Search and Filters */}
              <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-gray-100 mb-8">
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Search */}
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        placeholder="Search startups by name, industry, or stage..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-200"
                      />
                    </div>
                  </div>
                  
                  {/* Filter Toggle */}
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="flex items-center gap-2 px-6 py-4 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-xl font-medium hover:from-yellow-600 hover:to-orange-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                    <Filter className="w-4 h-4" />
                    {showFilters ? 'Hide Filters' : 'Show Filters'}
                  </button>
                </div>

                {/* Enhanced Filters */}
                {showFilters && (
                  <div className="mt-6 p-6 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl border border-yellow-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Filter Options</h3>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Industry</label>
                        <select
                          value={selectedIndustry}
                          onChange={(e) => setSelectedIndustry(e.target.value)}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                        >
                          <option value="">All Industries</option>
                          {getUniqueStringValues(startups, 'industry').map(industry => (
                            <option key={industry} value={industry}>{industry}</option>
                          ))}
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Funding Stage</label>
                        <select
                          value={selectedFundingStage}
                          onChange={(e) => setSelectedFundingStage(e.target.value)}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                        >
                          <option value="">All Stages</option>
                          {getUniqueStringValues(startups, 'funding_stage').map(stage => (
                            <option key={stage} value={stage}>{stage}</option>
                          ))}
                        </select>
                      </div>
                      
                      {/* Removed check size filter as it's not applicable to startups */}
                      
                      <div className="flex items-end">
                        <button
                          onClick={() => {
                            setSelectedIndustry('');
                            setSelectedFundingStage('');
                            setSearchTerm('');
                          }}
                          className="w-full px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                        >
                          Clear Filters
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Enhanced Startup Cards */}
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100 animate-pulse">
                      <div className="h-4 bg-gray-200 rounded mb-4"></div>
                      <div className="h-3 bg-gray-200 rounded mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded mb-4"></div>
                      <div className="h-20 bg-gray-200 rounded mb-4"></div>
                      <div className="flex space-x-2">
                        <div className="h-8 bg-gray-200 rounded flex-1"></div>
                        <div className="h-8 bg-gray-200 rounded flex-1"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : error ? (
                <div className="text-center py-12">
                  <div className="text-gray-400 text-6xl mb-4">⚠️</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Unable to load startups</h3>
                  <p className="text-gray-600 mb-4">{error}</p>
                  <button
                    onClick={fetchStartups}
                    className="px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-xl font-medium hover:from-yellow-600 hover:to-orange-600 transition-all duration-300 shadow-lg hover:shadow-xl"
                  >
                    Try Again
                  </button>
                </div>
              ) : filteredStartups.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-gray-400 text-6xl mb-4">🔍</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No startups found</h3>
                  <p className="text-gray-600">Try adjusting your search criteria or filters</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {filteredStartups.map((startup) => (
                    <div key={startup.id} className="group bg-white rounded-2xl shadow-xl hover:shadow-2xl border border-gray-100 overflow-hidden transition-all duration-300 transform hover:-translate-y-2">
                      {/* Card Header */}
                      <div className="p-6 border-b border-gray-100">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-yellow-600 transition-colors">
                              {startup.company_name}
                            </h3>
                            <div className="flex items-center space-x-2 text-sm text-gray-600 mb-3">
                              <MapPin className="w-4 h-4" />
                              <span>{startup.district}, {startup.state}</span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-1 px-3 py-1 bg-gradient-to-r from-yellow-100 to-orange-100 rounded-full">
                            <TrendingUp className="w-4 h-4 text-yellow-600" />
                            <span className="text-sm font-medium text-yellow-800">{startup.funding_stage}</span>
                          </div>
                        </div>
                        
                        <p className="text-gray-600 text-sm leading-relaxed mb-4">
                          {startup.short_description || startup.company_description || 'No description available'}
                        </p>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div className="flex items-center space-x-2">
                            <DollarSign className="w-4 h-4 text-green-600" />
                            <span className="text-gray-700">
                              {startup.amount_seeking ? `₹${parseInt(startup.amount_seeking).toLocaleString()}` : 'Not specified'}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Users className="w-4 h-4 text-blue-600" />
                            <span className="text-gray-700">
                              {startup.team_size ? `${startup.team_size} people` : 'Not specified'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Card Actions */}
                      <div className="p-6">
                        <div className="flex space-x-3 mb-4">
                          <button
                            onClick={() => setViewingStartupProfile(startup)}
                            className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-xl font-medium hover:from-yellow-600 hover:to-orange-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                          >
                            <Eye className="w-4 h-4" />
                            <span>View Profile</span>
                          </button>
                          
                          <button
                            onClick={async () => {
                              alert('No pitch deck has been sent for this startup yet. Pitch decks will appear in the "Pitch Deck Logs" tab once sent.');
                            }}
                            className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors cursor-not-allowed"
                          >
                            No Pitch Deck
                          </button>
                        </div>

                        {/* Interest Buttons */}
                        <div className="flex space-x-3">
                          <button
                            onClick={() => handleInterestStatus(startup.id, 'interested')}
                            disabled={updatingInterest === startup.id}
                            className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-xl font-medium transition-all duration-300 ${
                              getInterestStatus(startup.id) === 'interested'
                                ? 'bg-green-500 text-white shadow-lg'
                                : 'bg-green-100 text-green-700 hover:bg-green-200'
                            }`}
                          >
                            <Heart className="w-4 h-4" />
                            <span>
                              {updatingInterest === startup.id ? 'Updating...' : 
                               getInterestStatus(startup.id) === 'interested' ? 'Interested' : 'Interested'}
                            </span>
                          </button>
                          
                          <button
                            onClick={() => handleInterestStatus(startup.id, 'not_interested')}
                            disabled={updatingInterest === startup.id}
                            className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-xl font-medium transition-all duration-300 ${
                              getInterestStatus(startup.id) === 'not_interested'
                                ? 'bg-red-500 text-white shadow-lg'
                                : 'bg-red-100 text-red-700 hover:bg-red-200'
                            }`}
                          >
                            <XCircle className="w-4 h-4" />
                            <span>
                              {updatingInterest === startup.id ? 'Updating...' : 
                               getInterestStatus(startup.id) === 'not_interested' ? 'Not Interested' : 'Not Interested'}
                            </span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Interested Startups Tab */}
          {activeTab === 'interested' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-gray-900">Interested Startups</h2>
              </div>
              
              {interestStatuses.filter(status => status.status === 'interested').length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-gray-400 text-6xl mb-4">🎯</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No interested startups yet</h3>
                  <p className="text-gray-600">Mark startups as interested to see them here</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {interestStatuses
                    .filter(status => status.status === 'interested')
                    .map(status => {
                      const startup = startups.find(s => s.id === status.startup_id);
                      return (
                        <div key={status.id} className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                                <span className="text-yellow-600 font-bold">✓</span>
                              </div>
                              <div>
                                <h3 className="font-semibold text-gray-900">{startup?.company_name || status.startup_name || `Startup ${status.startup_id}`}</h3>
                                <p className="text-sm text-gray-600">{startup?.industry || 'Unknown Industry'}</p>
                              </div>
                            </div>
                            <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium border border-yellow-300">
                              Interested
                            </span>
                          </div>
                          
                          {startup && (
                            <div className="space-y-3">
                              <div className="text-sm text-gray-600">
                                <strong>Funding Stage:</strong> {startup.funding_stage || 'Not specified'}
                              </div>
                              <div className="text-sm text-gray-600">
                                <strong>Amount Seeking:</strong> {startup.amount_seeking || 'Not specified'}
                              </div>
                              <div className="text-sm text-gray-600">
                                <strong>Team Size:</strong> {startup.team_size || 'Not specified'} people
                              </div>
                              
                              <div className="flex gap-2 mt-4">
                                <button
                                  onClick={() => setViewingStartupProfile(startup)}
                                  className="flex-1 px-3 py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition-colors"
                                >
                                  View Profile
                                </button>
                                {startup.pitch_deck_filename && (
                                  <button
                                    onClick={() => {
                                      alert('Pitch deck will be available once the startup sends it to you. Currently, no pitch deck has been sent.');
                                    }}
                                    className="flex-1 px-3 py-2 bg-gray-300 text-gray-500 text-sm rounded-lg cursor-not-allowed"
                                    disabled
                                  >
                                    No Pitch Deck Sent
                                  </button>
                                )}
                              </div>
                            </div>
                          )}
                          
                          <div className="text-xs text-gray-500 mt-3">
                            Marked interested on {new Date(status.created_at).toLocaleDateString()}
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
          )}

          {/* Interest Status Logs Tab */}
          {activeTab === 'logs' && (
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Interest Status Logs</h2>
              
              {interestStatuses.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-gray-400 text-6xl mb-4">📋</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No interest expressions yet</h3>
                  <p className="text-gray-600">Start browsing startups to express your first interest</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {interestStatuses.map((status) => (
                    <div key={status.id} className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {status.startup_name || `Startup ${status.startup_id}`}
                          </h3>
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(status.status)}
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            status.status === 'interested' 
                              ? 'bg-yellow-100 text-yellow-800 border border-yellow-300' 
                              : 'bg-gray-100 text-gray-800 border border-gray-300'
                          }`}>
                            {status.status === 'interested' ? 'Interested' : 'Not Interested'}
                          </span>
                        </div>
                      </div>
                      
                      <div className="text-sm text-gray-500">
                        Expressed on {new Date(status.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Received Pitch Decks Tab */}
          {activeTab === 'logs' && (
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Received Pitch Decks</h2>
              {loadingLogs ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto"></div>
                  <p className="mt-4 text-gray-600">Loading pitch decks...</p>
                </div>
              ) : errorLogs ? (
                <div className="text-center py-12">
                  <div className="text-gray-400 text-6xl mb-4">⚠️</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Unable to load pitch decks</h3>
                  <p className="text-gray-600 mb-4">{errorLogs}</p>
                  <button
                    onClick={fetchLogs}
                    className="px-4 py-2 bg-yellow-500 text-gray-900 font-semibold rounded-lg hover:bg-yellow-600 transition-colors"
                  >
                    Try Again
                  </button>
                </div>
              ) : logs.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-gray-400 text-6xl mb-4">📋</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No pitch decks received</h3>
                  <p className="text-gray-600">You have not received any pitch decks yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {logs.map((log) => (
                    <div key={log.id} className="bg-white rounded-lg shadow-md border border-gray-200 p-6 flex flex-col md:flex-row md:items-center md:justify-between">
                      <div>
                        <div className="font-semibold text-gray-900 mb-1">{log.startup_name}</div>
                        <div className="text-gray-600 text-sm mb-2">Received: {new Date(log.sent_at).toLocaleString()}</div>
                      </div>
                      <button
                        onClick={async () => {
                          try {
                            const url = await viewPitchDeck(log.id);
                            setPitchDeckUrl(url);
                            setPitchDeckFileName(log.pitch_deck_filename || 'pitch_deck.pdf');
                            setShowPitchDeckModal(true);
                          } catch (error) {
                            console.error('View error:', error);
                            alert(`Failed to view pitch deck: ${error instanceof Error ? error.message : 'Unknown error'}`);
                          }
                        }}
                        className="text-yellow-700 hover:text-yellow-900 font-medium underline text-sm mt-2 md:mt-0 cursor-pointer"
                      >
                        Open Pitch Deck
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Startup Profile Modal */}
      {viewingStartupProfile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6 p-6 border-b border-gray-200">
              <h3 className="text-2xl font-bold text-gray-900">Startup Profile</h3>
              <button
                onClick={() => setViewingStartupProfile(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6">
              {/* Company Information */}
              <div className="mb-8">
                <h4 className="text-xl font-semibold text-gray-900 mb-4">Company Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                    <p className="text-gray-900 font-medium">{viewingStartupProfile.company_name || 'Not specified'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Industry</label>
                    <p className="text-gray-900">{viewingStartupProfile.industry || 'Not specified'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                    <p className="text-gray-900">
                      {viewingStartupProfile.website_link ? (
                        <a href={viewingStartupProfile.website_link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline">
                          {viewingStartupProfile.website_link}
                        </a>
                      ) : 'Not specified'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                    <p className="text-gray-900">
                      {viewingStartupProfile.district && viewingStartupProfile.state 
                        ? `${viewingStartupProfile.district}, ${viewingStartupProfile.state}`
                        : 'Not specified'
                      }
                    </p>
                  </div>
                </div>
                
                {viewingStartupProfile.company_description && (
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Company Description</label>
                    <p className="text-gray-900 leading-relaxed">{viewingStartupProfile.company_description}</p>
                  </div>
                )}
              </div>

              {/* Financial Information */}
              <div className="mb-8">
                <h4 className="text-xl font-semibold text-gray-900 mb-4">Financial Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Amount Seeking</label>
                    <p className="text-gray-900 font-medium">
                      {viewingStartupProfile.amount_seeking 
                        ? `$${parseInt(viewingStartupProfile.amount_seeking).toLocaleString()}`
                        : 'Not specified'
                      }
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Total Funding Raised</label>
                    <p className="text-gray-900">
                      {viewingStartupProfile.total_funding_raised 
                        ? `$${parseInt(viewingStartupProfile.total_funding_raised).toLocaleString()}`
                        : 'Not specified'
                      }
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Funding Stage</label>
                    <p className="text-gray-900">{viewingStartupProfile.funding_stage || 'Not specified'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Investment Type</label>
                    <p className="text-gray-900">{viewingStartupProfile.investment_type || 'Not specified'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Max Equity Percentage</label>
                    <p className="text-gray-900">
                      {viewingStartupProfile.max_equity_percentage 
                        ? `${viewingStartupProfile.max_equity_percentage}%`
                        : 'Not specified'
                      }
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Pre-money Valuation</label>
                    <p className="text-gray-900">
                      {viewingStartupProfile.pre_money_valuation 
                        ? `$${parseInt(viewingStartupProfile.pre_money_valuation).toLocaleString()}`
                        : 'Not specified'
                      }
                    </p>
                  </div>
                </div>
              </div>

              {/* Business Metrics */}
              <div className="mb-8">
                <h4 className="text-xl font-semibold text-gray-900 mb-4">Business Metrics</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Team Size</label>
                    <p className="text-gray-900">{viewingStartupProfile.team_size || 'Not specified'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Total Paying Customers</label>
                    <p className="text-gray-900">
                      {viewingStartupProfile.total_paying_customers 
                        ? viewingStartupProfile.total_paying_customers.toLocaleString()
                        : 'Not specified'
                      }
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Customer Growth Rate</label>
                    <p className="text-gray-900">
                      {viewingStartupProfile.monthly_customer_growth_rate 
                        ? `${viewingStartupProfile.monthly_customer_growth_rate}%`
                        : 'Not specified'
                      }
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Customer Acquisition Cost</label>
                    <p className="text-gray-900">
                      {viewingStartupProfile.customer_acquisition_cost 
                        ? `$${viewingStartupProfile.customer_acquisition_cost.toLocaleString()}`
                        : 'Not specified'
                      }
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Customer Lifetime Value</label>
                    <p className="text-gray-900">
                      {viewingStartupProfile.customer_lifetime_value 
                        ? `$${viewingStartupProfile.customer_lifetime_value.toLocaleString()}`
                        : 'Not specified'
                      }
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Burn Rate</label>
                    <p className="text-gray-900">
                      {viewingStartupProfile.monthly_burn_rate 
                        ? `$${viewingStartupProfile.monthly_burn_rate.toLocaleString()}`
                        : 'Not specified'
                      }
                    </p>
                  </div>
                </div>
              </div>

              {/* Additional Information */}
              <div className="mb-8">
                <h4 className="text-xl font-semibold text-gray-900 mb-4">Additional Information</h4>
                <div className="space-y-4">
                  {viewingStartupProfile.business_model_description && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Business Model</label>
                      <p className="text-gray-900 leading-relaxed">{viewingStartupProfile.business_model_description}</p>
                    </div>
                  )}
                  {viewingStartupProfile.competitive_advantage && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Competitive Advantage</label>
                      <p className="text-gray-900 leading-relaxed">{viewingStartupProfile.competitive_advantage}</p>
                    </div>
                  )}
                  {viewingStartupProfile.product_demo_video_link && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Product Demo Video</label>
                      <p className="text-gray-900">
                        <a href={viewingStartupProfile.product_demo_video_link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline">
                          Watch Demo Video
                        </a>
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-6 border-t border-gray-200">
                <button
                  onClick={() => setViewingStartupProfile(null)}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setSelectedStartup(viewingStartupProfile);
                    setViewingStartupProfile(null);
                  }}
                  className="px-6 py-2 bg-yellow-500 text-gray-900 font-semibold rounded-lg hover:bg-yellow-600"
                >
                  Express Interest
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Application Modal */}
      {selectedStartup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Send Application</h3>
              <button
                onClick={() => setSelectedStartup(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">
                Sending application to <span className="font-semibold">{selectedStartup.company_name}</span>
              </p>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Message
              </label>
              <textarea
                value={applicationMessage}
                onChange={(e) => setApplicationMessage(e.target.value)}
                placeholder="Introduce yourself and why you're interested in this startup..."
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 resize-none"
                rows={4}
              />
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => setSelectedStartup(null)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => sendApplication(selectedStartup.id)}
                disabled={sendingApplication || !applicationMessage.trim()}
                className="flex-1 px-4 py-2 bg-yellow-500 text-gray-900 font-semibold rounded-lg hover:bg-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {sendingApplication ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Send Application
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pitch Deck Modal */}
      {showPitchDeckModal && pitchDeckUrl && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl h-5/6 flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Pitch Deck</h3>
              <button
                onClick={() => {
                  setShowPitchDeckModal(false);
                  setPitchDeckUrl(null);
                  setPitchDeckFileName(null);
                  // Clean up the blob URL
                  if (pitchDeckUrl) {
                    window.URL.revokeObjectURL(pitchDeckUrl);
                  }
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            <div className="flex-1 p-4">
              {pitchDeckUrl && pitchDeckFileName && (
                <>
                  {getFileType(pitchDeckFileName) === 'pdf' ? (
                    // PDF can be previewed
                    <iframe
                      src={pitchDeckUrl}
                      className="w-full h-full border-0"
                      title="Pitch Deck"
                    />
                  ) : (
                    // PowerPoint files need to be downloaded
                    <div className="w-full h-full flex flex-col items-center justify-center">
                      <div className="text-center mb-4">
                        <p className="text-gray-600 mb-2">Pitch deck file is ready for download</p>
                        <p className="text-sm text-gray-500">PowerPoint files cannot be previewed in the browser</p>
                      </div>
                      <a
                        href={pitchDeckUrl}
                        download={pitchDeckFileName}
                        className="px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-xl font-medium hover:from-yellow-600 hover:to-orange-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                      >
                        Download Pitch Deck
                      </a>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvestorDashboard; 