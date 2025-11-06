# Blog Design Patterns Guide

This guide explains how to use the enhanced design elements in blog posts to create more engaging and professional content.

## Quick Win Design Elements

### 1. Info Boxes / Alert Boxes

Use these patterns to create visually distinct callout boxes:

#### Info Box (Blue)
```markdown
**Info Box:** DHM has been used in traditional medicine for over 1,000 years in Asia.
```

#### Warning Box (Amber)
```markdown
**Warning:** Never exceed 1200mg of DHM in a 24-hour period.
```

#### Pro Tip Box (Green)
```markdown
**Pro Tip:** Take DHM 30-60 minutes before drinking for maximum effectiveness.
```

#### Key Insight Box (Purple)
```markdown
**Key Insight:** DHM works by enhancing liver enzymes and protecting GABA receptors.
```

### 2. Product Spotlight Cards

Create enhanced product cards with this pattern:

```markdown
**Product Spotlight: Flyby Recovery** - Contains 300mg DHM per serving with additional liver support ingredients. Third-party tested for purity.
```

### 3. Visual Separators

Use three dashes to create a decorative separator:

```markdown
---
```

This creates a centered line with a leaf icon.

### 4. Enhanced Statistics

Bold text with specific patterns gets special treatment:

#### Percentages
```markdown
**70% faster** alcohol recovery
```

#### Dosages and Prices
```markdown
Take **300mg** before drinking
Only **$29.99** per bottle
```

### 5. Technical Terms with Tooltips

Use inline code for technical terms that will show tooltips:

```markdown
DHM enhances `ADH` and `ALDH` enzyme activity
```

Currently supported terms:
- `ADH` - Alcohol dehydrogenase
- `ALDH` - Aldehyde dehydrogenase  
- `ALDH2` - Aldehyde dehydrogenase 2
- `GABA` - Gamma-aminobutyric acid
- `DHM` - Dihydromyricetin
- `mg/kg` - Milligrams per kilogram
- `NAD+` - Nicotinamide adenine dinucleotide
- `RCT` - Randomized Controlled Trial

**Important Implementation Notes:**
- Technical terms must be wrapped in single backticks (`) not triple backticks
- Terms will display inline with tooltip on hover
- Keep terms short - ideally single words or abbreviations
- Terms are case-sensitive

### 6. Enhanced List Items

Lists automatically get enhanced styling based on content:

#### Benefit Lists (green background)
```markdown
- ✅ Prevents hangovers
- Benefit: 70% faster recovery
```

#### Warning Lists (amber background)
```markdown
- ⚠️ Don't exceed recommended dosage
- Warning: May interact with medications
```

#### Tip Lists (purple background)
```markdown
- 💡 Take with water for better absorption
- Tip: Combine with electrolytes
```

## Best Practices

1. **Don't Overuse**: Use these elements sparingly for maximum impact
2. **Be Consistent**: Use the same type of callout box for similar information
3. **Keep It Relevant**: Only highlight truly important information
4. **Mobile Friendly**: All elements are responsive and work on mobile

## Examples in Context

```markdown
## How DHM Works

**Key Insight:** DHM is a natural flavonoid that works through two primary mechanisms.

DHM enhances `ADH` and `ALDH` enzyme activity, helping your liver process alcohol **70% faster** than normal. Studies show that a dose of **300mg** taken before drinking can significantly reduce hangover symptoms.

**Pro Tip:** For best results, take DHM 30-60 minutes before your first drink.

---

## Recommended Products

**Product Spotlight: Flyby Recovery** - Our top pick with 300mg DHM plus milk thistle and vitamin B complex.

### Key Benefits:
- ✅ Clinically proven ingredients
- ✅ Third-party tested for purity
- ✅ Made in USA facilities

**Warning:** Always consult with a healthcare provider before starting any new supplement regimen.
```

## Future Enhancements

Coming soon:
- Interactive tabs for comparisons
- Collapsible FAQ sections
- Progress indicators for guides
- Hover cards for research citations