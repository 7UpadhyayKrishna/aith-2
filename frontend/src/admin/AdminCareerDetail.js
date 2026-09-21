import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useOutletContext, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import {
    addCareerNote,
    assignCareer,
    getCareer,
    listAssignees,
    patchCareer,
    replyCareer,
} from '@/services/adminApi';
import { CAREER_APP_STATUSES } from '@/data/blogCategories';
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

export default function AdminCareerDetail() {
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
        setPageTitle('Application');
        setHeaderActions(null);
    }, [setPageTitle, setHeaderActions]);

    const load = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const [d, a] = await Promise.all([getCareer(id), listAssignees().catch(() => ({ items: [] }))]);
            setDetail(d);
            setAssignees(a.items || []);
            setStatus(d.internalStatus || 'new');
            setPageTitle(d.name || 'Application');
        } catch (err) {
            setError(err.message || 'Failed to load application');
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
            await patchCareer(id, { internalStatus: status });
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
            await assignCareer(id, { assignedTo });
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
            await addCareerNote(id, { body });
            await load();
            toast.success('Note added');
        } catch (err) {
            toast.error(err.message || 'Failed to add note');
            throw err;
        } finally {
            setBusy(false);
        }
    }

    if (loading) return <LoadingBlock label="Loading application…" />;
    if (error && !detail) {
        return (
            <div className="space-y-3">
                <ErrorBanner>{error}</ErrorBanner>
                <button
                    type="button"
                    className="font-mono text-[10px] uppercase tracking-widest"
                    onClick={() => navigate('/admin/careers')}
                >
                    ← Back to applications
                </button>
            </div>
        );
    }

    return (
        <>
            <AdminRecordPage
                backTo="/admin/careers"
                backLabel="All applications"
                header={
                    <RecordHeader
                        eyebrow="Career application"
                        title={detail.name || 'Applicant'}
                        subtitle={detail.jobTitle || detail.roleInterest || detail.subject || undefined}
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
                            statusId="c-status"
                            status={status}
                            statuses={CAREER_APP_STATUSES}
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
                <RecordSection title="Applicant">
                    <RecordGrid>
                        <RecordField label="Name" value={detail.name} />
                        <RecordField label="Email" value={detail.email} />
                        <RecordField label="Phone" value={detail.phone} />
                        <RecordField label="Role interest" value={detail.roleInterest} />
                        <RecordField label="Job" value={detail.jobTitle || detail.jobSlug} />
                        <RecordField label="Location preference" value={detail.locationPreference} />
                        <RecordField label="LinkedIn / CV" value={detail.linkedinOrCv} />
                    </RecordGrid>
                </RecordSection>
                <RecordSection title="Message">
                    <p className="text-sm whitespace-pre-wrap leading-relaxed">{detail.message || '-'}</p>
                </RecordSection>
                <NotesPanel
                    notes={Array.isArray(detail.notes) ? detail.notes : []}
                    onAdd={handleAddNote}
                    busy={busy}
                />
                <ActivityTimeline events={detail.activity || []} />
                <MessagesPanel messages={detail.messages || []} />
                <RecordSection title="Metadata">
                    <RecordGrid>
                        <RecordField label="ID" value={detail.id} mono />
                        <RecordField label="Job ID" value={detail.jobId} mono />
                        <RecordField label="Created" value={fmtDateTime(detail.createdAt)} />
                        <RecordField label="Subject" value={detail.subject} />
                        <RecordField label="Notification" value={detail.notificationStatus} />
                    </RecordGrid>
                </RecordSection>
            </AdminRecordPage>
            <ReplyModal
                open={replyOpen}
                onClose={() => setReplyOpen(false)}
                defaultTo={detail.email}
                defaultSubject={`Re: ${detail.jobTitle || detail.roleInterest || 'Your application'}`}
                onSend={(payload) => replyCareer(id, payload)}
            />
        </>
    );
}
