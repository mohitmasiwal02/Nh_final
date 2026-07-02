import { useEffect, useRef, useState } from 'react';
import api from '../../api/axios';
import { Card, PageHeader, Button, Input, Textarea, Label, Alert, Badge, inr, MOUNTAIN_IMG } from '../../components/ui';
import { FiEye, FiEyeOff, FiEdit2, FiX, FiStar } from 'react-icons/fi';

const emptyForm = { title: '', from: '', to: '', price: '', discountedPrice: '', featured: false };
const newDay = (day) => ({ day, title: '', description: '', activities: [''] });

export default function ManagePackages() {
  const [packages, setPackages] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [itinerary, setItinerary] = useState([newDay(1)]);
  const [files, setFiles] = useState([]);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');
  // id of the package being edited; null = create mode
  const [editingId, setEditingId] = useState(null);
  const formRef = useRef(null);
  const fileInputRef = useRef(null);

  // admin sees hidden packages too
  const load = () => api.get('/packages?all=true').then((res) => setPackages(res.data.packages));
  useEffect(() => { load(); }, []);

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
  };

  // --- itinerary builder helpers (keeps the response shape consistent) ---
  const updateDay = (i, key, value) =>
    setItinerary(itinerary.map((d, idx) => (idx === i ? { ...d, [key]: value } : d)));

  const addDay = () => setItinerary([...itinerary, newDay(itinerary.length + 1)]);

  const removeDay = (i) =>
    setItinerary(
      itinerary
        .filter((_, idx) => idx !== i)
        .map((d, idx) => ({ ...d, day: idx + 1 }))
    );

  const updateActivity = (i, j, value) =>
    setItinerary(
      itinerary.map((d, idx) =>
        idx === i ? { ...d, activities: d.activities.map((a, k) => (k === j ? value : a)) } : d
      )
    );

  const addActivity = (i) =>
    setItinerary(
      itinerary.map((d, idx) => (idx === i ? { ...d, activities: [...d.activities, ''] } : d))
    );

  const removeActivity = (i, j) =>
    setItinerary(
      itinerary.map((d, idx) =>
        idx === i ? { ...d, activities: d.activities.filter((_, k) => k !== j) } : d
      )
    );

  // serialize to the exact shape the UI consumes: { day, title, description, activities[] }
  const buildItinerary = () =>
    itinerary.map((d) => ({
      day: d.day,
      title: d.title.trim(),
      description: d.description.trim(),
      activities: d.activities.map((a) => a.trim()).filter(Boolean),
    }));

  const resetForm = () => {
    setForm(emptyForm);
    setItinerary([newDay(1)]);
    setFiles([]);
    setEditingId(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // load an existing package into the form for editing
  const startEdit = (pkg) => {
    setMsg(''); setError('');
    setEditingId(pkg.id);
    setForm({
      title: pkg.title || '',
      from: pkg.from || '',
      to: pkg.to || '',
      price: pkg.price ?? '',
      discountedPrice: pkg.discountedPrice ?? '',
      featured: !!pkg.featured,
    });
    setItinerary(
      Array.isArray(pkg.itinerary) && pkg.itinerary.length
        ? pkg.itinerary.map((d, i) => ({
            day: d.day ?? i + 1,
            title: d.title || '',
            description: d.description || '',
            activities: d.activities?.length ? d.activities : [''],
          }))
        : [newDay(1)]
    );
    setFiles([]);
    if (fileInputRef.current) fileInputRef.current.value = '';
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const submit = async (e) => {
    e.preventDefault();
    setMsg(''); setError('');
    try {
      // multipart because of file upload
      const fd = new FormData();
      fd.append('title', form.title);
      fd.append('from', form.from);
      fd.append('to', form.to);
      fd.append('featured', form.featured);
      fd.append('price', form.price);
      if (form.discountedPrice) fd.append('discountedPrice', form.discountedPrice);
      fd.append('itinerary', JSON.stringify(buildItinerary())); // always [{day,title,description,activities[]}]
      files.forEach((f) => fd.append('coverImage', f));

      if (editingId) {
        // images are optional on edit — backend keeps the old ones if none sent
        await api.put(`/packages/${editingId}`, fd);
        setMsg('Package updated');
      } else {
        await api.post('/packages', fd);
        setMsg('Package created');
      }
      resetForm();
      load();
    } catch (err) {
      setError(err.response?.data?.error || (editingId ? 'Update failed' : 'Create failed'));
    }
  };

  const remove = async (id) => {
    if (!confirm('Delete this package?')) return;
    try {
      await api.delete(`/packages/${id}`);
      if (editingId === id) resetForm();
      load();
    } catch (err) {
      setError(err.response?.data?.error || 'Delete failed');
    }
  };

  // show/hide on the public site without touching existing orders
  const toggleActive = async (id) => {
    setError('');
    try {
      await api.patch(`/packages/${id}/toggle`);
      load();
    } catch (err) {
      setError(err.response?.data?.error || 'Could not update visibility');
    }
  };

  return (
    <div>
      <PageHeader title="Manage Packages" subtitle="Create, edit and manage tour packages." />

      <Card className="mb-8 p-5 sm:p-6">
        <form ref={formRef} onSubmit={submit} className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-slate-900">
              {editingId ? 'Edit package' : 'Create package'}
            </h2>
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="inline-flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-slate-700"
              >
                <FiX /> Cancel edit
              </button>
            )}
          </div>

          <div className="space-y-1">
            <Label>Title</Label>
            <Input name="title" value={form.title} onChange={onChange} placeholder="e.g. Nainital & Mussoorie 4N/5D" required />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <Label>From</Label>
              <Input name="from" value={form.from} onChange={onChange} placeholder="e.g. Delhi" required />
            </div>
            <div className="space-y-1">
              <Label>To (destination)</Label>
              <Input name="to" value={form.to} onChange={onChange} placeholder="e.g. Nainital" required />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <Label>Price (₹)</Label>
              <Input name="price" value={form.price} onChange={onChange} placeholder="Price" type="number" required />
            </div>
            <div className="space-y-1">
              <Label>Discounted price (₹)</Label>
              <Input name="discountedPrice" value={form.discountedPrice} onChange={onChange} placeholder="Optional" type="number" />
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
            <input
              type="checkbox"
              name="featured"
              checked={form.featured}
              onChange={onChange}
              className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
            />
            <FiStar className="text-amber-500" /> Featured (shows in Popular destinations)
          </label>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Itinerary</Label>
              <button type="button" onClick={addDay} className="text-sm font-medium text-brand-600 hover:underline">
                + Add day
              </button>
            </div>

            {itinerary.map((d, i) => (
              <div key={i} className="space-y-2 rounded-xl border border-slate-200 bg-slate-50 p-3">
                <div className="flex items-center justify-between">
                  <span className="rounded-md bg-brand-50 px-2 py-0.5 text-xs font-bold text-brand-700">Day {d.day}</span>
                  {itinerary.length > 1 && (
                    <button type="button" onClick={() => removeDay(i)} className="text-xs font-medium text-rose-600 hover:underline">
                      Remove day
                    </button>
                  )}
                </div>

                <Input value={d.title} onChange={(e) => updateDay(i, 'title', e.target.value)} placeholder="Title (e.g. Arrival)" required />
                <Textarea value={d.description} onChange={(e) => updateDay(i, 'description', e.target.value)} placeholder="Description (optional)" rows={2} />

                <div className="space-y-2">
                  <span className="text-xs text-slate-500">Activities</span>
                  {d.activities.map((a, j) => (
                    <div key={j} className="flex gap-2">
                      <Input value={a} onChange={(e) => updateActivity(i, j, e.target.value)} placeholder={`Activity ${j + 1}`} />
                      {d.activities.length > 1 && (
                        <button type="button" onClick={() => removeActivity(i, j)} className="px-2 text-rose-600 hover:underline">×</button>
                      )}
                    </div>
                  ))}
                  <button type="button" onClick={() => addActivity(i)} className="text-sm font-medium text-brand-600 hover:underline">
                    + Add activity
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-1">
            <Label>Cover images{editingId ? ' (leave empty to keep current images)' : ''}</Label>
            <input
              ref={fileInputRef}
              type="file" multiple accept="image/*" onChange={(e) => setFiles([...e.target.files])}
              className="block w-full text-sm text-slate-500 file:mr-3 file:rounded-lg file:border-0 file:bg-brand-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-brand-700 hover:file:bg-brand-100"
            />
          </div>

          {msg && <Alert type="success">{msg}</Alert>}
          {error && <Alert type="error">{error}</Alert>}
          <div className="flex gap-2">
            <Button type="submit">{editingId ? 'Save changes' : 'Create package'}</Button>
            {editingId && (
              <Button type="button" variant="secondary" onClick={resetForm}>Cancel</Button>
            )}
          </div>
        </form>
      </Card>

      <h2 className="mb-3 font-semibold text-slate-900">Existing packages</h2>
      <div className="space-y-2">
        {packages.map((pkg) => (
          <Card
            key={pkg.id}
            className={`flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between ${
              pkg.isActive ? '' : 'opacity-60'
            } ${editingId === pkg.id ? 'ring-2 ring-brand-400' : ''}`}
          >
            <div className="flex items-center gap-3">
              <img
                src={pkg.coverImage?.[0] || MOUNTAIN_IMG}
                alt=""
                className="h-11 w-11 rounded-lg object-cover"
              />
              <div>
                <p className="flex flex-wrap items-center gap-2 font-medium text-slate-900">
                  {pkg.title}
                  {pkg.featured && (
                    <Badge className="bg-amber-100 text-amber-800"><FiStar /> Featured</Badge>
                  )}
                  {!pkg.isActive && (
                    <Badge className="bg-slate-200 text-slate-600"><FiEyeOff /> Hidden</Badge>
                  )}
                </p>
                <p className="text-sm text-slate-500">
                  {pkg.from} → {pkg.to} · {inr(pkg.discountedPrice || pkg.price)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 self-end sm:self-auto">
              <Button variant="secondary" onClick={() => startEdit(pkg)}>
                <FiEdit2 /> Edit
              </Button>
              <Button
                variant="secondary"
                onClick={() => toggleActive(pkg.id)}
                title={pkg.isActive ? 'Hide from the public listing' : 'Show on the public listing'}
              >
                {pkg.isActive ? <><FiEyeOff /> Hide</> : <><FiEye /> Show</>}
              </Button>
              <Button variant="ghost" className="text-rose-600 hover:bg-rose-50" onClick={() => remove(pkg.id)}>
                Delete
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
