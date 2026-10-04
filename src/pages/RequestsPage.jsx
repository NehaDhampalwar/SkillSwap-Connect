import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Inbox, Send, ArrowRightLeft } from 'lucide-react';
import SwapRequestCard from '../components/cards/SwapRequestCard';
import ScheduleSessionModal from '../components/modals/ScheduleSessionModal';
import EmptyState from '../components/EmptyState';
import { api } from '../services/api';

export default function RequestsPage({ onNavigateToSessions, onNavigateToExplore }) {
  const { currentUser, addToast } = useApp();

  const [activeTab, setActiveTab] = useState('incoming'); // 'incoming' or 'outgoing'
  const [swaps, setSwaps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');

  // Schedule modal state
  const [selectedSwapForSchedule, setSelectedSwapForSchedule] = useState(null);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);

  const fetchSwaps = async () => {
    if (!currentUser) return;
    try {
      setLoading(true);
      const data = await api.getSwaps(currentUser.id);
      setSwaps(data);
    } catch (err) {
      console.error(err);
      addToast('error', 'Failed to load requests', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSwaps();
  }, [currentUser]);

  const handleAccept = async (swapId) => {
    try {
      await api.updateSwapStatus(swapId, 'accepted');
      addToast('success', 'Swap Accepted', 'You can now schedule a session with your partner.');
      fetchSwaps();
    } catch (err) {
      addToast('error', 'Error', err.message);
    }
  };

  const handleReject = async (swapId) => {
    try {
      await api.updateSwapStatus(swapId, 'rejected');
      addToast('info', 'Request Declined', 'The proposal has been rejected.');
      fetchSwaps();
    } catch (err) {
      addToast('error', 'Error', err.message);
    }
  };

  const handleOpenSchedule = (swap) => {
    setSelectedSwapForSchedule(swap);
    setIsScheduleModalOpen(true);
  };

  const incomingSwaps = swaps.filter(s => s.receiverId === currentUser?.id);
  const outgoingSwaps = swaps.filter(s => s.senderId === currentUser?.id);

  const currentList = activeTab === 'incoming' ? incomingSwaps : outgoingSwaps;

  const filteredList = currentList.filter(s => {
    if (statusFilter === 'all') return true;
    return s.status === statusFilter;
  });

  const pendingIncomingCount = incomingSwaps.filter(s => s.status === 'pending').length;

  return (
    <div className="container" style={{ padding: '2rem 1.25rem 4rem' }}>
      {/* Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: '700', color: '#1E293B', marginBottom: '0.35rem' }}>
          Swap Requests
        </h1>
        <p style={{ color: '#64748B', fontSize: '0.95rem' }}>
          Review incoming skill trade proposals from classmates and track your sent requests.
        </p>
      </div>

      {/* Tabs & Status Filters */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid var(--border)',
        marginBottom: '1.5rem',
        flexWrap: 'wrap',
        gap: '0.75rem'
      }}>
        {/* Tab buttons */}
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={() => setActiveTab('incoming')}
            style={{
              padding: '0.6rem 1rem',
              backgroundColor: 'transparent',
              border: 'none',
              borderBottom: activeTab === 'incoming' ? '2px solid var(--primary)' : '2px solid transparent',
              color: activeTab === 'incoming' ? '#2563EB' : '#64748B',
              fontWeight: activeTab === 'incoming' ? '600' : '500',
              fontSize: '0.9rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem'
            }}
          >
            <Inbox size={15} />
            <span>Incoming Requests</span>
            {pendingIncomingCount > 0 && (
              <span style={{
                backgroundColor: '#EF4444',
                color: '#FFFFFF',
                fontSize: '0.6875rem',
                fontWeight: '700',
                padding: '1px 6px',
                borderRadius: '9999px',
                marginLeft: '4px'
              }}>
                {pendingIncomingCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('outgoing')}
            style={{
              padding: '0.6rem 1rem',
              backgroundColor: 'transparent',
              border: 'none',
              borderBottom: activeTab === 'outgoing' ? '2px solid var(--primary)' : '2px solid transparent',
              color: activeTab === 'outgoing' ? '#2563EB' : '#64748B',
              fontWeight: activeTab === 'outgoing' ? '600' : '500',
              fontSize: '0.9rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem'
            }}
          >
            <Send size={15} />
            <span>Sent Requests ({outgoingSwaps.length})</span>
          </button>
        </div>

        {/* Status filter buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', paddingBottom: '0.35rem' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Status:</span>
          {['all', 'pending', 'accepted', 'completed'].map(st => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              style={{
                backgroundColor: statusFilter === st ? '#EFF6FF' : '#F1F5F9',
                color: statusFilter === st ? '#2563EB' : '#475569',
                border: '1px solid',
                borderColor: statusFilter === st ? '#BFDBFE' : 'var(--border)',
                borderRadius: '4px',
                padding: '2px 8px',
                fontSize: '0.75rem',
                cursor: 'pointer',
                textTransform: 'capitalize'
              }}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Requests List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-muted)' }}>
          Loading requests...
        </div>
      ) : filteredList.length === 0 ? (
        <EmptyState
          icon={ArrowRightLeft}
          title={activeTab === 'incoming' ? 'No Incoming Requests' : 'No Sent Proposals'}
          description={
            activeTab === 'incoming'
              ? 'When other students want to exchange skills with you, their requests will appear here.'
              : 'You have not sent any swap proposals yet. Explore peers and request a swap!'
          }
          actionLabel="Explore Campus Peers"
          onAction={onNavigateToExplore}
        />
      ) : (
        <div className="grid-2">
          {filteredList.map((swap) => (
            <SwapRequestCard
              key={swap.id}
              swap={swap}
              isIncoming={activeTab === 'incoming'}
              onAccept={handleAccept}
              onReject={handleReject}
              onSchedule={handleOpenSchedule}
            />
          ))}
        </div>
      )}

      {/* Schedule Session Modal */}
      <ScheduleSessionModal
        isOpen={isScheduleModalOpen}
        swap={selectedSwapForSchedule}
        onClose={() => setIsScheduleModalOpen(false)}
        onSuccess={() => {
          fetchSwaps();
          if (onNavigateToSessions) onNavigateToSessions();
        }}
      />
    </div>
  );
}
