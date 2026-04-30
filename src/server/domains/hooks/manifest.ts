/**
 * Hooks domain manifest — special case with TWO handler types:
 * - aiHookHandlers (AIHookToolHandlers)
 * - hookPresetHandlers (HookPresetToolHandlers)
 *
 * We use the primary depKey 'aiHookHandlers' for the manifest identity,
 * and directly bind hookPresetHandlers via getDep.
 */
import type { DomainManifest, MCPServerContext } from '@server/domains/shared/registry';
import {
  defineMethodRegistrations,
  ensureBrowserCore,
  toolLookup,
} from '@server/domains/shared/registry';
import { aiHookTools, hookPresetTools } from '@server/domains/hooks/definitions';
import type { AIHookToolHandlers, HookPresetToolHandlers } from '@server/domains/hooks/index';

const DOMAIN = 'hooks' as const;
const DEP_KEY = 'aiHookHandlers' as const;
const DEP_KEY_PRESET = 'hookPresetHandlers';
type H = AIHookToolHandlers;
type HP = HookPresetToolHandlers;
const toolDefinitions = [...aiHookTools, ...hookPresetTools] as const;
const t = toolLookup(toolDefinitions);
const aiRegistrations = defineMethodRegistrations<H, (typeof aiHookTools)[number]['name']>({
  domain: DOMAIN,
  depKey: DEP_KEY,
  lookup: t,
  entries: [{ tool: 'ai_hook', method: 'handleAIHook' }],
});
const presetRegistrations = defineMethodRegistrations<HP, (typeof hookPresetTools)[number]['name']>(
  {
    domain: DOMAIN,
    depKey: DEP_KEY_PRESET,
    lookup: t,
    entries: [{ tool: 'hook_preset', method: 'handleHookPreset' }],
  },
);

async function ensure(ctx: MCPServerContext): Promise<H> {
  const { AIHookToolHandlers, HookPresetToolHandlers } =
    await import('@server/domains/hooks/index');
  await ensureBrowserCore(ctx);
  if (!ctx.aiHookHandlers || !ctx.hookPresetHandlers) {
    if (!ctx.aiHookHandlers) {
      ctx.aiHookHandlers = new AIHookToolHandlers(ctx.pageController!);
    }
    // Also ensure the preset handlers are available
    if (!ctx.hookPresetHandlers) {
      ctx.hookPresetHandlers = new HookPresetToolHandlers(ctx.pageController!);
    }
  }
  return ctx.aiHookHandlers;
}

const manifest = {
  kind: 'domain-manifest',
  version: 1,
  domain: DOMAIN,
  depKey: DEP_KEY,
  secondaryDepKeys: ['hookPresetHandlers'],
  profiles: ['full'],
  ensure,
  registrations: [...aiRegistrations, ...presetRegistrations],
} satisfies DomainManifest<typeof DEP_KEY, H, typeof DOMAIN>;

export default manifest;
