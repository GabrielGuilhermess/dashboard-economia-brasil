'use client';

import { geoMercator, geoPath } from 'd3-geo';
import { scaleQuantile } from 'd3-scale';
import { select } from 'd3-selection';
import { useCallback, useEffect, useRef, useState } from 'react';

import { MapSkeleton } from '@/components/ui/skeleton';
import { formatCompact, formatCurrency } from '@/lib/utils';
import { useDashboardStore } from '@/store/dashboard-store';
import type { MapaUFData } from '@/types/economia';

type FeatureWithCodarea = GeoJSON.Feature<
  GeoJSON.Geometry,
  GeoJSON.GeoJsonProperties & { codarea?: string }
>;

interface TooltipState {
  visible: boolean;
  x: number;
  y: number;
  content: MapaUFData | null;
}

/**
 * Props do mapa coroplético.
 */
export interface ChoroplethMapProps {
  data?: MapaUFData[];
  geojson?: GeoJSON.FeatureCollection;
  isLoading?: boolean;
}

export function ChoroplethMap({
  data,
  geojson,
  isLoading = false,
}: ChoroplethMapProps) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const theme = useDashboardStore((state) => state.theme);
  const setHoveredUF = useDashboardStore((state) => state.setHoveredUF);
  const [tooltip, setTooltip] = useState<TooltipState>({
    visible: false,
    x: 0,
    y: 0,
    content: null,
  });

  const drawMap = useCallback(() => {
    if (!svgRef.current || !containerRef.current || !geojson || !data) {
      return;
    }

    const containerWidth = containerRef.current.getBoundingClientRect().width;
    const width = Math.max(containerWidth, 320);
    const height = Math.min(width * 1.1, 500);
    const svg = select(svgRef.current);
    svg.selectAll('*').remove();
    svg.attr('viewBox', `0 0 ${width} ${height}`);

    const styles = getComputedStyle(document.documentElement);
    const colorRange = [
      styles.getPropertyValue('--map-min').trim(),
      styles.getPropertyValue('--map-q1').trim(),
      styles.getPropertyValue('--map-q2').trim(),
      styles.getPropertyValue('--map-q3').trim(),
      styles.getPropertyValue('--map-max').trim(),
    ];
    const dataMap = new Map(data.map((item) => [item.codIbge, item]));
    const values = data.map((item) => item.pibPerCapita);
    const colorScale = scaleQuantile<string>()
      .domain(values)
      .range(colorRange);
    const projection = geoMercator().fitSize([width - 20, height - 20], geojson);
    const pathGenerator = geoPath(projection);
    const features = geojson.features as FeatureWithCodarea[];

    svg
      .selectAll<SVGPathElement, FeatureWithCodarea>('path')
      .data(features)
      .join('path')
      .attr('d', (feature: FeatureWithCodarea) => pathGenerator(feature) ?? '')
      .attr('transform', 'translate(10, 10)')
      .attr('fill', (feature: FeatureWithCodarea) => {
        const item = dataMap.get(feature.properties?.codarea ?? '');
        return item ? colorScale(item.pibPerCapita) : 'var(--color-bg-tertiary)';
      })
      .attr('stroke', 'rgba(255,255,255,0.75)')
      .attr('stroke-width', 0.8)
      .style('cursor', 'pointer')
      .on('mouseenter', function handleMouseEnter(
        this: SVGPathElement,
        event: MouseEvent,
        feature: FeatureWithCodarea,
      ) {
        const item = dataMap.get(feature.properties?.codarea ?? '') ?? null;
        select(this).attr('stroke-width', 1.8);
        setHoveredUF(item?.uf ?? null);
        setTooltip({
          visible: true,
          x: event.offsetX,
          y: event.offsetY,
          content: item,
        });
      })
      .on('mousemove', function handleMouseMove(
        this: SVGPathElement,
        event: MouseEvent,
        feature: FeatureWithCodarea,
      ) {
        const item = dataMap.get(feature.properties?.codarea ?? '') ?? null;
        setTooltip({
          visible: true,
          x: event.offsetX,
          y: event.offsetY,
          content: item,
        });
      })
      .on('mouseleave', function handleMouseLeave(this: SVGPathElement) {
        select(this).attr('stroke-width', 0.8);
        setHoveredUF(null);
        setTooltip((current) => ({
          ...current,
          visible: false,
          content: null,
        }));
      });
  }, [data, geojson, setHoveredUF]);

  useEffect(() => {
    drawMap();

    function handleResize() {
      drawMap();
    }

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [drawMap, theme]);

  if (isLoading || !data || !geojson) {
    return <MapSkeleton />;
  }

  const min = Math.min(...data.map((item) => item.pibPerCapita));
  const max = Math.max(...data.map((item) => item.pibPerCapita));

  return (
    <div className="card rounded-[1.75rem] p-6">
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-text-tertiary">
          Distribuição territorial
        </p>
        <h2 className="mt-2 text-2xl font-semibold">PIB per capita por UF</h2>
      </div>

      <div ref={containerRef} className="relative">
        <svg ref={svgRef} className="h-[420px] w-full" role="img" aria-label="Mapa do PIB per capita por estado" />

        {tooltip.visible ? (
          <div
            className="pointer-events-none absolute rounded-2xl border border-border bg-bg-elevated px-4 py-3 shadow-xl"
            style={{
              left: tooltip.x,
              top: tooltip.y,
              transform: 'translate(-50%, -100%)',
            }}
          >
            {tooltip.content ? (
              <>
                <p className="font-semibold text-text-primary">{tooltip.content.nome}</p>
                <p className="mt-2 text-sm text-text-secondary">
                  PIB per capita:{' '}
                  <span className="font-semibold text-text-primary">
                    {formatCurrency(tooltip.content.pibPerCapita)}
                  </span>
                </p>
                <p className="text-sm text-text-secondary">
                  PIB total:{' '}
                  <span className="font-semibold text-text-primary">
                    {formatCompact(tooltip.content.pibTotal * 1_000_000)}
                  </span>
                </p>
                <p className="text-sm text-text-secondary">
                  População:{' '}
                  <span className="font-semibold text-text-primary">
                    {new Intl.NumberFormat('pt-BR').format(tooltip.content.populacao)}
                  </span>
                </p>
              </>
            ) : (
              <p className="text-sm font-semibold text-text-secondary">
                Dados não disponíveis
              </p>
            )}
          </div>
        ) : null}
      </div>

      <div className="mt-6">
        <div className="mb-2 flex h-3 overflow-hidden rounded-full">
          <span className="flex-1" style={{ backgroundColor: 'var(--map-min)' }} />
          <span className="flex-1" style={{ backgroundColor: 'var(--map-q1)' }} />
          <span className="flex-1" style={{ backgroundColor: 'var(--map-q2)' }} />
          <span className="flex-1" style={{ backgroundColor: 'var(--map-q3)' }} />
          <span className="flex-1" style={{ backgroundColor: 'var(--map-max)' }} />
        </div>
        <div className="flex justify-between text-xs font-semibold uppercase tracking-[0.18em] text-text-tertiary">
          <span>{formatCurrency(min, 0)}</span>
          <span>{formatCurrency(max, 0)}</span>
        </div>
      </div>
    </div>
  );
}

ChoroplethMap.displayName = 'ChoroplethMap';
