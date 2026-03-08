import { describe, it, expect } from 'vitest';
import { sanitizeFeedText } from '@/lib/sanitizeFeedText';

describe('sanitizeFeedText', () => {
  it('returns empty string for falsy input', () => {
    expect(sanitizeFeedText('')).toBe('');
    expect(sanitizeFeedText(null as any)).toBe('');
    expect(sanitizeFeedText(undefined as any)).toBe('');
  });

  it('strips HTML tags', () => {
    expect(sanitizeFeedText('<p>Hello <b>world</b></p>')).toBe('Hello world');
  });

  it('decodes HTML entities then strips resulting tags', () => {
    // &lt;3&gt; becomes <3> which is then stripped as an HTML tag
    expect(sanitizeFeedText('Tom &amp; Jerry &lt;3&gt;')).toBe('Tom & Jerry');
    expect(sanitizeFeedText('He said &quot;hello&quot;')).toBe('He said "hello"');
    expect(sanitizeFeedText('It&#039;s fine')).toBe("It's fine");
  });

  it('removes script tags and content', () => {
    expect(sanitizeFeedText('Hello<script>alert("xss")</script>World')).toBe('Hello World');
  });

  it('removes style tags and content', () => {
    expect(sanitizeFeedText('Hello<style>.x{color:red}</style>World')).toBe('Hello World');
  });

  it('removes javascript: protocol', () => {
    expect(sanitizeFeedText('javascript:alert(1)')).toBe('alert(1)');
  });

  it('removes inline event handlers', () => {
    const result = sanitizeFeedText('Text onclick="alert(1)" more');
    expect(result).not.toContain('onclick');
  });

  it('collapses whitespace', () => {
    expect(sanitizeFeedText('hello    world   foo')).toBe('hello world foo');
  });
});
