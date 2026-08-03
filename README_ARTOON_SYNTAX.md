I have carefully investigated the verified source of truth in `Core Invariants/SYNTAX-REFERENCE.md` and created a highly detailed, comprehensive Arabic guide named `ARTOON-SYNTAX-GUIDE-AR.md`.

This guide details exactly the syntax conventions supported by `@artoon/parser` and `@artoon/serializer`, including:
- Document Directionality (`>.` and `<.`)
- Line components (`p`, `t1`-`t6`, `q`, `pre`)
- Inline formatting (`s`, `e`, `u`, `d`, `mark`, `sub`, `sup`) and combined modifiers (`[s+e:: ...]`)
- Inline components (`a`, `img`, `video`, `audio`, `file`, `c`, `time`, `abbr`)
- Blocks (`<code:lang>.` ... `.<code>`, `<meta>.`)
- Lists (`ul::`, `ol::`, `dl::` with `li::`, `dt::`, `dd::` and nested items `-li::`)
- Tables (`table::` with `th::`, `tr::` and `;` delimiters)
- Compound components (`figure::`, `details::` and their child sub-components `>.-`)
- Separators (`hr`, `br`, `wbr`) and Comments (`>.:::`)

It lists the explicit parsing invariants (such as using `;` instead of `|`, and requiring no direction markers inside list items or table rows).
