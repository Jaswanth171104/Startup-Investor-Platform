import React, { useState, useEffect } from 'react';
import { Search, Filter, Send, Clock, CheckCircle, XCircle, User, FileText, Settings } from 'lucide-react';
import { getAuthHeaders, getUserId, viewPitchDeck } from '../utils/auth';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

interface Investor {
  id: number;
  user_id: number;
  full_name: string;
  email: string;
  investor_type: string;
  firm_name?: string;
  investment_stages: string[];
  check_size_range: string;
  geographic_focus: string[];
  industry_focus: string[];
  investment_philosophy: string;
  profile_photo_filename?: string;
  profile_photo_file_path?: string;
  professional_background?: string[];
  created_at: string;
}

interface Application {
  id: number;
  startup_id: number;
  investor_id: number;
  status: string;
  message: string;
  created_at: string;
  investor?: Investor;
  investor_name?: string;
  sent_at?: string;
  pitch_deck_filename?: string;
}

interface InterestStatus {
  id: number;
  startup_id: number;
  investor_id: number;
  status: string; // interested, not_interested
  created_at: string;
  investor_name?: string;
}



const tabs = [
  { key: 'investors', label: 'Browse Investors' },
  { key: 'pitch-deck', label: 'Pitch Deck Management' },
  { key: 'logs', label: 'Application Logs' },
];

// Tag color helpers
const tagColors = {
  stage: 'bg-yellow-100 text-yellow-800',
  industry: 'bg-blue-100 text-blue-800',
  type: 'bg-green-100 text-green-800',
  background: 'bg-purple-100 text-purple-800',
};

type InvestorArrayKeys = 'investment_stages' | 'industry_focus';
type InvestorStringKeys = 'check_size_range';



// Helper to get all unique options for a given key from the full investors array
function getAllUniqueOptions(arr: Investor[], key: 'investment_stages' | 'industry_focus' | 'check_size_range'): string[] {
  if (key === 'check_size_range') {
    // For check_size_range, which is a string
    return Array.from(new Set(arr.map(inv => inv.check_size_range).filter(Boolean))).sort();
  } else {
    // For array fields
    const allValues = arr.flatMap(inv => {
      const val = inv[key];
      if (Array.isArray(val)) return val;
      if (typeof val === 'string' && val) return [val];
      return [];
    });
    return Array.from(new Set(allValues)).sort();
  }
}

const StartupDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('investors');
  const [investors, setInvestors] = useState<Investor[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(true); // Always show filters by default
  const [selectedStage, setSelectedStage] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState('');
  const [selectedCheckSize, setSelectedCheckSize] = useState('');
  const [selectedInvestor, setSelectedInvestor] = useState<Investor | null>(null);
  const [applicationMessage, setApplicationMessage] = useState('');
  const [sendingApplication, setSendingApplication] = useState(false);
  const [selectMode, setSelectMode] = useState(false);
  const [selectedInvestors, setSelectedInvestors] = useState<number[]>([]);
  const [sendingPitchDeck, setSendingPitchDeck] = useState(false);
  const [logs, setLogs] = useState<Application[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(true);
  const [errorLogs, setErrorLogs] = useState('');
  const [interestStatuses, setInterestStatuses] = useState<InterestStatus[]>([]);

  const [pitchDeckUrl, setPitchDeckUrl] = useState<string | null>(null);
  const [showPitchDeckModal, setShowPitchDeckModal] = useState(false);
  const [pitchDeckFileName, setPitchDeckFileName] = useState<string | null>(null);
  const [currentPitchDeck, setCurrentPitchDeck] = useState<{ filename: string; file_path: string } | null>(null);
  const [updatingPitchDeck, setUpdatingPitchDeck] = useState(false);
  const [newPitchDeckFile, setNewPitchDeckFile] = useState<File | null>(null);

  useEffect(() => {
    // Fetch data on component mount
    fetchInvestors();
    fetchApplications();
    fetchLogs(); // Fetch sent pitch decks on mount
    fetchCurrentPitchDeck(); // Fetch current pitch deck
  }, []); // Empty dependency array - only run once on mount

  const fetchInvestors = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_BASE_URL}/investor-profile/all`, {
        headers: getAuthHeaders(),
      });
      
      if (response.ok) {
        const data = await response.json();
        setInvestors(data);
      } else {
        setError('Failed to fetch investors');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchApplications = async () => {
    try {
      const userId = getUserId();
      const response = await fetch(`${API_BASE_URL}/applications/startup/${userId}/sent-pitch-decks`, {
        headers: getAuthHeaders(),
      });
      if (response.ok) {
        const data = await response.json();
        setApplications(data);
      } else {
        console.error('Failed to fetch applications:', response.status);
      }
    } catch (err) {
      console.error('Failed to fetch applications:', err);
    }
  };

  const sendApplication = async (investorId: number) => {
    if (!applicationMessage.trim()) {
      alert('Please enter a message');
      return;
    }

    setSendingApplication(true);
    try {
      const userId = getUserId();
      const response = await fetch(`${API_BASE_URL}/applications/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify({
          startup_id: userId,
          investor_id: investorId,
          message: applicationMessage,
          status: 'pending'
        }),
      });

      if (response.ok) {
        setApplicationMessage('');
        setSelectedInvestor(null);
        fetchApplications(); // Refresh applications
        alert('Application sent successfully!');
      } else {
        const errorData = await response.json().catch(() => ({}));
        alert(`Failed to send application: ${errorData.detail || 'Unknown error'}`);
      }
    } catch (err) {
      console.error('Send application error:', err);
      alert('Network error. Please try again.');
    } finally {
      setSendingApplication(false);
    }
  };

  const handleInvestorSelect = (id: number) => {
    setSelectedInvestors(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleSendPitchDeck = async () => {
    if (selectedInvestors.length === 0) return;
    
    setSendingPitchDeck(true);
    setError('');
    
    try {
      const promises = selectedInvestors.map(investorId =>
        fetch(`${API_BASE_URL}/applications/send-pitch-deck`, {
          method: 'POST',
          headers: {
            ...getAuthHeaders(),
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ investor_id: investorId }),
        })
      );
      
      const responses = await Promise.all(promises);
      const allSuccessful = responses.every(response => response.ok);
      
      if (allSuccessful) {
        setSelectedInvestors([]);
        setSelectMode(false);
        fetchApplications(); // Refresh logs
        fetchInvestors(); // Refresh investor list
      } else {
        setError('Failed to send some pitch decks');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setSendingPitchDeck(false);
    }
  };

  const fetchLogs = async () => {
    setLoadingLogs(true);
    setErrorLogs('');
    try {
      const userId = getUserId();
      const response = await fetch(`${API_BASE_URL}/applications/startup/${userId}/sent-pitch-decks`, {
        headers: getAuthHeaders(),
      });
      if (response.ok) {
        const data = await response.json();
        setLogs(data);
      } else {
        throw new Error(`Failed to fetch sent pitch decks (${response.status})`);
      }
    } catch (err) {
      console.error('Fetch sent pitch decks error:', err);
      setErrorLogs('Network error. Please check your connection.');
    } finally {
      setLoadingLogs(false);
    }
  };





  // These should be outside the component or at the top, but always use the full investors array
  const uniqueStages = getAllUniqueOptions(investors, 'investment_stages');
  const uniqueIndustries = getAllUniqueOptions(investors, 'industry_focus');
  const uniqueCheckSizes = getAllUniqueOptions(investors, 'check_size_range');

  // Filtering logic - show all investors by default, only filter when explicitly set
  const filteredInvestors = investors.filter(investor => {
    // Only apply search filter if search term is not empty
    const matchesSearch = !searchTerm ||
      investor.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      investor.firm_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      investor.investor_type?.toLowerCase().includes(searchTerm.toLowerCase());

    // Only apply filters if they are explicitly selected
    const matchesStage =
      !selectedStage ||
      (Array.isArray(investor.investment_stages) && investor.investment_stages.includes(selectedStage));

    const matchesIndustry =
      !selectedIndustry ||
      (Array.isArray(investor.industry_focus) && investor.industry_focus.includes(selectedIndustry));

    const matchesCheckSize =
      !selectedCheckSize || investor.check_size_range === selectedCheckSize;

    // Filter out investors who have already received pitch decks
    const hasReceivedPitchDeck = applications.some(app => app.investor_id === investor.user_id);

    return matchesSearch && matchesStage && matchesIndustry && matchesCheckSize && !hasReceivedPitchDeck;
  });

  const hasApplicationToInvestor = (investorId: number) => {
    return applications.some(app => app.investor_id === investorId);
  };



  const getInterestStatus = (investorId: number) => {
    const interestStatus = interestStatuses.find(status => status.investor_id === investorId);
    return interestStatus?.status || null;
  };

  // Helper function to detect file type
  const getFileType = (filename: string): 'pdf' | 'powerpoint' | 'unknown' => {
    const extension = filename.toLowerCase().split('.').pop();
    if (extension === 'pdf') return 'pdf';
    if (extension === 'ppt' || extension === 'pptx') return 'powerpoint';
    return 'unknown';
  };

  // Pitch Deck Management Functions
  const fetchCurrentPitchDeck = async () => {
    try {
      const userId = getUserId();
      const response = await fetch(`${API_BASE_URL}/startup-profile/user/${userId}`, {
        headers: getAuthHeaders(),
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.pitch_deck_filename && data.pitch_deck_file_path) {
          setCurrentPitchDeck({
            filename: data.pitch_deck_filename,
            file_path: data.pitch_deck_file_path
          });
        }
      }
    } catch (err) {
      console.error('Failed to fetch current pitch deck:', err);
    }
  };

  const handlePitchDeckUpdate = async () => {
    if (!newPitchDeckFile) {
      alert('Please select a new pitch deck file');
      return;
    }

    setUpdatingPitchDeck(true);
    try {
      const formData = new FormData();
      formData.append('pitch_deck', newPitchDeckFile);

      const response = await fetch(`${API_BASE_URL}/startup-profile/update-pitch-deck`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setCurrentPitchDeck({
          filename: data.filename,
          file_path: `uploads/pitch_decks/${data.filename}`
        });
        setNewPitchDeckFile(null);
        alert('Pitch deck updated successfully!');
      } else {
        const errorData = await response.json();
        alert(`Failed to update pitch deck: ${errorData.detail || 'Unknown error'}`);
      }
    } catch (err) {
      console.error('Update pitch deck error:', err);
      alert('Network error. Please try again.');
    } finally {
      setUpdatingPitchDeck(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setNewPitchDeckFile(file);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f7f7f7' }}>
      {/* Sidebar */}
      <nav style={{ width: 220, background: '#fff', borderRight: '1px solid #eee', display: 'flex', flexDirection: 'column', padding: 0, height: '100vh' }}>
        <div style={{ fontWeight: 700, fontSize: 24, color: '#222', padding: '32px 0 24px 0', textAlign: 'center', letterSpacing: 1 }}>Startup Dashboard</div>
        
        {/* Profile Button */}
        <div style={{ padding: '0 32px 20px 32px' }}>
          <button
            onClick={() => window.location.href = '/startup-profile-edit'}
            style={{
              background: 'transparent',
              color: '#222',
              border: '2px solid #FFD600',
              outline: 'none',
              fontWeight: 600,
              fontSize: 16,
              padding: '12px 16px',
              cursor: 'pointer',
              width: '100%',
              textAlign: 'center',
              borderRadius: '8px',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#FFD600';
              e.currentTarget.style.color = '#222';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = '#222';
            }}
          >
            <Settings className="w-4 h-4" />
            Edit Profile
          </button>
        </div>
        
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                background: activeTab === tab.key ? '#FFD600' : 'transparent',
                color: activeTab === tab.key ? '#222' : '#222',
                border: 'none',
                outline: 'none',
                fontWeight: 600,
                fontSize: 18,
                padding: '18px 0',
                cursor: 'pointer',
                width: '100%',
                textAlign: 'left',
                paddingLeft: 32,
                transition: 'background 0.2s',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </nav>

      {/* Main Content */}
      <main style={{ flex: 1, padding: 0, background: '#f7f7f7', minHeight: '100vh' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 32px' }}>
          
          {/* Investors Tab */}
          {activeTab === 'investors' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-gray-900">Browse Investors</h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectMode(!selectMode)}
                    className="flex items-center gap-2 px-4 py-2 bg-yellow-500 text-gray-900 font-semibold rounded-lg hover:bg-yellow-600 transition-colors"
                  >
                    Common Pitch Deck
                  </button>
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    <Filter className="w-4 h-4" />
                    Filters
                  </button>
                </div>
              </div>

              {/* Search Bar */}
              <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search investors by name, firm, or type..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                />
              </div>

              {/* Filters */}
              {showFilters && (
                <div className="bg-white p-4 rounded-lg mb-6 border border-gray-200">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Investment Stage</label>
                      <select
                        value={selectedStage}
                        onChange={(e) => setSelectedStage(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                      >
                        <option value="">All Stages</option>
                        {uniqueStages.map(stage => (
                          <option key={stage} value={stage}>{stage}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Industry Focus</label>
                      <select
                        value={selectedIndustry}
                        onChange={(e) => setSelectedIndustry(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                      >
                        <option value="">All Industries</option>
                        {uniqueIndustries.map(industry => (
                          <option key={industry} value={industry}>{industry}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Check Size</label>
                      <select
                        value={selectedCheckSize}
                        onChange={(e) => setSelectedCheckSize(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                      >
                        <option value="">All Sizes</option>
                        {uniqueCheckSizes.map(size => (
                          <option key={size} value={size}>{size}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex gap-2 mt-6 md:mt-0">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedStage('');
                          setSelectedIndustry('');
                          setSelectedCheckSize('');
                        }}
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg border border-gray-300 hover:bg-gray-200"
                      >
                        Reset Filters
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Investors List as a Table/List */}
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto"></div>
                  <p className="mt-4 text-gray-600">Loading investors...</p>
                </div>
              ) : error ? (
                <div className="text-center py-12">
                  <div className="text-gray-400 text-6xl mb-4">⚠️</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Unable to load investors</h3>
                  <p className="text-gray-600 mb-4">{error}</p>
                  <button
                    onClick={fetchInvestors}
                    className="px-4 py-2 bg-yellow-500 text-gray-900 font-semibold rounded-lg hover:bg-yellow-600 transition-colors"
                  >
                    Try Again
                  </button>
                </div>
              ) : filteredInvestors.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-gray-400 text-6xl mb-4">👥</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No investors found</h3>
                  <p className="text-gray-600">Try adjusting your search or filters</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <div className="min-w-full divide-y divide-gray-200">
                    {/* Header Row */}
                    <div className="grid grid-cols-12 gap-2 py-2 px-2 bg-gray-50 font-semibold text-gray-700 text-sm">
                      {selectMode && <div className="col-span-1">Select</div>}
                      <div className={selectMode ? "col-span-2" : "col-span-2"}>Photo</div>
                      <div className="col-span-2">Name</div>
                      <div className="col-span-2">Stages</div>
                      <div className="col-span-2">Industries</div>
                      <div className="col-span-1">Type</div>
                      <div className="col-span-2">Background</div>
                      <div className="col-span-1">Status</div>
                    </div>
                    {/* Data Rows */}
                    {filteredInvestors.map((investor) => (
                      <div key={investor.id} className="grid grid-cols-12 gap-2 items-center py-3 px-2 border-b border-gray-100 hover:bg-yellow-50 transition">
                        {selectMode && (
                          <div className="col-span-1 flex items-center justify-center">
                            <input
                              type="checkbox"
                              checked={selectedInvestors.includes(investor.user_id)}
                              onChange={() => handleInvestorSelect(investor.user_id)}
                            />
                          </div>
                        )}
                        {/* Photo */}
                        <div className={selectMode ? "col-span-2" : "col-span-2" + " flex items-center justify-center"}>
                          {investor.profile_photo_filename ? (
                            <img
                              src={`${API_BASE_URL}/uploads/profile_photos/${investor.profile_photo_filename}`}
                              alt={investor.full_name}
                              className="w-12 h-12 rounded-full object-cover border border-gray-200"
                              onError={e => { e.currentTarget.onerror = null; e.currentTarget.src = '/default-profile.png'; }}
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-400">
                              <User className="w-6 h-6" />
                            </div>
                          )}
                        </div>
                        {/* Name */}
                        <div className="col-span-2 font-medium text-gray-900">{investor.full_name}</div>
                        {/* Stages */}
                        <div className="col-span-2 flex flex-wrap gap-1">
                          {(Array.isArray(investor.investment_stages) ? investor.investment_stages : []).map((stage, idx) => (
                            <span key={idx} className={`px-2 py-0.5 rounded-full text-xs font-semibold ${tagColors.stage}`}>{stage}</span>
                          ))}
                        </div>
                        {/* Industries */}
                        <div className="col-span-2 flex flex-wrap gap-1">
                          {(Array.isArray(investor.industry_focus) ? investor.industry_focus : []).map((industry, idx) => (
                            <span key={idx} className={`px-2 py-0.5 rounded-full text-xs font-semibold ${tagColors.industry}`}>{industry}</span>
                          ))}
                        </div>
                        {/* Type */}
                        <div className="col-span-1 flex flex-wrap gap-1">
                          {investor.investor_type && (
                            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${tagColors.type}`}>{investor.investor_type}</span>
                          )}
                        </div>
                        {/* Background */}
                        <div className="col-span-3">
                          <div className="flex flex-wrap gap-1">
                            {Array.isArray(investor.professional_background) && investor.professional_background.length > 0 ? (
                              investor.professional_background.slice(0, 3).map((bg, index) => (
                                <span key={index} className={`px-2 py-1 rounded-full text-xs font-medium ${tagColors.background}`}>
                                  {bg}
                                </span>
                              ))
                            ) : (
                              <span className="text-gray-400 text-xs">No background info</span>
                            )}
                          </div>
                        </div>
                        
                        {/* Interest Status */}
                        <div className="col-span-1">
                          {getInterestStatus(investor.user_id) && (
                            <div className="flex justify-center">
                              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                getInterestStatus(investor.user_id) === 'interested' 
                                  ? 'bg-green-100 text-green-800 border border-green-300' 
                                  : 'bg-red-100 text-red-800 border border-red-300'
                              }`}>
                                {getInterestStatus(investor.user_id) === 'interested' ? '✓ Interested' : '✗ Not Interested'}
                              </span>
                            </div>
                          )}
                          {hasApplicationToInvestor(investor.user_id) && !getInterestStatus(investor.user_id) && (
                            <div className="flex justify-center">
                              <span className="px-2 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800 border border-yellow-300">
                                📋 Applied
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  {selectMode && (
                    <div className="flex justify-end mt-4">
                      <div className="flex items-center gap-4">
                        <div className="text-sm text-gray-600">
                          {selectedInvestors.length} investor(s) selected
                        </div>
                        <button
                          onClick={handleSendPitchDeck}
                          disabled={selectedInvestors.length === 0 || sendingPitchDeck}
                          className="px-6 py-3 bg-yellow-500 text-gray-900 font-semibold rounded-lg hover:bg-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                          {sendingPitchDeck ? 'Sending...' : 'Send Pitch Deck'}
                        </button>
                      </div>
                    </div>
                  )}
                  
                  {/* Show interested investors */}
                  {!selectMode && (
                    <div className="mt-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Interested Investors</h3>
                      {interestStatuses.filter(status => status.status === 'interested').length === 0 ? (
                        <p className="text-gray-500 text-sm">No interested investors yet</p>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {interestStatuses
                            .filter(status => status.status === 'interested')
                            .map(status => {
                              const investor = investors.find(inv => inv.user_id === status.investor_id);
                              return (
                                <span key={status.id} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium border border-green-300">
                                  ✓ {investor?.full_name || status.investor_name || `Investor ${status.investor_id}`}
                                </span>
                              );
                            })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Pitch Deck Management Tab */}
          {activeTab === 'pitch-deck' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-gray-900">Pitch Deck Management</h2>
                <button
                  onClick={() => {/* TODO: Add pitch deck upload functionality */}}
                  className="flex items-center gap-2 px-4 py-2 bg-yellow-500 text-gray-900 font-semibold rounded-lg hover:bg-yellow-600 transition-colors"
                >
                  <FileText className="w-4 h-4" />
                  Update Pitch Deck
                </button>
              </div>
              
              <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-gray-900">Current Pitch Deck</h3>
                  <button
                    onClick={() => {/* TODO: View current pitch deck */}}
                    className="text-yellow-700 hover:text-yellow-900 font-medium underline text-sm"
                  >
                    View Current Version
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                    <FileText className="w-8 h-8 text-yellow-500" />
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900">Pitch Deck Status</div>
                      <div className="text-sm text-gray-600">
                        Current file: pitch_deck.pdf
                        <br />
                        Last updated: {new Date().toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  
                  <div className="border-t pt-4">
                    <h4 className="font-semibold text-gray-900 mb-3">Pitch Deck Actions</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <button
                        onClick={() => {/* TODO: Upload new pitch deck */}}
                        className="flex items-center gap-2 p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <FileText className="w-5 h-5 text-blue-500" />
                        Upload New Version
                      </button>
                      <button
                        onClick={() => {/* TODO: Send to all interested investors */}}
                        className="flex items-center gap-2 p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <Send className="w-5 h-5 text-green-500" />
                        Send to All Interested
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Application Logs Tab */}
          {activeTab === 'logs' && (
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Sent Pitch Decks</h2>
              
              {/* Interested Investors Section */}
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Interested Investors</h3>
                {interestStatuses.filter(status => status.status === 'interested').length === 0 ? (
                  <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <div className="text-gray-400 text-4xl mb-2">🎯</div>
                    <p className="text-gray-600">No interested investors yet</p>
                    <p className="text-gray-500 text-sm mt-1">Send pitch decks to investors to get their interest</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {interestStatuses
                      .filter(status => status.status === 'interested')
                      .map(status => {
                        const investor = investors.find(inv => inv.user_id === status.investor_id);
                        return (
                          <div key={status.id} className="bg-green-50 border border-green-200 rounded-lg p-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                <span className="text-green-600 font-bold">✓</span>
                              </div>
                              <div>
                                <h4 className="font-semibold text-gray-900">{investor?.full_name || status.investor_name || `Investor ${status.investor_id}`}</h4>
                                <p className="text-sm text-gray-600">{investor?.firm_name || 'Independent Investor'}</p>
                                <p className="text-xs text-green-600 font-medium">Interested</p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                )}
              </div>
              
              <h3 className="text-xl font-semibold text-gray-900 mb-4">All Sent Pitch Decks</h3>
              
              {loadingLogs ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto"></div>
                  <p className="mt-4 text-gray-600">Loading sent pitch decks...</p>
                </div>
              ) : errorLogs ? (
                <div className="text-center py-12">
                  <div className="text-gray-400 text-6xl mb-4">⚠️</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Unable to load sent pitch decks</h3>
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
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No pitch decks sent yet</h3>
                  <p className="text-gray-600">Use the "Common Pitch Deck" feature to send your pitch deck to investors</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {logs.map((log) => (
                    <div key={log.id} className="bg-white rounded-lg shadow-md border border-gray-200 p-6 flex flex-col md:flex-row md:items-center md:justify-between">
                      <div>
                        <div className="font-semibold text-gray-900 mb-1">{log.investor_name}</div>
                        <div className="text-gray-600 text-sm mb-2">Sent: {log.sent_at ? new Date(log.sent_at).toLocaleString() : new Date(log.created_at).toLocaleString()}</div>
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

          {/* Pitch Deck Management Tab */}
          {activeTab === 'pitch-deck' && (
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Pitch Deck Management</h2>
              
              <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
                {/* Current Pitch Deck Section */}
                <div className="mb-8">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Current Pitch Deck</h3>
                  
                  {currentPitchDeck ? (
                    <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-6 border border-yellow-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center space-x-3 mb-2">
                            <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                              <span className="text-yellow-600 font-bold">📄</span>
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-900">{currentPitchDeck.filename}</h4>
                              <p className="text-sm text-gray-600">Current pitch deck</p>
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={async () => {
                            try {
                              const userId = getUserId();
                              const response = await fetch(`${API_BASE_URL}/startup-profile/download-pitch-deck/${userId}`, {
                                headers: getAuthHeaders(),
                              });
                              
                              if (response.ok) {
                                const blob = await response.blob();
                                const url = window.URL.createObjectURL(blob);
                                setPitchDeckUrl(url);
                                setPitchDeckFileName(currentPitchDeck?.filename || 'pitch_deck.pdf');
                                setShowPitchDeckModal(true);
                              } else {
                                alert('Failed to view current pitch deck');
                              }
                            } catch (error) {
                              console.error('View error:', error);
                              alert(`Failed to view pitch deck: ${error instanceof Error ? error.message : 'Unknown error'}`);
                            }
                          }}
                          className="px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-xl font-medium hover:from-yellow-600 hover:to-orange-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                        >
                          View Current Version
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 text-center">
                      <div className="text-gray-400 text-4xl mb-2">📄</div>
                      <p className="text-gray-600 mb-2">No pitch deck uploaded yet</p>
                      <p className="text-gray-500 text-sm">Upload your pitch deck to start sending it to investors</p>
                    </div>
                  )}
                </div>

                {/* Update Pitch Deck Section */}
                <div className="mb-8">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Update Pitch Deck</h3>
                  
                  <div className="bg-white border-2 border-dashed border-gray-300 rounded-xl p-6 hover:border-yellow-400 transition-colors">
                    <div className="text-center">
                      <div className="text-gray-400 text-4xl mb-4">📤</div>
                      <p className="text-gray-600 mb-4">Upload a new version of your pitch deck</p>
                      
                      <input
                        type="file"
                        accept=".pdf,.ppt,.pptx"
                        onChange={handleFileChange}
                        className="hidden"
                        id="pitch-deck-upload"
                      />
                      <label
                        htmlFor="pitch-deck-upload"
                        className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-xl font-medium hover:from-yellow-600 hover:to-orange-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 cursor-pointer"
                      >
                        Choose New File
                      </label>
                      
                      {newPitchDeckFile && (
                        <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-green-800 font-medium">Selected: {newPitchDeckFile.name}</p>
                              <p className="text-green-600 text-sm">{(newPitchDeckFile.size / 1024 / 1024).toFixed(2)} MB</p>
                            </div>
                            <button
                              onClick={handlePitchDeckUpdate}
                              disabled={updatingPitchDeck}
                              className="px-4 py-2 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {updatingPitchDeck ? (
                                <div className="flex items-center">
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                  Updating...
                                </div>
                              ) : (
                                'Update Pitch Deck'
                              )}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Send to All Interested Investors */}
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Send to All Interested Investors</h3>
                  
                  {interestStatuses.filter(status => status.status === 'interested').length === 0 ? (
                    <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 text-center">
                      <div className="text-gray-400 text-4xl mb-2">🎯</div>
                      <p className="text-gray-600 mb-2">No interested investors yet</p>
                      <p className="text-gray-500 text-sm">Send pitch decks to investors to get their interest</p>
                    </div>
                  ) : (
                    <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 border border-green-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2">Send Updated Pitch Deck</h4>
                          <p className="text-gray-600 text-sm">
                            Send your current pitch deck to {interestStatuses.filter(status => status.status === 'interested').length} interested investors
                          </p>
                        </div>
                        <button
                          onClick={handleSendPitchDeck}
                          disabled={sendingPitchDeck || !currentPitchDeck}
                          className="px-6 py-3 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-xl font-medium hover:from-green-600 hover:to-blue-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {sendingPitchDeck ? (
                            <div className="flex items-center">
                              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                              Sending...
                            </div>
                          ) : (
                            'Send to All Interested'
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Application Modal */}
      {selectedInvestor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Send Application</h3>
              <button
                onClick={() => setSelectedInvestor(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">
                Sending application to <span className="font-semibold">{selectedInvestor.full_name}</span>
              </p>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Message
              </label>
              <textarea
                value={applicationMessage}
                onChange={(e) => setApplicationMessage(e.target.value)}
                placeholder="Introduce your startup and why you'd like to connect..."
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 resize-none"
                rows={4}
              />
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => setSelectedInvestor(null)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => sendApplication(selectedInvestor.user_id)}
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

export default StartupDashboard; 