import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const InvestorBrowseAndSend: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [investors, setInvestors] = useState<any[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchInvestors = async () => {
      if (!id) return;
      setLoading(true);
      try {
        // Get available investor user_ids
        const availRes = await fetch(`${API_BASE_URL}/applications/available-investors/${id}`);
        const availableIds: number[] = availRes.ok ? await availRes.json() : [];
        // Get investor profiles
        const profRes = await fetch(`${API_BASE_URL}/investor-profile/user/0`); // 0 returns all
        const allProfiles = profRes.ok ? await profRes.json() : [];
        // Filter to only available
        setInvestors(allProfiles.filter((inv: any) => availableIds.includes(inv.user_id)));
      } catch (err) {
        setError('Failed to load investors');
      } finally {
        setLoading(false);
      }
    };
    fetchInvestors();
  }, [id]);

  const handleSelect = (userId: number, checked: boolean) => {
    setSelected(prev => checked ? [...prev, userId] : prev.filter(id => id !== userId));
  };

  const handleSend = async () => {
    if (!id) return;
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      // Get startup's pitch deck info (assume only one profile for now)
      const profRes = await fetch(`${API_BASE_URL}/startup-profile/${id}`);
      const profile = profRes.ok ? await profRes.json() : null;
      if (!profile) {
        setError('No startup profile found');
        setLoading(false);
        return;
      }
      // Send application to each selected investor
      for (const investorId of selected) {
        await fetch(`${API_BASE_URL}/applications/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            startup_id: Number(id),
            investor_id: investorId,
            pitch_deck_filename: profile.pitch_deck_filename,
            pitch_deck_file_path: profile.pitch_deck_file_path,
            status: 'sent',
            log: ''
          })
        });
      }
      setSuccess('Pitch deck sent to selected investors!');
      setSelected([]);
      // Refresh list
      window.location.reload();
    } catch (err) {
      setError('Failed to send pitch deck');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f7f7f7', padding: 24 }}>
      <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 1px 4px #eee', padding: 32, width: '100%', maxWidth: 700, color: '#222' }}>
        <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 24 }}>Browse Investors</h2>
        {loading && <div>Loading...</div>}
        {error && <div style={{ background: '#fff3cd', color: '#856404', borderRadius: 8, padding: 12, marginBottom: 16 }}>{error}</div>}
        {success && <div style={{ background: '#d4edda', color: '#155724', borderRadius: 8, padding: 12, marginBottom: 16 }}>{success}</div>}
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {investors.map(inv => (
            <li key={inv.id} style={{ background: '#f7f7f7', borderRadius: 8, marginBottom: 12, padding: 16, display: 'flex', alignItems: 'center', gap: 16 }}>
              <input
                type="checkbox"
                checked={selected.includes(inv.user_id)}
                onChange={e => handleSelect(inv.user_id, e.target.checked)}
                style={{ width: 20, height: 20 }}
              />
              <img src={`/${inv.profile_photo_file_path}`} alt="Profile" style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover' }} />
              <div>
                <div style={{ fontWeight: 600 }}>{inv.full_name} <span style={{ color: '#FFD600' }}>({inv.investor_type})</span></div>
                <div style={{ fontSize: 14, color: '#888' }}>{inv.district}, {inv.state}, {inv.country}</div>
              </div>
            </li>
          ))}
        </ul>
        {selected.length > 0 && (
          <button
            onClick={handleSend}
            disabled={loading}
            style={{
              background: '#FFD600',
              color: '#222',
              border: 'none',
              borderRadius: 8,
              padding: '12px 24px',
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1,
              marginTop: 16
            }}
          >
            {loading ? 'Sending...' : `Send Pitch Deck to ${selected.length} Investor${selected.length > 1 ? 's' : ''}`}
          </button>
        )}
      </div>
    </div>
  );
};

export default InvestorBrowseAndSend; 