import { useEffect, useState } from 'react';
import api from '../api/axios';
import { PageHeader, Alert, Spinner } from '../components/ui';
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
    <div>
      <PageHeader title="Gallery" subtitle="A glimpse of the trips, stays and moments we've curated." />

      {error && <Alert type="error">{error}</Alert>}

      {!error && catalogs.length === 0 && (
        <Alert type="info">No gallery photos yet — check back soon.</Alert>
      )}

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {catalogs.map((catalog) => (
          <GalleryCatalogCard
            key={catalog.id}
            catalog={catalog}
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
