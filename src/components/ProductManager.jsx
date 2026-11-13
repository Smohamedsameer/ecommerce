import { useEffect, useRef, useState } from 'react';
import { Eye, EyeOff, ImagePlus, Pencil, Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api, { errMsg } from '../api/client';
import { Empty, Modal, Pagination, Spinner, Stars } from './ui';
import { SearchInput, usePagedList } from './dashkit';
import { CATEGORIES, FITS, LOW_STOCK, SIZES } from '../config';
import { imageUrl, money } from '../utils';

const BLANK = { name: '', brand: '', category: CATEGORIES[0], description: '', price: '', mrp: '', stock: '', sizes: ['S', 'M', 'L', 'XL'], active: true, material: '', fit: '', care: '', returnable: true };

function ProductForm({ base, product, onClose, onSaved }) {
  const editing = !!product;
  const [f, setF] = useState(() => editing ? {
    name: product.name, brand: product.brand || '', category: product.category, description: product.description || '',
    price: product.price, mrp: product.mrp || '', stock: product.stock, sizes: product.sizes, active: product.active,
    material: product.material || '', fit: product.fit || '', care: product.care || '', returnable: product.returnable,
  } : BLANK);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(editing ? imageUrl(product.imageUrl) : '');
  const [busy, setBusy] = useState(false);
  const input = useRef();
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  useEffect(() => () => { if (file && preview) URL.revokeObjectURL(preview); }, [file, preview]);

  const pick = (e) => {
    const picked = e.target.files?.[0];
    if (!picked) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(picked.type)) return toast.error('Use a JPG, PNG or WEBP image');
    if (picked.size > 5 * 1024 * 1024) return toast.error('Image must be under 5 MB');
    setFile(picked); setPreview(URL.createObjectURL(picked));
  };
  const toggleSize = (s) => setF({ ...f, sizes: f.sizes.includes(s) ? f.sizes.filter((x) => x !== s) : [...f.sizes, s] });

  const save = async (e) => {
    e.preventDefault();
    if (!editing && !file) return toast.error('Please upload a product image');
    if (f.mrp && Number(f.mrp) < Number(f.price)) return toast.error('MRP cannot be lower than the selling price');
    const body = new FormData();
    body.append('name', f.name); body.append('brand', f.brand); body.append('category', f.category);
    body.append('description', f.description); body.append('price', f.price);
    if (f.mrp) body.append('mrp', f.mrp);
    body.append('stock', f.stock); body.append('sizes', f.sizes.join(',')); body.append('active', f.active);
    body.append('material', f.material); body.append('fit', f.fit); body.append('care', f.care); body.append('returnable', f.returnable);
    if (file) body.append('image', file);
    setBusy(true);
    try {
      if (editing) await api.put(`${base}/products/${product.id}`, body);
      else await api.post(`${base}/products`, body);
      toast.success(editing ? 'Product updated' : 'Product added. It is now live in the shop.');
      onSaved();
    } catch (err) { toast.error(errMsg(err)); } finally { setBusy(false); }
  };

  return (
    <Modal title={editing ? 'Edit product' : 'Add a product'} onClose={onClose}
      footer={<><button className="btn ghost" onClick={onClose} type="button">Cancel</button><button className="btn forest" form="pform" disabled={busy}>{busy ? 'Saving…' : editing ? 'Save changes' : 'Publish product'}</button></>}>
      <form id="pform" onSubmit={save}>
        <div className="field">
          <span className="label">Product image</span>
          <div className="upload-box">
            {preview ? <img src={preview} alt="Preview" /> : <ImagePlus size={36} color="var(--muted)" />}
            <div>
              <button type="button" className="btn ghost sm" onClick={() => input.current.click()}>{preview ? 'Change image' : 'Choose image'}</button>
              <div className="hint" style={{ marginTop: 6 }}>JPG, PNG or WEBP, up to 5 MB. A square image on a clean background looks best.</div>
            </div>
            <input ref={input} type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={pick} />
          </div>
        </div>
        <div className="form-grid">
          <div className="field full"><label htmlFor="pn">Product name</label><input id="pn" className="input" required maxLength={200} value={f.name} onChange={set('name')} /></div>
          <div className="field"><label htmlFor="pb">Brand</label><input id="pb" className="input" maxLength={100} value={f.brand} onChange={set('brand')} /></div>
          <div className="field"><label htmlFor="pc">Category</label>
            <select id="pc" className="input" value={f.category} onChange={set('category')}>
              {[...new Set([...CATEGORIES, f.category])].map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div className="field"><label htmlFor="pp">Selling price (₹)</label><input id="pp" className="input" type="number" min="1" step="0.01" required value={f.price} onChange={set('price')} /></div>
          <div className="field"><label htmlFor="pm">MRP (₹, optional)</label><input id="pm" className="input" type="number" min="1" step="0.01" value={f.mrp} onChange={set('mrp')} /><span className="hint">Shown struck through to display the discount.</span></div>
          <div className="field"><label htmlFor="ps">Stock</label><input id="ps" className="input" type="number" min="0" required value={f.stock} onChange={set('stock')} /></div>
          <div className="field"><span className="label">Visibility</span>
            <label className="check" style={{ paddingTop: 10 }}><input type="checkbox" checked={f.active} onChange={(e) => setF({ ...f, active: e.target.checked })} /> Visible in the shop</label>
          </div>
          <div className="field full"><span className="label">Available sizes</span>
            <div className="size-pick">
              {SIZES.map((s) => <button type="button" key={s} className={`chip ${f.sizes.includes(s) ? 'active' : ''}`} onClick={() => toggleSize(s)} aria-pressed={f.sizes.includes(s)}>{s}</button>)}
            </div>
            <span className="hint">Leave all unselected for products without sizes.</span>
          </div>
          <div className="field"><label htmlFor="pmat">Material</label><input id="pmat" className="input" maxLength={120} placeholder="e.g. 100% cotton" value={f.material} onChange={set('material')} /></div>
          <div className="field"><label htmlFor="pfit">Fit</label>
            <select id="pfit" className="input" value={f.fit} onChange={set('fit')}><option value="">Not specified</option>{FITS.map((x) => <option key={x}>{x}</option>)}</select>
          </div>
          <div className="field full"><label htmlFor="pcare">Care instructions</label><input id="pcare" className="input" maxLength={500} placeholder="e.g. Machine wash cold. Do not bleach." value={f.care} onChange={set('care')} /></div>
          <div className="field full"><label className="check"><input type="checkbox" checked={f.returnable} onChange={(e) => setF({ ...f, returnable: e.target.checked })} /> Customers can return this product</label><span className="hint">Untick for items that cannot be returned, such as innerwear or customised pieces.</span></div>
          <div className="field full"><label htmlFor="pd">Description</label><textarea id="pd" className="input" maxLength={4000} value={f.description} onChange={set('description')} /></div>
        </div>
      </form>
    </Modal>
  );
}

/** Product list with search, used by both the seller dashboard and the admin panel. */
export default function ProductManager({ base, admin }) {
  const { data, q, setQ, page, setPage, reload } = usePagedList(`${base}/products`);
  const [editing, setEditing] = useState(null); // null | 'new' | product

  const toggle = async (p) => { try { await api.patch(`${base}/products/${p.id}/toggle`); reload(); } catch (e) { toast.error(errMsg(e)); } };
  const del = async (p) => {
    if (!window.confirm(`Delete “${p.name}”?`)) return;
    try { const { data: r } = await api.delete(`${base}/products/${p.id}`); toast.success(r.message); reload(); } catch (e) { toast.error(errMsg(e)); }
  };

  return (
    <>
      <div className="card table-card">
        <div className="table-tools">
          <SearchInput value={q} onChange={setQ} placeholder="Search by name, brand or category" />
          <span className="grow" />
          <button className="btn forest" onClick={() => setEditing('new')}><Plus size={18} /> Add product</button>
        </div>
        {data === null ? <Spinner /> : data.content.length === 0 ? (
          <Empty title={q ? 'No products match your search' : 'No products yet'}>{q ? 'Try a different keyword.' : 'Add your first product and it goes live in the shop right away.'}</Empty>
        ) : (
          <table className="tbl">
            <thead><tr><th>Product</th><th>Category</th><th>Price</th><th>Stock</th><th>Rating</th>{admin ? <th>Seller</th> : null}<th>Status</th><th /></tr></thead>
            <tbody>
              {data.content.map((p) => (
                <tr key={p.id}>
                  <td className="cell-first"><div className="cell-prod"><img src={imageUrl(p.imageUrl)} alt="" /><div><b>{p.name}</b><span className="muted small">{p.brand}</span></div></div></td>
                  <td data-label="Category">{p.category}</td>
                  <td data-label="Price"><b>{money(p.price)}</b>{p.mrp && Number(p.mrp) > Number(p.price) ? <span className="muted small"> <s>{money(p.mrp)}</s></span> : null}</td>
                  <td data-label="Stock">{p.stock === 0 ? <span className="badge bad">Out of stock</span> : p.stock <= LOW_STOCK ? <span className="badge warn">{p.stock} left</span> : p.stock}</td>
                  <td data-label="Rating">{p.ratingCount ? <span className="row" style={{ gap: 6 }}><Stars value={p.avgRating} size={13} />{p.avgRating.toFixed(1)} ({p.ratingCount})</span> : <span className="muted">None</span>}</td>
                  {admin ? <td data-label="Seller">{p.sellerName}</td> : null}
                  <td data-label="Status"><span className={`badge ${p.active ? 'ok' : ''}`}>{p.active ? 'Live' : 'Hidden'}</span></td>
                  <td className="cell-actions"><div className="actions">
                    <button className="icon-btn sm" onClick={() => toggle(p)} aria-label={p.active ? 'Hide product' : 'Show product'} title={p.active ? 'Hide from shop' : 'Show in shop'}>{p.active ? <EyeOff size={16} /> : <Eye size={16} />}</button>
                    <button className="icon-btn sm" onClick={() => setEditing(p)} aria-label="Edit product" title="Edit"><Pencil size={16} /></button>
                    <button className="icon-btn sm danger" onClick={() => del(p)} aria-label="Delete product" title="Delete"><Trash2 size={16} /></button>
                  </div></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {data ? <div className="table-foot"><Pagination page={data.page} totalPages={data.totalPages} onChange={setPage} /></div> : null}
      </div>
      {editing ? <ProductForm base={base} product={editing === 'new' ? null : editing} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); reload(); }} /> : null}
    </>
  );
}
