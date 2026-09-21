import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useOutletContext, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import {
    addQuoteNote,
    assignQuote,
    getQuote,
    listAssignees,
    patchQuote,
    replyQuote,
} from '@/services/adminApi';
import { QUOTE_STATUSES } from '@/data/blogCategories';
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

export default function AdminQuoteDetail() {
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
        setPageTitle('Quote request');
        setHeaderActions(null);
    }, [setPageTitle, setHeaderActions]);

    const load = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const [d, a] = await Promise.all([getQuote(id), listAssignees().catch(() => ({ items: [] }))]);
            setDetail(d);
            setAssignees(a.items || []);
            setStatus(d.internalStatus || 'new');
            setPageTitle(d.reference || d.product || 'Quote request');
        } catch (err) {
            setError(err.message || 'Failed to load quote');
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
            await patchQuote(id, { internalStatus: status });
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
            await assignQuote(id, { assignedTo });
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
            await addQuoteNote(id, { body });
            await load();
            toast.success('Note added');
        } catch (err) {
            toast.error(err.message || 'Failed to add note');
            throw err;
        } finally {
            setBusy(false);
        }
    }

    if (loading) return <LoadingBlock label="Loading quote request…" />;
    if (error && !detail) {
        return (
            <div className="space-y-3">
                <ErrorBanner>{error}</ErrorBanner>
                <button type="button" className="font-mono text-[10px] uppercase tracking-widest" onClick={() => navigate('/admin/quotes')}>
                    ← Back to quotes
                </button>
            </div>
        );
    }

    return (
        <>
            <AdminRecordPage
                backTo="/admin/quotes"
                backLabel="All quote requests"
                header={
                    <RecordHeader
                        eyebrow="Quote request"
                        title={detail.reference || 'Quote'}
                        subtitle={detail.product || undefined}
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
                            statusId="q-status"
                            status={status}
                            statuses={QUOTE_STATUSES}
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
                        <RecordField label="Country" value={detail.country} />
                        <RecordField label="Role" value={detail.role} />
                    </RecordGrid>
                </RecordSection>
                <RecordSection title="Requirement">
                    <RecordGrid>
                        <RecordField label="Type" value={detail.requirementType} />
                        <RecordField label="Timeline" value={detail.timeline} />
                        <RecordField
                            label="Quantity"
                            value={[detail.quantity, detail.unit].filter(Boolean).join(' ')}
                        />
                    </RecordGrid>
                </RecordSection>
                <RecordSection title="Product">
                    <RecordGrid>
                        <RecordField label="Product" value={detail.product} />
                        <RecordField label="Category" value={detail.category} />
                        <RecordField label="Specification" value={detail.specification} />
                        <RecordField label="Quality" value={detail.qualityRequirements} />
                        <RecordField label="Certifications" value={detail.certifications} />
                    </RecordGrid>
                </RecordSection>
                <RecordSection title="Shipment">
                    <RecordGrid>
                        <RecordField label="Origin" value={detail.origin} />
                        <RecordField label="Destination" value={detail.destination} />
                        <RecordField label="Mode" value={detail.mode} />
                        <RecordField label="Incoterm" value={detail.incoterm} />
                        <RecordField label="Packaging" value={detail.packaging} />
                    </RecordGrid>
                </RecordSection>
                <RecordSection title="Commercial">
                    <RecordGrid>
                        <RecordField label="Budget" value={detail.budget} />
                        <RecordField label="OEM / private label" value={detail.oem} />
                        <RecordField label="Supplier known" value={detail.supplierKnown} />
                        <RecordField label="Inspection" value={detail.inspection} />
                        <RecordField label="Documentation" value={detail.documentation} />
                    </RecordGrid>
                </RecordSection>
                {typeof detail.notes === 'string' && detail.notes ? (
                    <RecordSection title="Submission notes">
                        <p className="text-sm whitespace-pre-wrap leading-relaxed">{detail.notes}</p>
                    </RecordSection>
                ) : null}
                <NotesPanel
                    notes={Array.isArray(detail.notes) ? detail.notes : detail.opsNotes || []}
                    onAdd={handleAddNote}
                    busy={busy}
                />
                <ActivityTimeline events={detail.activity || []} />
                <MessagesPanel messages={detail.messages || []} />
                <RecordSection title="Metadata">
                    <RecordGrid>
                        <RecordField label="ID" value={detail.id} mono />
                        <RecordField label="Created" value={fmtDateTime(detail.createdAt)} />
                        <RecordField label="Notification" value={detail.notificationStatus} />
                        <RecordField label="Reference" value={detail.reference || detail.refCode} mono />
                    </RecordGrid>
                </RecordSection>
            </AdminRecordPage>
            <ReplyModal
                open={replyOpen}
                onClose={() => setReplyOpen(false)}
                defaultTo={detail.email}
                defaultSubject={`Re: Quote ${detail.reference || detail.product || ''}`.trim()}
                onSend={(payload) => replyQuote(id, payload)}
            />
        </>
    );
}
