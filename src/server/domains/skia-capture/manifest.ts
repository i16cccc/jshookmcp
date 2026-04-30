import { skiaTools } from '@server/domains/skia-capture/definitions';
import type { SkiaCaptureHandlers } from '@server/domains/skia-capture/handlers';
import { asToolResponse } from '@server/domains/shared/response';
import type { DomainManifest, MCPServerContext } from '@server/domains/shared/registry';
import { defineMethodRegistrations, toolLookup } from '@server/domains/shared/registry';

const DOMAIN = 'skia-capture' as const;
const DEP_KEY = 'skiaCaptureHandlers' as const;
const PROFILES: Array<'workflow' | 'full'> = ['workflow', 'full'];

type H = SkiaCaptureHandlers;

const lookup = toolLookup(skiaTools);
const registrations = defineMethodRegistrations<H, (typeof skiaTools)[number]['name']>({
  domain: DOMAIN,
  depKey: DEP_KEY,
  lookup,
  wrapResult: asToolResponse,
  entries: [
    { tool: 'skia_detect_renderer', method: 'handleSkiaDetectRenderer' },
    { tool: 'skia_extract_scene', method: 'handleSkiaExtractScene' },
    { tool: 'skia_correlate_objects', method: 'handleSkiaCorrelateObjects' },
  ],
});

async function ensure(ctx: MCPServerContext): Promise<H> {
  const { SkiaCaptureHandlers } = await import('@server/domains/skia-capture/handlers');
  const existing = ctx.getDomainInstance<SkiaCaptureHandlers>(DEP_KEY);
  if (existing) {
    return existing;
  }

  const handlers = new SkiaCaptureHandlers({
    pageController: ctx.pageController ?? null,
    eventBus: ctx.eventBus,
  });
  ctx.setDomainInstance(DEP_KEY, handlers);
  return handlers;
}

const manifest = {
  kind: 'domain-manifest',
  version: 1,
  domain: DOMAIN,
  depKey: DEP_KEY,
  profiles: PROFILES,
  registrations,
  ensure,
  workflowRule: {
    patterns: [
      /\b(skia|gpu|render(er)?|scene\s?(tree|graph)|draw\s?call|raster|paint|layer)\b/i,
      /skia.*(render|detect|scene)/i,
      /canvas.*skia/i,
      /gpu.*backend/i,
    ],
    priority: 78,
    tools: ['skia_detect_renderer', 'skia_extract_scene', 'skia_correlate_objects'],
    hint: 'Skia pipeline analysis: detect GPU backend → dump scene tree → correlate with JS objects.',
  },
  prerequisites: {
    skia_detect_renderer: [
      {
        condition: 'Browser must be running with CDP attached',
        fix: 'Call browser_launch or browser_attach first',
      },
    ],
    skia_extract_scene: [
      {
        condition: 'Browser must be running with CDP attached',
        fix: 'Call browser_launch or browser_attach first',
      },
    ],
    skia_correlate_objects: [
      {
        condition: 'V8 heap snapshot should be available for robust matching',
        fix: 'Run v8_heap_snapshot_capture before correlation',
      },
    ],
  },
  toolDependencies: [
    {
      from: 'canvas',
      to: 'skia-capture',
      relation: 'uses',
      weight: 0.9,
    },
    {
      from: 'skia_correlate_objects',
      to: 'v8_heap_snapshot_capture',
      relation: 'precedes',
      weight: 0.6,
    },
  ],
} satisfies DomainManifest<typeof DEP_KEY, H, typeof DOMAIN>;

export default manifest;
