import { Graphviz } from "@hpcc-js/wasm-graphviz";
import { select, zoom } from "d3";
const ids = new Set();
const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
function rn() {
  let id;
  const one = chars[Math.floor(Math.random() * 26)];
  const rest = () => chars[Math.floor(Math.random() * 36)];
  do id = one + rest() + rest(); while (ids.has(id));
  ids.add(id);
  return id;
}
async function gsdot_svg(dot_lines, dot_head, kind) {
  const head = `digraph {
    esep=".20" 
    overlap=false 
    splines=true 
    charset="utf-8"
    graph [fontname="Arial"] 
    edge [penwidth="2" arrowsize="0.5" arrowtail="vee" arrowhead="vee" color="#bbbbbb" fontname="Arial"]
    node [penwidth="2" margin=".1,0" fontname="Arial"]\n`
  const key = {
    item:`${head}
    "agent" [id="${rn()}" color="#009988" shape="rectangle" class="agents" label="agent" ]
    "process" [id="${rn()}" color="#33bbee"  shape="rectangle" style="rounded" 
    class="processes zoomable noteattached has_subclass" label="0.1
process "]
"agent" -> "process"\n}`,
    process: `${head}"process" [id="${rn()}" color="#33bbee"  shape="rectangle" style="rounded" 
    class="processes zoomnotable notenotattached" label="0.1
:: processes "]\n}`,
    datastore: `${head}"datastore" [id="${rn()}" color="#cc3311" shape="record" class="datastores" label="<f0> R2|<f1> :: datastores "]}`,
    transform: `${head}"transform" [id="${rn()}" color="#33bbee"  shape="rectangle" style="rounded" 
      class="transforms zoomnotable notenotattached" label="0.2
:: transforms "]\n}`,
    agent: `${head}"agents" [id="${rn()}" color="#009988" shape="rectangle" class="agents" label=":: agents" ]\n}`,
    location: `${head}"locations" [color="#cc3311" shape="record" class="locations" label="<f0> R1|<f1> :: locations "]\n}`
  }
  const dot = dot_head == "default"
    ? `${head}
    ${Object.values(dot_lines).join("\n")
    }\n}`
    : `${dot_head}\n ${Object.values(dot_lines).join("\n")}\n}`;
  const graphviz = await Graphviz.load();
  const kind_html= kind == 'key' ? `<table>
<tr><td>${graphviz.neato(key.process)}</td><td>Modifies data form and location</td>
<tr><td>${graphviz.neato(key.transform)}</td><td>Modifies material form and location</td>
<tr><td>${graphviz.neato(key.agent)}</td><td>Source or sink of data or operational control</td>
<tr><td>${graphviz.neato(key.location)}</td><td>Materials at rest</td>
<tr><td>${graphviz.neato(key.datastore)}</td><td></div><div class="key_txt">Data at rest</td>
<tr><td>${graphviz.neato(key.item)}</td><td>:: forward (|| back both)- Orange :: note || :: narrative - Magenta can zoom - Blue :: subclass_of</td>
<tr><td>  \` (backtick)</td><td>Redraw graph when entering Graph Stack Format text</td>
<tr><td>📥️</td><td>Import Graph Stack Text</td>
<tr><td>📤️</td><td>Export Graph Stack Text</td>
<tr><td>💾</td><td>Save Key as HTML or Map as SVG</td>
</table>`
    : graphviz.neato(dot)
    let kind_html_split=kind_html.split('id="graph0"')
    let html=''
    for (let i=0;i<kind_html_split.length-1;i++){
      html+=`${kind_html_split[i]}id="${rn()}"`
    }
    html+=kind_html_split.slice(-1)
  document.getElementById(kind).innerHTML =html
  let gr
  if (kind == 'map') {
    gr = select(`#${kind} svg`)
    const zm = zoom()
      .on("zoom", zoomed);
    function zoomed(e) {
      gr.attr("transform", e.transform);
    }
    select(`#${kind}`).call(zm);
  }
  else gr = select(`#${kind}`)
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
  return gr.node().outerHTML;
}
export { gsdot_svg };