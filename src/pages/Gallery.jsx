import { useEffect, useState } from 'react';
import api from '../api/axios';
import { Alert, Spinner } from '../components/ui';
import { FiCamera } from 'react-icons/fi';
import GalleryCatalogCard from '../components/GalleryCatalogCard';
import Lightbox from '../components/Lightbox';

export default function Gallery() {
  const [catalogs, setCatalogs] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  // which catalog's lightbox is open, and at which image index
  const [openCatalog, setOpenCatalog] = useState(null);
  const [openIndex, setOpenIndex] = useState(0);

  useEffect(() => {
    api.get('/gallery')
      .then((res) => setCatalogs(res.data.catalogs))
      .catch((err) => setError(err.response?.data?.error || 'Failed to load gallery'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;

  return (
    <div className="funky-bg -mx-4 -mt-6 px-4 pb-12 pt-6 sm:-mx-6 sm:-mt-8 sm:px-6 sm:pt-8">
      {/* cohesive warm header */}
      <div className="relative mb-8 overflow-hidden rounded-3xl border border-amber-200/70 bg-linear-to-br from-amber-50 via-orange-50 to-rose-50 px-6 py-8 shadow-sm sm:px-9 sm:py-10">
        <span className="pointer-events-none absolute -right-8 -top-10 h-32 w-32 rounded-full bg-amber-200/40" />
        <span className="pointer-events-none absolute -bottom-12 -left-8 h-32 w-32 rounded-full bg-rose-200/40" />
        <div className="relative flex items-center gap-3">
          <span className="flex h-12 w-12 -rotate-6 items-center justify-center rounded-2xl bg-white text-amber-600 shadow-sm ring-1 ring-amber-100">
            <FiCamera className="text-2xl" />
          </span>
          <div>
            <h1 className="font-display text-3xl font-bold tracking-wide text-amber-900 sm:text-4xl">Our Gallery ✨</h1>
            <p className="mt-1 text-sm text-amber-800/70 sm:text-base">A glimpse of the trips, stays &amp; moments we've curated.</p>
          </div>
        </div>
      </div>

      {error && <Alert type="error">{error}</Alert>}

      {!error && catalogs.length === 0 && (
        <Alert type="info">No gallery photos yet — check back soon.</Alert>
      )}

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {catalogs.map((catalog, i) => (
          <GalleryCatalogCard
            key={catalog.id}
            catalog={catalog}
            index={i}
            onOpen={(index) => {
              setOpenCatalog(catalog);
              setOpenIndex(index);
            }}
          />
        ))}
      </div>

      {openCatalog && (
        <Lightbox
          images={openCatalog.images}
          index={openIndex}
          onChange={setOpenIndex}
          onClose={() => setOpenCatalog(null)}
        />
      )}
    </div>
  );
}
