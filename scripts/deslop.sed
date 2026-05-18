# Mechanical slop -> DESIGN.md token codemod (step 3).
# Substring rules, prefix-agnostic: a `hover:`/`focus:`/`md:` prefix is left
# intact because only the `prop-family-shade` substring is rewritten.
# Targets contain no family/shade substrings, so single-pass is safe.
# Semantic fixes (number-circles, card-stack->brief) are steps 4-7, not here.

# ---- neutral (gray/slate/zinc/neutral/stone) ----
s/\b(bg)-(gray|slate|zinc|neutral|stone)-(50)\b/\1-paper/g
s/\b(bg)-(gray|slate|zinc|neutral|stone)-(100)\b/\1-surface/g
s/\b(bg)-(gray|slate|zinc|neutral|stone)-(200|300|400)\b/\1-hair/g
s/\b(bg)-(gray|slate|zinc|neutral|stone)-(700|800|900|950)\b/\1-ink/g
s/\b(text)-(gray|slate|zinc|neutral|stone)-(700|800|900|950)\b/\1-ink/g
s/\b(text)-(gray|slate|zinc|neutral|stone)-(500|600)\b/\1-muted/g
s/\b(text)-(gray|slate|zinc|neutral|stone)-(100|300|400)\b/\1-faint/g
s/\b(border|divide|ring|ring-offset|outline)-(gray|slate|zinc|neutral|stone)-([0-9]{2,3})\b/\1-hair/g
s/\b(fill|stroke)-(gray|slate|zinc|neutral|stone)-([0-9]{2,3})\b/\1-faint/g
s/\b(placeholder)-(gray|slate|zinc|neutral|stone)-([0-9]{2,3})\b/\1-faint/g
s/\b(divide)-(gray|slate|zinc|neutral|stone)-([0-9]{2,3})\b/\1-hair/g

# ---- brand slop (blue/indigo/sky/cyan) -> evergreen ----
s/\b(bg)-(blue|indigo|sky|cyan)-(50|100)\b/\1-evergreen-soft/g
s/\b(bg)-(blue|indigo|sky|cyan)-(700|800|900)\b/\1-evergreen-deep/g
s/\b(bg)-(blue|indigo|sky|cyan)-([0-9]{2,3})\b/\1-evergreen/g
s/\b(text)-(blue|indigo|sky|cyan)-(800|900)\b/\1-evergreen-deep/g
s/\b(text)-(blue|indigo|sky|cyan)-([0-9]{2,3})\b/\1-evergreen/g
s/\b(border|ring|ring-offset|outline|divide)-(blue|indigo|sky|cyan)-([0-9]{2,3})\b/\1-evergreen/g
s/\b(fill|stroke)-(blue|indigo|sky|cyan)-([0-9]{2,3})\b/\1-evergreen/g

# ---- success (green/emerald/teal/lime) -> evergreen ----
s/\b(bg)-(green|emerald|teal|lime)-(50|100)\b/\1-evergreen-soft/g
s/\b(bg)-(green|emerald|teal|lime)-(700|800|900)\b/\1-evergreen-deep/g
s/\b(bg)-(green|emerald|teal|lime)-([0-9]{2,3})\b/\1-evergreen/g
s/\b(text)-(green|emerald|teal|lime)-(800|900)\b/\1-evergreen-deep/g
s/\b(text)-(green|emerald|teal|lime)-([0-9]{2,3})\b/\1-evergreen/g
s/\b(border|ring|divide|outline)-(green|emerald|teal|lime)-([0-9]{2,3})\b/\1-evergreen/g
s/\b(fill|stroke)-(green|emerald|teal|lime)-([0-9]{2,3})\b/\1-evergreen/g

# ---- attention (amber/yellow/orange) -> amber ----
s/\b(bg)-(amber|yellow|orange)-(50|100)\b/\1-amber-soft/g
s/\b(bg)-(amber|yellow|orange)-([0-9]{2,3})\b/\1-amber/g
s/\b(text)-(amber|yellow|orange)-(600|700|800|900)\b/\1-amber-deep/g
s/\b(text)-(amber|yellow|orange)-([0-9]{2,3})\b/\1-amber/g
s/\b(border|ring|divide|outline)-(amber|yellow|orange)-([0-9]{2,3})\b/\1-amber/g
s/\b(fill|stroke)-(amber|yellow|orange)-([0-9]{2,3})\b/\1-amber/g

# ---- error (red/rose) -> brick (soft callout sits on raised) ----
s/\b(bg)-(red|rose)-(50|100)\b/\1-raised/g
s/\b(bg)-(red|rose)-([0-9]{2,3})\b/\1-brick/g
s/\b(text)-(red|rose)-([0-9]{2,3})\b/\1-brick/g
s/\b(border|ring|divide|outline)-(red|rose)-([0-9]{2,3})\b/\1-brick/g
s/\b(fill|stroke)-(red|rose)-([0-9]{2,3})\b/\1-brick/g

# ---- white/black surfaces -> raised/ink (text-white stays: it is the
#      correct label color on evergreen/amber/brick fills per DESIGN.md) ----
s/\bbg-white\b/bg-raised/g
s/\bbg-black\b/bg-ink/g

# ---- variety (purple/violet/fuchsia) -> evergreen (no system purple) ----
s/\b(bg)-(purple|violet|fuchsia)-(50|100)\b/\1-evergreen-soft/g
s/\b(bg)-(purple|violet|fuchsia)-([0-9]{2,3})\b/\1-evergreen/g
s/\b(text)-(purple|violet|fuchsia)-(800|900)\b/\1-evergreen-deep/g
s/\b(text)-(purple|violet|fuchsia)-([0-9]{2,3})\b/\1-evergreen/g
s/\b(border|ring|divide|outline)-(purple|violet|fuchsia)-([0-9]{2,3})\b/\1-evergreen/g
s/\b(fill|stroke)-(purple|violet|fuchsia)-([0-9]{2,3})\b/\1-evergreen/g
