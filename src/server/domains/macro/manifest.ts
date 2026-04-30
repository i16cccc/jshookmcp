import type { DomainManifest, MCPServerContext } from '@server/domains/shared/registry';
import { defineMethodRegistrations, toolLookup } from '@server/domains/shared/registry';
import { macroTools } from '@server/domains/macro/definitions';
import type { MacroToolHandlers } from '@server/domains/macro/handlers';

const DOMAIN = 'macro' as const;
const DEP_KEY = 'macroHandlers' as const;
type H = MacroToolHandlers;
const t = toolLookup(macroTools);
const registrations = defineMethodRegistrations<H, (typeof macroTools)[number]['name']>({
  domain: DOMAIN,
  depKey: DEP_KEY,
  lookup: t,
  entries: [
    { tool: 'run_macro', method: 'handleRunMacro' },
    { tool: 'list_macros', method: 'handleListMacros' },
  ],
});

async function ensure(ctx: MCPServerContext): Promise<H> {
  const { MacroToolHandlers } = await import('@server/domains/macro/handlers');
  const existing = ctx.getDomainInstance<H>(DEP_KEY);
  if (existing) return existing;
  const handlers = new MacroToolHandlers(ctx);
  ctx.setDomainInstance(DEP_KEY, handlers);
  return handlers;
}

const manifest = {
  kind: 'domain-manifest',
  version: 1,
  domain: DOMAIN,
  depKey: DEP_KEY,
  profiles: ['full'],
  ensure,
  registrations,
} satisfies DomainManifest<typeof DEP_KEY, H, typeof DOMAIN>;

export default manifest;
