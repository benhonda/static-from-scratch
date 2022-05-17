
## Layouts/

Contains Nunjucks layouts.

### Naming

base.njk -> Outermost template (all subtemplates reference this)
base-header.njk -> Outermost header (all subtemplates would use this)
{subtemplate}-base.njk -> Base layout for {subtemplate}
{subtemplate}-header.njk -> Header for {subtemplate}


