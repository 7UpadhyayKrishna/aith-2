import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useOutletContext, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import {
    addEnquiryNote,
    assignEnquiry,
    getEnquiry,
    listAssignees,
    patchEnquiry,
    replyEnquiry,
} from '@/services/adminApi';
import { ENQUIRY_STATUSES } from '@/data/blogCategories';
import { useAdminAuth } from './AdminAuthContext';
import { ErrorBanner, LoadingBlock, btn, fmtDateTime } from './adminUi';
import {
    ActivityTimeline,
    AdminRecordPage,
    AssignmentPanel,
    AttentionBadges,
    CopyMailtoActions,
    MessagesPanel,
    NotesPanel,
    RecordField,
    RecordGrid,
    RecordHeader,
    RecordSection,
    ReplyModal,
    StatusWorkflow,
} from './AdminRecordPage';

export default function AdminEnquiryDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAdminAuth();
    const { setPageTitle, setHeaderActions } = useOutletContext();
    const [detail, setDetail] = useState(null);
    const [assignees, setAssignees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [status, setStatus] = useState('new');
    const [saving, setSaving] = useState(false);
    const [busy, setBusy] = useState(false);
    const [replyOpen, setReplyOpen] = useState(false);

    useEffect(() => {
        setPageTitle('Enquiry');
        setHeaderActions(null);
    }, [setPageTitle, setHeaderActions]);

    const load = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const [d, a] = await Promise.all([getEnquiry(id), listAssignees().catch(() => ({ items: [] }))]);
            setDetail(d);
            setAssignees(a.items || []);
            setStatus(d.internalStatus || 'new');
            setPageTitle(d.name || 'Enquiry');
        } catch (err) {
            setError(err.message || 'Failed to load enquiry');
        } finally {
            setLoading(false);
        }
    }, [id, setPageTitle]);

    useEffect(() => {
        load();
    }, [load]);

    async function saveStatus() {
        setSaving(true);
        setError('');
        try {
            await patchEnquiry(id, { internalStatus: status });
            await load();
            toast.success('Saved');
        } catch (err) {
            setError(err.message || 'Save failed');
            toast.error(err.message || 'Save failed');
        } finally {
            setSaving(false);
        }
    }

    async function handleAssign(assignedTo) {
        setBusy(true);
        try {
            await assignEnquiry(id, { assignedTo });
            await load();
            toast.success(assignedTo ? 'Assigned' : 'Unassigned');
        } catch (err) {
            toast.error(err.message || 'Assign failed');
        } finally {
            setBusy(false);
        }
    }

    async function handleAddNote(body) {
        setBusy(true);
        try {
            await addEnquiryNote(id, { body });
            await load();
            toast.success('Note added');
        } catch (err) {
            toast.error(err.message || 'Failed to add note');
            throw err;
        } finally {
            setBusy(false);
        }
    }

    if (loading) return <LoadingBlock label="Loading enquiry…" />;
    if (error && !detail) {
        return (
            <div className="space-y-3">
                <ErrorBanner>{error}</ErrorBanner>
                <button type="button" className="font-mono text-[10px] uppercase tracking-widest" onClick={() => navigate('/admin/enquiries')}>
                    ← Back to enquiries
                </button>
            </div>
        );
    }

    return (
        <>
            <AdminRecordPage
                backTo="/admin/enquiries"
                backLabel="All enquiries"
                header={
                    <RecordHeader
                        eyebrow="Enquiry"
                        title={detail.name || 'Enquiry'}
                        subtitle={detail.subject || detail.company || undefined}
                        actions={
                            <div className="flex flex-wrap gap-2 items-center">
                                <AttentionBadges attention={detail.attention} />
                                <button type="button" className={btn} onClick={() => setReplyOpen(true)}>
                                    Reply
                                </button>
                            </div>
                        }
                    />
                }
                sidebar={
                    <>
                        <StatusWorkflow
                            statusId="enq-status"
                            status={status}
                            statuses={ENQUIRY_STATUSES}
                            onStatusChange={setStatus}
                            onSave={saveStatus}
                            saving={saving}
                            extra={
                                <>
                                    {error ? <ErrorBanner>{error}</ErrorBanner> : null}
                                    <CopyMailtoActions email={detail.email} />
                                </>
                            }
                        />
                        <AssignmentPanel
                            assignedTo={detail.assignedTo}
                            assignedToName={detail.assignedToName}
                            assignees={assignees}
                            currentUserId={user?.id}
                            onAssign={handleAssign}
                            busy={busy}
                        />
                    </>
                }
            >
                <RecordSection title="Contact">
                    <RecordGrid>
                        <RecordField label="Name" value={detail.name} />
                        <RecordField label="Email" value={detail.email} />
                        <RecordField label="Phone" value={detail.phone} />
                        <RecordField label="Company" value={detail.company} />
                    </RecordGrid>
                </RecordSection>
                <RecordSection title="Request">
                    <RecordGrid>
                        <RecordField label="Subject" value={detail.subject} />
                        <RecordField label="Type" value={detail.kind || detail.intent} />
                        <RecordField label="Created" value={fmtDateTime(detail.createdAt)} />
                        <RecordField label="Notification" value={detail.notificationStatus} />
                    </RecordGrid>
                    {detail.message ? (
                        <div className="mt-5">
                            <p className="font-mono text-[9px] tracking-widest uppercase text-mute mb-2">Message</p>
                            <p className="text-sm whitespace-pre-wrap leading-relaxed border border-graphite/10 bg-bone/40 p-4">
                                {detail.message}
                            </p>
                        </div>
                    ) : null}
                </RecordSection>
                <NotesPanel notes={detail.notes || []} onAdd={handleAddNote} busy={busy} />
                <ActivityTimeline events={detail.activity || []} />
                <MessagesPanel messages={detail.messages || []} />
                <RecordSection title="Record">
                    <RecordGrid>
                        <RecordField label="ID" value={detail.id} mono />
                    </RecordGrid>
                </RecordSection>
            </AdminRecordPage>
            <ReplyModal
                open={replyOpen}
                onClose={() => setReplyOpen(false)}
                defaultTo={detail.email}
                defaultSubject={`Re: ${detail.subject || 'Your enquiry'}`}
                onSend={(payload) => replyEnquiry(id, payload)}
            />
        </>
    );
}
