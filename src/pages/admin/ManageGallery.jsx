import { useEffect, useRef, useState } from 'react';
import api from '../../api/axios';
import { Card, PageHeader, Button, Input, Textarea, Label, Alert, Badge } from '../../components/ui';
import { FiEye, FiEyeOff, FiImage } from 'react-icons/fi';

const emptyForm = { heading: '', description: '' };

export default function ManageGallery() {
  const [catalogs, setCatalogs] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [files, setFiles] = useState([]);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  // admin sees hidden catalogs too
  const load = () => api.get('/gallery?all=true').then((res) => setCatalogs(res.data.catalogs));
  useEffect(() => { load(); }, []);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setMsg(''); setError('');
    if (files.length === 0) {
      setError('Select at least one image');
      return;
    }
    try {
      const fd = new FormData();
      fd.append('heading', form.heading);
      if (form.description) fd.append('description', form.description);
      files.forEach((f) => fd.append('images', f));

      await api.post('/gallery', fd);
      setMsg('Gallery catalog created');
      setForm(emptyForm);
      setFiles([]);
      if (fileInputRef.current) fileInputRef.current.value = '';
      load();
    } catch (err) {
      setError(err.response?.data?.error || 'Create failed');
    }
  };

  const remove = async (id) => {
    if (!confirm('Delete this gallery catalog?')) return;
    try {
      await api.delete(`/gallery/${id}`);
      load();
    } catch (err) {
      setError(err.response?.data?.error || 'Delete failed');
    }
  };

  const toggleActive = async (id) => {
    setError('');
    try {
      await api.patch(`/gallery/${id}/toggle`);
      load();
    } catch (err) {
      setError(err.response?.data?.error || 'Could not update visibility');
    }
  };

  return (
    <div>
      <PageHeader title="Manage Gallery" subtitle="Create and remove photo catalogs shown in the public gallery." />

      <Card className="mb-8 p-5 sm:p-6">
        <form onSubmit={submit} className="space-y-4">
          <h2 className="font-semibold text-slate-900">Create catalog</h2>

          <div className="space-y-1">
            <Label>Heading</Label>
            <Input name="heading" value={form.heading} onChange={onChange} placeholder="e.g. Nainital Lake Views" required />
          </div>

          <div className="space-y-1">
            <Label>Description</Label>
            <Textarea name="description" value={form.description} onChange={onChange} placeholder="Optional" rows={2} />
          </div>

          <div className="space-y-1">
            <Label>Images</Label>
            <input
              ref={fileInputRef}
              type="file" multiple accept="image/*" onChange={(e) => setFiles([...e.target.files])}
              className="block w-full text-sm text-slate-500 file:mr-3 file:rounded-lg file:border-0 file:bg-brand-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-brand-700 hover:file:bg-brand-100"
            />
            {files.length > 0 && (
              <p className="text-xs text-slate-500">{files.length} image{files.length > 1 ? 's' : ''} selected</p>
            )}
          </div>

          {msg && <Alert type="success">{msg}</Alert>}
          {error && <Alert type="error">{error}</Alert>}
          <Button type="submit">Create catalog</Button>
        </form>
      </Card>

      <h2 className="mb-3 font-semibold text-slate-900">Existing catalogs</h2>
      <div className="space-y-2">
        {catalogs.map((c) => (
          <Card key={c.id} className={`flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between ${c.isActive ? '' : 'opacity-60'}`}>
            <div className="flex items-center gap-3">
              <img src={c.images?.[0]} alt="" className="h-11 w-11 rounded-lg object-cover" />
              <div>
                <p className="flex flex-wrap items-center gap-2 font-medium text-slate-900">
                  {c.heading}
                  <Badge className="bg-slate-100 text-slate-500"><FiImage /> {c.images?.length || 0}</Badge>
                  {!c.isActive && <Badge className="bg-slate-200 text-slate-600"><FiEyeOff /> Hidden</Badge>}
                </p>
                {c.description && <p className="text-sm text-slate-500 line-clamp-1">{c.description}</p>}
              </div>
            </div>
            <div className="flex items-center gap-2 self-end sm:self-auto">
              <Button
                variant="secondary"
                onClick={() => toggleActive(c.id)}
                title={c.isActive ? 'Hide from the public gallery' : 'Show in the public gallery'}
              >
                {c.isActive ? <><FiEyeOff /> Hide</> : <><FiEye /> Show</>}
              </Button>
              <Button variant="ghost" className="text-rose-600 hover:bg-rose-50" onClick={() => remove(c.id)}>
                Delete
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
