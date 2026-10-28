import { expect } from 'vitest';

// Reads back what Emotion wrote into <style> tags, so a test can assert `:hover`,
// `.Mui-selected` or `@media` rules that jsdom's `getComputedStyle` never resolves.
// Shared by the component-override tests; see the comments on each helper.

export interface Rule {
    /** Media condition the rule sits under; `null` at top level. */
    media: string | null;
    /** Selector text as emitted, e.g. `.css-x:hover`. */
    selector: string;
    /** Declaration list, without the braces. */
    body: string;
}

// Emotion writes its rules into <style> tags as flat text, and jsdom resolves neither
// `:hover` / `.Mui-checked` nor `@media` through `getComputedStyle` — so reading the sheet is
// the only way to assert those states. Parsing it rather than substring-searching matters: a
// `toContain` over the raw sheet also passes on a value belonging to an unrelated rule.
export const parseRules = (css: string, media: string | null = null): Rule[] => {
    const out: Rule[] = [];
    let i = 0;

    while (i < css.length) {
        const open = css.indexOf('{', i);

        if (open === -1) {
            break;
        }

        const prelude = css.slice(i, open).trim();
        let depth = 1;
        let j = open + 1;

        while (j < css.length && depth > 0) {
            if (css[j] === '{') {
                depth += 1;
            } else if (css[j] === '}') {
                depth -= 1;
            }

            j += 1;
        }

        const body = css.slice(open + 1, j - 1);

        if (prelude.startsWith('@media')) {
            out.push(...parseRules(body, prelude.slice('@media'.length).trim()));
        } else if (!prelude.startsWith('@')) {
            out.push({ media, selector: prelude, body });
        }

        i = j;
    }

    return out;
};

// Rules targeting the element's own emotion class, in emitted order. Fails rather than
// widening to the whole document when the element carries no emotion class: an unstyled
// element is the bug under test, not a reason to search somewhere else.
export const rulesFor = (el: Element): { own: string; rules: Rule[]; } => {
    const own = Array.from(el.classList).filter((c) => c.startsWith('css-'));

    expect(own, 'element carries no emotion class').not.toHaveLength(0);

    const css = Array.from(document.querySelectorAll('style'))
        .map((s) => s.textContent ?? '')
        .join('\n');

    return {
        own: own[0],
        rules: parseRules(css).filter((r) => own.some((c) => r.selector.includes(`.${c}`)))
    };
};

// Whether any branch of a (possibly comma-separated) selector targets exactly `state` on the
// element's own class — `''` for the base rule, `':hover'`, `'.Mui-checked'`, … Emotion emits a
// grouped selector as one rule, so the branches have to be split before matching.
export const targets = (selector: string, own: string, state: string): boolean =>
    selector
        .split(',')
        .map((part) => part.trim())
        .filter((part) => part.includes(`.${own}`))
        .some((part) => part.slice(part.indexOf(`.${own}`) + own.length + 1) === state);

// Value of `prop` for one state of the element. Last declaration wins, matching the cascade.
export const styleFor = (
    el: Element,
    state: string,
    prop: string,
    media: string | null = null
): string | undefined => {
    const { own, rules } = rulesFor(el);

    return rules
        .filter((r) => r.media === media && targets(r.selector, own, state))
        .flatMap((r) => r.body.split(';'))
        .map((d) => d.trim())
        .filter((d) => d.startsWith(`${prop}:`))
        .map((d) => d.slice(prop.length + 1).trim())
        .at(-1);
};

// Position of the LAST rule carrying `state` — the one that wins — so ordering between two
// rules of equal specificity can be asserted directly instead of inferred from a computed
// value. MUI emits its own `.Mui-disabled` rule earlier for unrelated reasons, so taking the
// first match here would compare against the wrong rule.
export const orderOf = (el: Element, state: string): number => {
    const { own, rules } = rulesFor(el);

    return rules.findLastIndex((r) => r.media === null && targets(r.selector, own, state));
};
