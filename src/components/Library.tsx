import React, { useState } from 'react';
import {
  Search,
  Flame,
  Trees,
  ShieldAlert,
  ChevronDown,
  ChevronUp,
  Droplets,
} from 'lucide-react';
import { CATEGORIES, INITIAL_LIBRARY_ARTICLES } from '../data/initialData';

export const Library: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedArticleIds, setExpandedArticleIds] = useState<Set<string>>(() => new Set());
  const [activeSection, setActiveSection] = useState<'articles' | 'table' | 'techniques'>('articles');

  const handleToggleArticle = (e: React.MouseEvent<HTMLDivElement>, articleId: string) => {
    const headerEl = e.currentTarget;
    const rectBefore = headerEl.getBoundingClientRect();

    setExpandedArticleIds((prev) => {
      const next = new Set(prev);
      if (next.has(articleId)) {
        next.delete(articleId);
      } else {
        next.add(articleId);
      }
      return next;
    });

    // Asegura que la pantalla no salte ni se desplace, manteniéndose fija en su posición visual
    requestAnimationFrame(() => {
      const rectAfter = headerEl.getBoundingClientRect();
      const diff = rectAfter.top - rectBefore.top;
      if (Math.abs(diff) > 0.5) {
        window.scrollBy({ top: diff, behavior: 'instant' });
      }
    });
  };

  const filteredArticles = INITIAL_LIBRARY_ARTICLES.filter(
    (art) =>
      art.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      art.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
      art.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 pb-14 animate-fade-in">
      
      {/* Top Banner */}
      <div className="bg-[#fcfbf7] border border-[#e8e2d4] rounded-3xl p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-semibold text-[#2f3833]">
              Biblioteca de Información
            </h2>
          </div>

          {/* Section Selector */}
          <div className="flex items-center space-x-1.5 bg-[#f0ebd9] p-1.5 rounded-2xl border border-[#ded5c5]">
            <button
              onClick={() => setActiveSection('articles')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition ${
                activeSection === 'articles'
                  ? 'bg-white text-[#2f3833] shadow-xs'
                  : 'text-[#6f6758] hover:text-[#2d3748]'
              }`}
            >
              Teoría Completa
            </button>
            <button
              onClick={() => setActiveSection('table')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition ${
                activeSection === 'table'
                  ? 'bg-white text-[#2f3833] shadow-xs'
                  : 'text-[#6f6758] hover:text-[#2d3748]'
              }`}
            >
              Tabla de Ingestas
            </button>
            <button
              onClick={() => setActiveSection('techniques')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition ${
                activeSection === 'techniques'
                  ? 'bg-white text-[#2f3833] shadow-xs'
                  : 'text-[#6f6758] hover:text-[#2d3748]'
              }`}
            >
              Técnicas de Cocina
            </button>
          </div>
        </div>
      </div>

      {/* SECTION 1: ARTÍCULOS COMPLETOS */}
      {activeSection === 'articles' && (
        <div className="space-y-4">
          
          {/* Search bar */}
          <div className="relative max-w-lg">
            <Search className="w-4 h-4 text-[#8a7f6f] absolute left-3.5 top-3.5" />
            <input
              type="text"
              placeholder="Buscar en la biblioteca (ej. cefalópodos, marisco, microondas, crucíferas)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-white border border-[#dfd7c8] rounded-2xl focus:outline-none focus:ring-1 focus:ring-[#6f9072]"
            />
          </div>

          {/* Articles list */}
          <div className="space-y-4">
            {filteredArticles.map((article) => {
              const isExpanded = expandedArticleIds.has(article.id);
              return (
                <div
                  key={article.id}
                  className="bg-white border border-[#eae3d5] rounded-3xl overflow-hidden shadow-xs transition hover:border-[#cbdbcb]"
                >
                  {/* Article Accordion Header */}
                  <div
                    onClick={(e) => handleToggleArticle(e, article.id)}
                    className="p-5 sm:p-6 cursor-pointer flex items-center justify-between hover:bg-[#fbfaf6] transition select-none"
                  >
                    <div className="space-y-1 pr-4">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#f4f7f4] text-[#476749] border border-[#d8e6d8]">
                          {article.category}
                        </span>
                      </div>
                      <h3 className="text-lg sm:text-xl font-semibold text-[#2d3833] mt-1">
                        {article.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-[#738075]">
                        {article.summary}
                      </p>
                    </div>

                    <div className="p-2.5 rounded-2xl bg-[#faf8f4] border border-[#ede5d8] text-[#695f51] shrink-0">
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5" />
                      ) : (
                        <ChevronDown className="w-5 h-5" />
                      )}
                    </div>
                  </div>

                  {/* Expanded Body */}
                  {isExpanded && (
                    <div className="p-6 sm:p-8 border-t border-[#f0eae0] bg-[#fdfcf9] text-sm sm:text-base text-[#3b473f] leading-relaxed space-y-4">
                      <div
                        dangerouslySetInnerHTML={{
                          __html: formatMarkdownArticle(article.content),
                        }}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SECTION 2: SYNOPTIC TABLE */}
      {activeSection === 'table' && (
        <div className="bg-white border border-[#eae3d5] rounded-3xl p-6 shadow-xs space-y-6">
          <div>
            <h3 className="text-xl font-semibold text-[#2f3833]">
              Tabla Resumen de Frecuencias Semanales
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-[#e5decb] text-[#554e42] bg-[#fbf9f4]">
                  <th className="py-3.5 px-4 font-bold">Categoría</th>
                  <th className="py-3.5 px-4 font-bold">Frecuencia Objetivo</th>
                  <th className="py-3.5 px-4 font-bold">Subcategorías y Condiciones</th>
                  <th className="py-3.5 px-4 font-bold">Fundamento Científico</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f0eae0]">
                {CATEGORIES.map((cat) => (
                  <tr key={cat.id} className="hover:bg-[#fcfbf9]">
                    <td className="py-4 px-4 font-semibold text-[#2d3831] whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <span
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: cat.color.badge }}
                        ></span>
                        <span>{cat.name}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 font-bold text-[#3b5e3f] whitespace-nowrap">
                      {cat.rule.label}
                    </td>
                    <td className="py-4 px-4 text-[#5c685f]">
                      {cat.subcategories.join(', ')}
                    </td>
                    <td className="py-4 px-4 text-[#5c685f]">
                      {cat.rule.description}
                    </td>
                  </tr>
                ))}
                
                {/* Frutas */}
                <tr className="hover:bg-[#fcfbf9]">
                  <td className="py-4 px-4 font-semibold text-[#2d3831] whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <span className="w-3 h-3 rounded-full bg-[#82b385]"></span>
                      <span>Frutas</span>
                    </div>
                  </td>
                  <td className="py-4 px-4 font-bold text-[#3b5e3f] whitespace-nowrap">
                    14 raciones (2 al día)
                  </td>
                  <td className="py-4 px-4 text-[#5c685f]">
                    1 en almuerzo y 1 en cena (granada, manzana, arándanos, kiwi, pera...)
                  </td>
                  <td className="py-4 px-4 text-[#5c685f]">
                    Frutas enteras. Nunca en zumo.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SECTION 3: TÉCNICAS */}
      {activeSection === 'techniques' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          <div className="bg-white border border-[#eae3d5] rounded-3xl p-6 shadow-xs space-y-3">
            <div className="flex items-center space-x-3.5">
              <div className="w-11 h-11 rounded-2xl bg-[#eef4ee] text-[#4f7d53] flex items-center justify-center">
                <Droplets className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-semibold text-lg text-[#2f3833]">
                  Cocción al Vapor y Hervido Rápido
                </h4>
                <span className="text-xs text-[#78857a] font-medium">Verduras y pescados</span>
              </div>
            </div>
            <p className="text-sm text-[#4f5c51] leading-relaxed">
              Conserva intactos los glucosinolatos y antioxidantes sin lavar las vitaminas hidrosolubles. Pocos minutos de ebullición para mantener la verdura al dente y crujiente.
            </p>
          </div>

          <div className="bg-white border border-[#eae3d5] rounded-3xl p-6 shadow-xs space-y-3">
            <div className="flex items-center space-x-3.5">
              <div className="w-11 h-11 rounded-2xl bg-[#f7f0f8] text-[#7a4e87] flex items-center justify-center">
                <Flame className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-semibold text-lg text-[#2f3833]">
                  Remojo 48h y Olla a Presión (Legumbres)
                </h4>
                <span className="text-xs text-[#78857a] font-medium">Desactivación de fitatos y lectinas</span>
              </div>
            </div>
            <p className="text-sm text-[#4f5c51] leading-relaxed">
              El remojo durante 48 horas (cambiando el agua) junto con la presión elevada neutraliza la mayor parte de los antinutrientes de lentejas, garbanzos y alubias. También es excelente usar conservas en cristal bien lavadas bajo el grifo.
            </p>
          </div>

          <div className="bg-white border border-[#eae3d5] rounded-3xl p-6 shadow-xs space-y-3">
            <div className="flex items-center space-x-3.5">
              <div className="w-11 h-11 rounded-2xl bg-[#faece9] text-[#c0563b] flex items-center justify-center">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-semibold text-lg text-[#2f3833]">
                  Desterrar el Microondas
                </h4>
                <span className="text-xs text-[#78857a] font-medium">Protección vitamínica y del agua celular</span>
              </div>
            </div>
            <p className="text-sm text-[#4f5c51] leading-relaxed">
              Las ondas electromagnéticas artificiales del microondas destruyen la vitamina C, las del grupo B y la K, y desestructuran el agua biológica de los alimentos. Calienta siempre a fuego suave en cazuela o al vapor.
            </p>
          </div>

          <div className="bg-white border border-[#eae3d5] rounded-3xl p-6 shadow-xs space-y-3">
            <div className="flex items-center space-x-3.5">
              <div className="w-11 h-11 rounded-2xl bg-[#f8f4ec] text-[#8c7441] flex items-center justify-center">
                <Trees className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-semibold text-lg text-[#2f3833]">
                  Frutos Secos Crudos o Activados
                </h4>
                <span className="text-xs text-[#78857a] font-medium">Nunca fritos ni tostados</span>
              </div>
            </div>
            <p className="text-sm text-[#4f5c51] leading-relaxed">
              Los ácidos grasos poliinsaturados se oxidan con rapidez a altas temperaturas. Si los comes fritos o tostados, ingieres lípidos oxidados que dañan las membranas. Remójalos unas horas en agua para activar sus enzimas y eliminar el ácido fítico.
            </p>
          </div>

        </div>
      )}

    </div>
  );
};

function formatMarkdownArticle(md: string): string {
  return md
    .replace(/^#### (.*$)/gim, '<h5 class="font-semibold text-base text-[#2f3833] mt-3 mb-1">$1</h5>')
    .replace(/^### (.*$)/gim, '<h4 class="font-semibold text-lg text-[#2f3833] mt-5 mb-2 border-b border-[#eee7da] pb-1">$1</h4>')
    .replace(/^## (.*$)/gim, '<h3 class="font-semibold text-xl text-[#2f3833] mt-6 mb-2.5">$1</h3>')
    .replace(/^- (.*$)/gim, '<li class="ml-5 list-disc text-sm sm:text-base text-[#46544a] my-1">$1</li>')
    .replace(/\*\*(.*?)\*\*/gim, '<strong class="font-semibold text-[#27352a]">$1</strong>')
    .replace(/\n\n/gim, '<br />');
}
