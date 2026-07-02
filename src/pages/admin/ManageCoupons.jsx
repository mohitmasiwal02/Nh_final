import { useEffect, useState } from 'react';
import api from '../../api/axios';
import { Card, PageHeader, Button, Input, Select, Label, Badge, Alert } from '../../components/ui';

const emptyForm = { code: '', discountType: 'percentage', discountValue: '', scope: 'all', validTo: '' };

export default function ManageCoupons() {
  const [coupons, setCoupons] = useState([]);
  const [packages, setPackages] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [packageIds, setPackageIds] = useState([]);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  const load = () => {
    api.get('/coupons').then((res) => setCoupons(res.data.coupons));
    api.get('/packages').then((res) => setPackages(res.data.packages));
  };
  useEffect(() => { load(); }, []);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const create = async (e) => {
    e.preventDefault();
    setMsg(''); setError('');
    try {
      const body = {
        code: form.code,
        discountType: form.discountType,
        discountValue: Number(form.discountValue),
        scope: form.scope,
        validTo: form.validTo || null,
      };
      if (form.scope === 'specific') body.packageIds = packageIds;

      await api.post('/coupons', body);
      setMsg('Coupon created');
      setForm(emptyForm);
      setPackageIds([]);
      load();
    } catch (err) {
      setError(err.response?.data?.error || 'Create failed');
    }
  };

  const remove = async (id) => {
    if (!confirm('Delete this coupon?')) return;
    try {
      await api.delete(`/coupons/${id}`);
      load();
    } catch (err) {
      setError(err.response?.data?.error || 'Delete failed');
    }
  };

  const togglePackage = (id) => {
    setPackageIds((prev) => prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]);
  };

  return (
    <div>
      <PageHeader title="Manage Coupons" subtitle="Create and remove discount coupons." />

      <Card className="mb-8 p-5 sm:p-6">
        <form onSubmit={create} className="space-y-4">
          <h2 className="font-semibold text-slate-900">Create coupon</h2>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="space-y-1">
              <Label>Code</Label>
              <Input name="code" value={form.code} onChange={onChange} placeholder="SUMMER20" required />
            </div>
            <div className="space-y-1">
              <Label>Type</Label>
              <Select name="discountType" value={form.discountType} onChange={onChange}>
                <option value="percentage">Percentage (%)</option>
                <option value="flat">Flat (₹)</option>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Value</Label>
              <Input name="discountValue" value={form.discountValue} onChange={onChange} placeholder="Value" type="number" required />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <Label>Scope</Label>
              <Select name="scope" value={form.scope} onChange={onChange}>
                <option value="all">All packages</option>
                <option value="specific">Specific packages</option>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Valid to</Label>
              <Input name="validTo" value={form.validTo} onChange={onChange} type="date" />
            </div>
          </div>

          {form.scope === 'specific' && (
            <div className="rounded-xl border border-slate-200 p-3">
              <p className="mb-2 text-sm font-medium text-slate-700">Select packages</p>
              <div className="grid max-h-40 grid-cols-1 gap-1 overflow-auto sm:grid-cols-2">
                {packages.map((pkg) => (
                  <label key={pkg.id} className="flex items-center gap-2 rounded-md px-2 py-1 text-sm hover:bg-slate-50">
                    <input type="checkbox" className="accent-brand-600" checked={packageIds.includes(pkg.id)} onChange={() => togglePackage(pkg.id)} />
                    {pkg.title}
                  </label>
                ))}
              </div>
            </div>
          )}

          {msg && <Alert type="success">{msg}</Alert>}
          {error && <Alert type="error">{error}</Alert>}
          <Button type="submit">Create coupon</Button>
        </form>
      </Card>

      <h2 className="mb-3 font-semibold text-slate-900">Existing coupons</h2>
      <div className="space-y-2">
        {coupons.map((c) => (
          <Card key={c.id} className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-3">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-brand-50 text-lg">🎟️</span>
              <div>
                <p className="flex items-center gap-2 font-medium text-slate-900">
                  {c.code}
                  <Badge className="bg-slate-100 text-slate-500">{c.scope}</Badge>
                </p>
                <p className="text-sm text-slate-500">
                  {c.discountType === 'percentage' ? `${c.discountValue}% off` : `₹${c.discountValue} off`}
                </p>
              </div>
            </div>
            <Button variant="ghost" className="text-rose-600 hover:bg-rose-50" onClick={() => remove(c.id)}>
              Delete
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
}
