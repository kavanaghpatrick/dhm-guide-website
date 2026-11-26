import { describe, it, expect } from 'vitest';
import { cleanMarkdown } from '../cleanMarkdown';

describe('cleanMarkdown', () => {
  it('strips HTML comments but keeps inline-comparison-table markers', () => {
    const md = 'a\n<!-- hub-footer:auto -->\n## H\n<!-- inline-comparison-table:compact:after:1,2 -->';
    expect(cleanMarkdown(md)).toBe('a\n\n## H\n<!-- inline-comparison-table:compact:after:1,2 -->');
  });

  it('strips {#anchor} heading suffixes and keeps the heading text', () => {
    expect(cleanMarkdown('## Red Flags {#red-flags}\ntext {#keep}')).toBe('## Red Flags\ntext {#keep}');
  });

  it('decodes literal \\n escapes', () => {
    expect(cleanMarkdown('a\\n\\nb')).toBe('a\n\nb');
  });
});
