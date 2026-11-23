import { useEffect, useMemo, useState } from 'react';
import {
  Bell, CalendarDays, ChevronDown, ChevronUp, Megaphone,
} from 'lucide-react';
import Alerta from '../../components/ui/Alerta';
import Buscador from '../../components/ui/Buscador';
import Cargando from '../../components/ui/Cargando';
import { mensajeError } from '../../services/api';
import { obtenerTodos } from '../../services/recursos';

const DIAS_NUEVO = 7;

function fechaPublicacion(valor) {
  return new Date(valor).toLocaleString('es-SV', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

function esNuevo(anuncio) {
  return Date.now() - new Date(anuncio.fecha_publicacion).getTime() < DIAS_NUEVO * 86400000;
}

function TarjetaAnuncio({ anuncio, destacado }) {
  const largo = anuncio.contenido.length > 280;
  const [abierto, setAbierto] = useState(!largo);
  return (
    <article className={`rounded-xl border p-5 transition-colors ${destacado ? 'border-brand/40 bg-brand/5' : 'border-line bg-card'}`}>
      <div className="flex items-start gap-3">
        <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl ${destacado ? 'bg-brand-gradient' : 'bg-line'}`}>
          <Megaphone size={17} className={destacado ? 'text-white' : 'text-brand-soft'} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-display text-sm font-bold text-white">{anuncio.titulo}</h3>
            {esNuevo(anuncio) && <span className="rounded-full bg-brand/20 px-2 py-0.5 text-[10px] font-semibold text-brand-soft">Nuevo</span>}
          </div>
          <p className="mt-0.5 flex items-center gap-1 text-[11px] text-gray-500">
            <CalendarDays size={11} />{`${fechaPublicacion(anuncio.fecha_publicacion)} · Administración`}
          </p>
          <p className={`mt-3 text-xs leading-relaxed whitespace-pre-line text-gray-300 ${abierto ? '' : 'line-clamp-4'}`}>{anuncio.contenido}</p>
          {largo && (
            <button
              type="button"
              onClick={() => setAbierto(!abierto)}
              className="mt-2 flex items-center gap-1 text-[11px] font-semibold text-brand-soft hover:underline"
            >
              {abierto ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
              {abierto ? 'Ver menos' : 'Leer completo'}
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

// Anuncios para secretaría: solo lectura de lo que publica la administración (no muestra programados).
export default function Anuncios() {
  const [anuncios, setAnuncios] = useState(null);
  const [error, setError] = useState('');
  const [buscar, setBuscar] = useState('');

  useEffect(() => {
    let vigente = true;
    obtenerTodos('anuncios')
      .then((lista) => {
        if (!vigente) return;
        const ahora = new Date();
        setAnuncios(lista.filter((a) => new Date(a.fecha_publicacion) <= ahora)
          .sort((a, b) => String(b.fecha_publicacion).localeCompare(String(a.fecha_publicacion))));
      })
      .catch((e) => { if (vigente) setError(mensajeError(e, 'No se pudieron cargar los anuncios.')); });
    return () => { vigente = false; };
  }, []);

  const termino = buscar.trim().toLowerCase();
  const visibles = useMemo(() => (anuncios || []).filter((a) => !termino
    || a.titulo.toLowerCase().includes(termino) || a.contenido.toLowerCase().includes(termino)), [anuncios, termino]);

  if (!anuncios) return error ? <Alerta>{error}</Alerta> : <Cargando texto="Cargando anuncios..." />;

  const nuevos = anuncios.filter(esNuevo).length;

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-line bg-card p-4">
        <div className="flex items-center gap-2">
          <Bell size={15} className="text-brand-soft" />
          <p className="text-xs text-gray-300">
            <span className="font-semibold text-white">{anuncios.length}</span>
            {' anuncio(s) publicados'}
            {nuevos > 0 && <span className="text-brand-soft">{` · ${nuevos} nuevo(s) esta semana`}</span>}
          </p>
        </div>
        <div className="ml-auto w-full sm:w-72">
          <Buscador id="buscar-anuncio" etiqueta="Buscar anuncio" placeholder="Buscar en los anuncios..." valor={buscar} onChange={setBuscar} />
        </div>
      </div>

      {visibles.length === 0 && (
        <div className="rounded-xl border border-dashed border-line py-16 text-center">
          <Megaphone size={36} className="mx-auto mb-3 text-gray-700" />
          <p className="text-sm text-gray-500">{anuncios.length ? 'Ningún anuncio coincide con la búsqueda.' : 'La administración aún no ha publicado anuncios.'}</p>
        </div>
      )}
      {visibles.map((a, i) => <TarjetaAnuncio key={a.id} anuncio={a} destacado={i === 0 && !termino} />)}
    </div>
  );
}
