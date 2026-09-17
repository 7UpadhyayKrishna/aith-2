import { useEffect, useState } from 'react';
import { Link, useOutletContext, useParams } from 'react-router-dom';
import Seo from '@/components/Seo';
import BlogArticleView from '@/components/blog/BlogArticleView';
import { previewBlog } from '@/services/adminApi';

export default function AdminBlogPreview() {
    const { id } = useParams();
    const { setPageTitle, setHeaderActions } = useOutletContext();
    const [blog, setBlog] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setPageTitle('Preview');
        setHeaderActions(
            <Link
                to={`/admin/blogs/${id}`}
                className="px-2.5 py-1.5 font-mono text-[9px] tracking-[0.14em] uppercase border border-graphite/25 hover:border-copper"
            >
                Edit
            </Link>
        );
        return () => setHeaderActions(null);
    }, [setPageTitle, setHeaderActions, id]);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const res = await previewBlog(id);
                if (!cancelled) setBlog(res.blog);
            } catch (err) {
                if (!cancelled) setError(err.message || 'Preview failed');
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [id]);

    return (
        <div data-testid="admin-blog-preview">
            <Seo title="Blog Preview — Admin" path={`/admin/blogs/${id}/preview`} noIndex />
            <p className="mb-6 font-mono text-[10px] tracking-[0.2em] uppercase text-copper">
                Admin preview · not public
            </p>
            {loading && <p className="font-mono text-[11px] uppercase tracking-widest text-mute">Loading…</p>}
            {error && <p className="text-copper text-sm">{error}</p>}
            {blog && (
                <div className="bg-ivory border border-graphite/10 px-5 py-10 lg:px-12">
                    <BlogArticleView blog={blog} />
                </div>
            )}
        </div>
    );
}
