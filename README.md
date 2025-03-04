Converts Graph Stack Text dot model to SVG

ES module that exports a single function, gsdot_svg.

Pass Dot lines, header, and ID of div to layout and draw SVG.

Dot lines are just Graphviz lines formatted with classes via model_to_dots.
The header can include Graphviz options for nodes, edges, and graph.  If "default" is passed as a value, this value is used:

```{.js}
digraph {
    esep=".20"
    overlap=false
    splines=true
    charset="utf-8"
    graph [fontname="Arial"]
    edge [penwidth="2" arrowsize="0.5" arrowtail="vee" arrowhead="vee" color="#bbbbbb" fontname="Arial"]
    node [penwidth="2" margin=".1,0" fontname="Arial"]
```

Licenses for D3 and hpcc-js/wasm-graphviz are  in dist
 
