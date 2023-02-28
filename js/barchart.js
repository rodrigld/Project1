class Barchart {

  /**
   * Class constructor with basic chart configuration
   * @param {Object}
   * @param {Array}
   */
  constructor(_config, _data, _position, _rotate_xaxis, _dispatcher, _chart_num, _x_lable, _padding) {
    // Configuration object with defaults
    this.config = {
      parentElement: _config.parentElement,
      //710
      containerWidth: _config.containerWidth || 600,
      //200
      containerHeight: _config.containerHeight || 300,
      margin: _config.margin || {top: 10, right: 5, bottom: 25, left: 30},
      reverseOrder: _config.reverseOrder || false,
      tooltipPadding: _config.tooltipPadding || 15,
      position: _position,
      rotate_xaxis: _config.rotate_xaxis || false,
      padding: _padding ||70
      
    }
    this.x=  this.findXPos(this.config.position);
    this.y=  this.findYPos(this.config.position);
    this.data = _data;
    this.rotate_xaxis = _rotate_xaxis;
    this.dispatcher = _dispatcher;
    this.chart_num = _chart_num;
    this.x_lable = _x_lable;
    
    this.initVis();

  }
  

  findYPos(position){
return position * this.config.margin.top;
  }

  findXPos(position){
    return this.config.margin.left;
  }

  /**
   * Initialize scales/axes and append static elements, such as axis titles
   */
  initVis() {

    let vis = this;

    // Calculate inner chart size. Margin specifies the space around the actual chart.
    vis.width = vis.config.containerWidth - vis.config.margin.left - (2*vis.config.margin.right);
    vis.height = vis.config.containerHeight - vis.config.margin.top - (5*vis.config.margin.bottom);

    // Initialize scales and axes
    // Important: we flip array elements in the y output range to position the rectangles correctly
    vis.yScale = d3.scaleLinear()
        .range([vis.height, 0]) 

    vis.xScale = d3.scaleBand()
        .range([0, vis.width])
        .paddingInner(0.2);

    vis.xAxis = d3.axisBottom(vis.xScale)

        .tickSizeOuter(0);
        //.tickFormat(x => `(${x.replace(' ','\n')})`);
    vis.yAxis = d3.axisLeft(vis.yScale)
        .tickSizeOuter(10)
        .ticks(6);
        //.tickFormat(d3.formatPrefix('.0s', 1e3)); ; // Format y-axis ticks as millions
//ADJUST LEFT MARGIN


    // Define size of SVG drawing area
    vis.svg = d3.select(vis.config.parentElement)
        .attr('width', vis.config.containerWidth)
        .attr('height', vis.config.containerHeight);
      

    // SVG Group containing the actual chart; D3 margin convention
    vis.chart = vis.svg.append('g')
        .attr('transform', `translate(${vis.config.margin.left},${vis.config.margin.top})`);
    
    vis.svg.append("text")
      .attr("class", "x label")
      
      .attr("x", vis.width/2)
      .attr("y", vis.height+vis.config.padding)
      .style("text-anchor", "middle")
      .text(vis.x_lable);


    // Append empty x-axis group and move it to the bottom of the chart
    vis.xAxisG = vis.chart.append('g')
        .attr('class', 'axis x-axis')
        .attr('transform', `translate(0,${vis.height})`);
        
    
    // Append y-axis group 
    vis.yAxisG = vis.chart.append('g')
        .attr('class', 'axis y-axis')
        .attr('transform', `translate(10,0)`);
        ;

       // var line = d3.line()   .x(function(d) { return this.xScale(d.x)})  .y(function(d) { return this.yScale(d.y)})   
        
  }


  
  /**
   * Prepare data and scales before we render it
   */
  updateVis() {
    let vis = this;

    const aggregatedDataMap = d3.rollups(vis.data, v => v.length, d => d.x);
    vis.aggregatedData = Array.from(aggregatedDataMap, ([key, count]) => ({ key, count }));


    // Reverse column order depending on user selection
    if (vis.config.reverseOrder) {
      vis.data.reverse();
    }

    // Specificy x- and y-accessor functions
    vis.xValue = d => d.x;
    vis.yValue = d => d.y;
    // Set the scale input domains
    vis.xScale.domain(vis.data.map(vis.xValue));
    vis.yScale.domain([0, d3.max(vis.data, vis.yValue)]);

    vis.renderVis();

  }

  /**
   * Bind data to visual elements
   */
  renderVis() {
    let vis = this;
    
    if(this.rotate_xaxis)
    {
      vis.xAxisG
      .call(vis.xAxis)
      .selectAll('text')
      .style('text-anchor', 'start')
        .attr('transform', 'rotate(36)');
    }
    
    // Add rectangles

    
    let bars = vis.chart.selectAll('.bar')
        .data(vis.data, vis.xValue)
      .join('rect')
      .on('click', function(event, d) {
        // Check if current category is active and toggle class
        const isActive = d3.select(this).classed('active');
        d3.select(this).classed('active', !isActive);
       
        // Get the names of all active/filtered categories
        const selectedCategories = vis.chart.selectAll('.bar.active').data().map(k => k.x);
       
        // Trigger filter event and pass array with the selected category names
        if(vis.chart_num==0)
        {
          vis.dispatcher.call('filterCategories',event,selectedCategories);

        }
        else if (vis.chart_num==1)
        {
          vis.dispatcher.call('filterPlanets',event,selectedCategories);

        }
      });

    
    bars.style('opacity', 0.5)
      .transition().duration(1000)
        .style('opacity', 1)
        .attr('class', 'bar')
        .attr('x', d => vis.xScale(vis.xValue(d)))
        .attr('width', vis.xScale.bandwidth()-10)
        .attr('height', d => vis.height - vis.yScale(vis.yValue(d)))
        .attr('y', d => vis.yScale(vis.yValue(d)))
        .attr('fill', '#9A6C96')
    
    // Tooltip event listeners
    bars
        .on('mouseover', (event,d) => {
          d3.select('#tooltip')
            .style('opacity', 1)
            // Format number with million and thousand separator
            .html(`<div class="tooltip-label">Number of exoplanets.</div>${d3.format(',')(d.y)}`);
        })
        .on('mousemove', (event) => {
          d3.select('#tooltip')
            .style('left', (event.pageX + vis.config.tooltipPadding) + 'px')   
            .style('top', (event.pageY + vis.config.tooltipPadding) + 'px')
        })
        .on('mouseleave', () => {
          d3.select('#tooltip').style('opacity', 0);
        });

    // Update axes
    vis.xAxisG
        .transition().duration(1000)
        .call(vis.xAxis);

    vis.yAxisG.call(vis.yAxis);
  }
}

