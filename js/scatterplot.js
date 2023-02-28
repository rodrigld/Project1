class Scatterplot {

  /**
   * Class constructor with basic chart configuration
   * @param {Object}
   * @param {Array}
   */
  constructor(_config, _data) {
    this.config = {
      parentElement: _config.parentElement,
      containerWidth: _config.containerWidth || 600,
      containerHeight: _config.containerHeight || 300,
      margin: _config.margin || {top: 25, right: 20, bottom: 20, left: 35},
      tooltipPadding: _config.tooltipPadding || 15
    }
    this.data = _data;
    this.initVis();
  }
  
  /**
   * We initialize scales/axes and append static elements, such as axis titles.
   */
  initVis() {
    let vis = this;

    // Calculate inner chart size. Margin specifies the space around the actual chart.
    vis.width = vis.config.containerWidth - vis.config.margin.left - vis.config.margin.right;
    vis.height = vis.config.containerHeight - vis.config.margin.top - vis.config.margin.bottom;

    // Initialize scales
    vis.colorScale = d3.scaleOrdinal()
        .range(['#9A6C96', '#000000']) // light green to dark green
        .domain(['0','1']);

    vis.xScale = d3.scaleSymlog()
        .range([0, vis.width]);


    vis.yScale = d3.scaleSymlog()
        .range([vis.height, 0]);

    // Initialize axes
    vis.xAxis = d3.axisBottom(vis.xScale)
        .ticks(6)
        .tickSize(-vis.height - 10)
        .tickPadding(10);
        

    vis.yAxis = d3.axisLeft(vis.yScale)
        .ticks(6)
        .tickSize(-vis.width - 10)
        .tickPadding(-20)
        .tickFormat(d3.format("s"));

    // Define size of SVG drawing area
    vis.svg = d3.select(vis.config.parentElement)
        .attr('width', vis.config.containerWidth+20)
        .attr('height', vis.config.containerHeight);

      
  
    // Append group element that will contain our actual chart 
    // and position it according to the given margin config
    vis.chart = vis.svg.append('g')
        .attr('transform', `translate(${vis.config.margin.left},${vis.config.margin.top})`);

    // Append empty x-axis group and move it to the bottom of the chart
    vis.xAxisG = vis.chart.append('g')
        .attr('class', 'axis x-axis')
        .attr('transform', `translate(0,${vis.height})`);
    
    // Append y-axis group
    vis.yAxisG = vis.chart.append('g')
        .attr('class', 'axis y-axis');

    // Append both axis titles
    vis.chart.append('text')
        .attr('class', 'axis-title')
        .attr('y', vis.height - 15)
        .attr('x', vis.width + 10)
        .attr('dy', '.71em')
        .style('text-anchor', 'end')
        .text('Radius (Earth Radius)');

    vis.svg.append('text')
        .attr('class', 'axis-title')
        .attr('x', 0)
        .attr('y', 0)
        .attr('dy', '.71em')
        .text('Mass (Earth Mass)');


  }

  /**
   * Prepare the data and scales before we render it.
   */
  updateVis() {
    let vis = this;
    
    // Specificy accessor functions
    vis.colorValue = d => d.difficulty;
    vis.xValue = d => d.radius;
    vis.yValue = d => d.pl_mass;

    // Set the scale input domains
    vis.xScale.domain(d3.extent(vis.data, vis.xValue));
    vis.yScale.domain(d3.extent(vis.data, vis.yValue));

    vis.renderVis();
    console.log(vis.data)

  }

  /**
   * Bind data to visual elements.
   */
  renderVis() {
    //console.log(function(d) {return vis.yScale(d.pl_mass);)
    let vis = this;
    
    // Add circles
    const circles = vis.chart.selectAll('.point')
        .data(vis.data, d => d.radius)
      .join('circle')
        .attr('class', 'point')
        .attr('r', 4)
        .attr('cy', d => vis.yScale(vis.yValue(d)))
        .attr('cx', d => vis.xScale(vis.xValue(d)))
        .attr('fill', d => vis.colorScale(d.solar_system));
console.log("##################")


        //console.log(vis.data.filter(d => d.solar_system >0))
        console.log(vis.data.filter(d => d.solar_system > 0))


        const labels = vis.svg.selectAll('text')
        .data(vis.data.filter(d => d.solar_system >0))
      .enter()
        .append('text')
        .attr('x', d => vis.xScale(vis.xValue(d))+30)
        .attr('y',d => vis.yScale(vis.yValue(d))+10)
        .text(d => d.pl_name)
        .style("font-size", "12px");

        //Text anchor
        //Earth should be 1,1
    // Tooltip event listeners
    circles
        .on('mouseover', (event,d) => {
          console.log("Epic")
          d3.select('#tooltipscatter')
            .style('display', 'block')
            .style('left', (event.pageX + vis.config.tooltipPadding) + 'px')   
            .style('top', (event.pageY + vis.config.tooltipPadding) + 'px')
            .html(`
              <div class="tooltip-title">${d.trail}</div>
              <div><i>${d.radius}</i></div>
              <ul>
                <li>${d.pl_mass} km, ~${d.time} hours</li>
                <li>${d.pl_name}</li>
                <li>${d.season}</li>
              </ul>
            `);
        })
        .on('mouseleave', () => {
          d3.select('#tooltipscatter').style('display', 'none');
        });
    
    // Update the axes/gridlines
    // We use the second .call() to remove the axis and just show gridfs
    vis.xAxisG
        .call(vis.xAxis)
        .call(g => g.select('.domain').remove());

    vis.yAxisG
        .call(vis.yAxis)
        .call(g => g.select('.domain').remove())
  }
}