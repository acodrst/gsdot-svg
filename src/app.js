import { Graphviz } from "@hpcc-js/wasm-graphviz";
import { select } from "d3";
async function gsdot_svg(dot_lines,dot_head,div) {
  const dot=dot_head=='default'?`digraph {
    esep=".20" 
    overlap=false 
    splines=true 
    charset="utf-8"
    graph [fontname="Arial"] 
    edge [penwidth="2" arrowsize="0.5" arrowtail="vee" arrowhead="vee" color="#bbbbbb" fontname="Arial"]
    node [penwidth="2" margin=".1,0" fontname="Arial"]\n${Object.values(dot_lines).join("\n")}\n}`:
    `${dot_head}\n ${Object.values(dot_lines).join("\n")}\n}`; 
  const graphviz = await Graphviz.load();
  document.getElementById(div).innerHTML= graphviz.neato(dot)
  const gr = select(`#${div} svg`);
  gr.selectAll(".node")
    .each(function () {
      const node = select(this);
   if (node.attr("class").includes("datastores")) {
        const pl = node.selectAll("polyline");
        pl.attr("stroke-dasharray", "3,3");
      }
      if (
        node.attr("class").includes("transform") ||
        node.attr("class").includes("process")
      ) {
        const bbox = node.node().getBBox();
        const bar = node.attr("class").includes("transform") ? "3,0" : "3,3";
        node.append("line")
          .attr("x1", bbox.x)
          .attr("y1", bbox.y + 17)
          .attr("x2", bbox.x + bbox.width)
          .attr("y2", bbox.y + 17)
          .attr("stroke-dasharray", bar)
          .attr("stroke", "#33bbee")
          .attr("stroke-width", "2px");
        if (node.attr("class").includes("zoomable")) {
          node.append("circle")
            .attr("cx", bbox.x + 1)
            .attr("cy", bbox.y + 1)
            .attr("r", "3")
            .attr("stroke", "#ee3377")
            .attr("fill", "#ee3377");
        }
        if (node.attr("class").includes("noteattached")) {
          node.append("circle")
            .attr("cx", bbox.x + bbox.width - 1)
            .attr("cy", bbox.y + 1)
            .attr("r", "3")
            .attr("stroke", "#ee7733")
            .attr("fill", "#ee7733");
        }
        if (node.attr("class").includes("has_subclass")) {
          node.append("circle")
            .attr("cx", bbox.x + bbox.width - 1)
            .attr("cy", bbox.y + bbox.height - 1)
            .attr("r", "3")
            .attr("stroke", "#0077bb")
            .attr("fill", "#0077bb");
        }
      }
    });
}
export { gsdot_svg }
