import type { CSSProperties } from "react";

export type TipoEnfeite =
  | "faisca"
  | "ponto"
  | "mais"
  | "losango"
  | "estrela"
  | "quadradinho"
  | "tracejar";

export type Cintila = {
  x: number;
  y: number;
  t: number;
  atraso: number;
  dur: number;
  tipo: TipoEnfeite;
};

export function Simbolos() {
  return (
    <svg className="simbolos" aria-hidden="true" focusable="false">
      <symbol id="faisca" viewBox="0 0 16 16">
        <path
          d="M8 0c.7 4.7 2.6 6.6 8 8-5.4 1.4-7.3 3.3-8 8-.7-4.7-2.6-6.6-8-8 5.4-1.4 7.3-3.3 8-8z"
          fill="currentColor"
        />
      </symbol>
      <symbol id="ponto" viewBox="0 0 16 16">
        <circle cx="8" cy="8" r="3.4" fill="currentColor" />
      </symbol>
      <symbol id="mais" viewBox="0 0 16 16">
        <path
          d="M6.9 0h2.2v6.9H16v2.2H9.1V16H6.9V9.1H0V6.9h6.9z"
          fill="currentColor"
        />
      </symbol>
      <symbol id="losango" viewBox="0 0 16 16">
        <path
          d="M8 0c.7 4.7 2.6 6.6 8 8-5.4 1.4-7.3 3.3-8 8-.7-4.7-2.6-6.6-8-8 5.4-1.4 7.3-3.3 8-8z"
          fill="currentColor"
          transform="rotate(45 8 8)"
        />
      </symbol>
      <symbol id="estrela" viewBox="0 0 16 16">
        <path
          d="M8 0l1.9 6.1L16 8l-6.1 1.9L8 16l-1.9-6.1L0 8l6.1-1.9z"
          fill="currentColor"
        />
      </symbol>
      <symbol id="quadradinho" viewBox="0 0 16 16">
        <path
          d="M1.6 1.6h3.6v3.6H1.6zM6.2 1.6h3.6v3.6H6.2zM10.8 1.6h3.6v3.6h-3.6zM1.6 6.2h3.6v3.6H1.6zM6.2 6.2h3.6v3.6H6.2zM10.8 6.2h3.6v3.6h-3.6zM1.6 10.8h3.6v3.6H1.6zM6.2 10.8h3.6v3.6H6.2zM10.8 10.8h3.6v3.6h-3.6z"
          fill="currentColor"
        />
      </symbol>
      <symbol id="tracejar" viewBox="0 0 16 16">
        <path
          d="M0 4.9h6.3v2.4H0zM9.7 4.9H16v2.4H9.7zM4.9 10.6h6.2v2.4H4.9z"
          fill="currentColor"
        />
      </symbol>
    </svg>
  );
}

export function Faiscas({ itens }: { itens: Cintila[] }) {
  return (
    <div className="faiscas" aria-hidden="true">
      {itens.map((c, i) => {
        const estilo = {
          "--x": `${c.x}%`,
          "--y": `${c.y}%`,
          "--t": `${c.t}px`,
          "--atraso": `${c.atraso}s`,
          "--dur": `${c.dur}s`,
        } as CSSProperties;
        return (
          <span key={i} className="cintila" style={estilo}>
            <svg viewBox="0 0 16 16" aria-hidden="true">
              <use href={`#${c.tipo}`} />
            </svg>
          </span>
        );
      })}
    </div>
  );
}
