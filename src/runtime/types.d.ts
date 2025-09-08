// Documentation-only TypeScript interfaces for the runtime/template contract.
// This file is not compiled; it serves as a reference for authors and reviewers.

export interface GenerateOptions {
    seed: number;                 // required, deterministic driver
    config?: Record<string, any>; // optional, template-specific knobs
    side?: 'front' | 'back';      // default 'front'
}

export interface GenerateResult {
    html: string;   // HTML to inject into card body
    data?: unknown; // optional debug/QA info (not used by Anki)
}

export interface TemplateMeta {
    title: string;                 // human-friendly name
    skills: string[];              // e.g., ['fractions', 'lcm']
    gradeBands: number[];          // e.g., [4,5,6]
    defaults?: Record<string, any>;// default config values
}

export interface TemplateImpl {
    id: string;                     // stable path-like id (e.g., 'fractions/add_unlike')
    meta?: TemplateMeta;
    generate(opts: GenerateOptions): GenerateResult;
    validate?(opts: GenerateOptions): { ok: boolean; errors?: string[]; warnings?: string[] };
}

