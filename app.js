// System layers visualization with D3.js
document.addEventListener('DOMContentLoaded', function() {
    createSystemVisualization();
});

function createSystemVisualization() {
    const container = d3.select('#system-visualization');
    const width = container.node().getBoundingClientRect().width;
    const height = 600;

    const svg = container.append('svg')
        .attr('width', width)
        .attr('height', height);

    // Define layers
    const layers = [
        { id: 'business', name: 'Business Layer', color: '#00ff88', y: 50 },
        { id: 'product', name: 'Product Layer', color: '#00ddaa', y: 140 },
        { id: 'application', name: 'Application Layer', color: '#00bbcc', y: 230 },
        { id: 'data', name: 'Data Layer', color: '#0099ee', y: 320 },
        { id: 'infrastructure', name: 'Infrastructure Layer', color: '#0077ff', y: 410 },
        { id: 'operations', name: 'Operations Layer', color: '#0055dd', y: 500 }
    ];

    const layerHeight = 60;
    const layerPadding = 20;
    const centerX = width / 2;

    // Create gradient definitions
    const defs = svg.append('defs');

    layers.forEach(layer => {
        const gradient = defs.append('linearGradient')
            .attr('id', `gradient-${layer.id}`)
            .attr('x1', '0%')
            .attr('x2', '100%');

        gradient.append('stop')
            .attr('offset', '0%')
            .attr('stop-color', layer.color)
            .attr('stop-opacity', 0.3);

        gradient.append('stop')
            .attr('offset', '50%')
            .attr('stop-color', layer.color)
            .attr('stop-opacity', 0.6);

        gradient.append('stop')
            .attr('offset', '100%')
            .attr('stop-color', layer.color)
            .attr('stop-opacity', 0.3);
    });

    // Add glow filter
    const filter = defs.append('filter')
        .attr('id', 'glow');

    filter.append('feGaussianBlur')
        .attr('stdDeviation', '3')
        .attr('result', 'coloredBlur');

    const feMerge = filter.append('feMerge');
    feMerge.append('feMergeNode').attr('in', 'coloredBlur');
    feMerge.append('feMergeNode').attr('in', 'SourceGraphic');

    // Create layer groups
    const layerGroups = svg.selectAll('.layer-group')
        .data(layers)
        .enter()
        .append('g')
        .attr('class', 'layer-group')
        .attr('transform', d => `translate(0, ${d.y})`);

    // Draw layer rectangles
    const layerWidth = width * 0.7;
    const layerX = (width - layerWidth) / 2;

    layerGroups.append('rect')
        .attr('class', 'layer-rect')
        .attr('x', layerX)
        .attr('width', layerWidth)
        .attr('height', layerHeight)
        .attr('rx', 8)
        .attr('fill', d => `url(#gradient-${d.id})`)
        .attr('stroke', d => d.color)
        .attr('stroke-width', 2)
        .attr('opacity', 0)
        .transition()
        .duration(1000)
        .delay((d, i) => i * 100)
        .attr('opacity', 1);

    // Add layer labels
    layerGroups.append('text')
        .attr('class', 'layer-label')
        .attr('x', centerX)
        .attr('y', layerHeight / 2)
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .text(d => d.name)
        .attr('opacity', 0)
        .transition()
        .duration(1000)
        .delay((d, i) => i * 100 + 300)
        .attr('opacity', 1);

    // Add interaction nodes on each layer
    const nodesPerLayer = 5;
    const nodeData = [];

    layers.forEach((layer, layerIndex) => {
        for (let i = 0; i < nodesPerLayer; i++) {
            nodeData.push({
                layer: layer.id,
                layerIndex: layerIndex,
                x: layerX + (i + 1) * (layerWidth / (nodesPerLayer + 1)),
                y: layer.y + layerHeight / 2,
                color: layer.color,
                nodeIndex: i
            });
        }
    });

    // Draw interaction nodes
    const nodes = svg.selectAll('.node-circle')
        .data(nodeData)
        .enter()
        .append('circle')
        .attr('class', 'node-circle')
        .attr('cx', d => d.x)
        .attr('cy', d => d.y)
        .attr('r', 0)
        .attr('fill', d => d.color)
        .attr('filter', 'url(#glow)')
        .transition()
        .duration(800)
        .delay((d, i) => 1000 + i * 20)
        .attr('r', 4);

    // Animate nodes with pulsing effect
    function pulseNodes() {
        svg.selectAll('.node-circle')
            .transition()
            .duration(2000)
            .attr('r', 6)
            .transition()
            .duration(2000)
            .attr('r', 4)
            .on('end', pulseNodes);
    }

    setTimeout(pulseNodes, 2000);

    // Create feedback loops
    const feedbackLoops = [
        { from: 0, to: 1, curve: 0.3 },
        { from: 1, to: 2, curve: 0.3 },
        { from: 2, to: 3, curve: 0.3 },
        { from: 3, to: 4, curve: 0.3 },
        { from: 4, to: 5, curve: 0.3 },
        { from: 2, to: 0, curve: -0.5 },
        { from: 3, to: 1, curve: -0.5 },
        { from: 5, to: 0, curve: -0.8 },
    ];

    const loopGroup = svg.append('g').attr('class', 'feedback-loops');

    feedbackLoops.forEach((loop, index) => {
        const fromLayer = layers[loop.from];
        const toLayer = layers[loop.to];

        const x1 = layerX + layerWidth + 20;
        const y1 = fromLayer.y + layerHeight / 2;
        const x2 = layerX + layerWidth + 20;
        const y2 = toLayer.y + layerHeight / 2;

        const curveOffset = loop.curve * 100;

        const path = d3.path();
        path.moveTo(x1, y1);
        path.bezierCurveTo(
            x1 + curveOffset, y1,
            x2 + curveOffset, y2,
            x2, y2
        );

        loopGroup.append('path')
            .attr('class', 'feedback-loop')
            .attr('d', path.toString())
            .attr('stroke-dasharray', '5,5')
            .attr('stroke-dashoffset', 0)
            .attr('opacity', 0)
            .transition()
            .duration(1000)
            .delay(2000 + index * 200)
            .attr('opacity', 0.6);

        // Animate dashing
        setTimeout(() => {
            loopGroup.selectAll('.feedback-loop')
                .transition()
                .duration(3000)
                .ease(d3.easeLinear)
                .attr('stroke-dashoffset', -10)
                .on('end', function repeat() {
                    d3.select(this)
                        .transition()
                        .duration(3000)
                        .ease(d3.easeLinear)
                        .attr('stroke-dashoffset', -10)
                        .on('end', repeat);
                });
        }, 3000);

        // Add arrow at the end
        const arrowSize = 8;
        loopGroup.append('polygon')
            .attr('class', 'feedback-arrow')
            .attr('points', `0,-${arrowSize/2} ${arrowSize},0 0,${arrowSize/2}`)
            .attr('transform', `translate(${x2}, ${y2}) rotate(${loop.from < loop.to ? 90 : -90})`)
            .attr('opacity', 0)
            .transition()
            .duration(1000)
            .delay(2000 + index * 200)
            .attr('opacity', 0.6);
    });

    // Add data flow particles
    function createDataFlowParticles() {
        const particleGroup = svg.append('g').attr('class', 'data-particles');

        function animateParticle() {
            const randomLayer = Math.floor(Math.random() * layers.length);
            const layer = layers[randomLayer];
            const startX = layerX;
            const endX = layerX + layerWidth;
            const y = layer.y + layerHeight / 2 + (Math.random() - 0.5) * 20;

            particleGroup.append('circle')
                .attr('cx', startX)
                .attr('cy', y)
                .attr('r', 2)
                .attr('fill', layer.color)
                .attr('opacity', 0.8)
                .transition()
                .duration(3000 + Math.random() * 2000)
                .ease(d3.easeLinear)
                .attr('cx', endX)
                .attr('opacity', 0)
                .remove();

            setTimeout(animateParticle, 300 + Math.random() * 700);
        }

        // Start multiple particle streams
        for (let i = 0; i < 5; i++) {
            setTimeout(animateParticle, i * 200);
        }
    }

    setTimeout(createDataFlowParticles, 3000);

    // Add hover effects
    layerGroups
        .on('mouseenter', function(event, d) {
            d3.select(this).select('rect')
                .transition()
                .duration(200)
                .attr('stroke-width', 3)
                .attr('filter', 'url(#glow)');

            d3.select(this).select('text')
                .transition()
                .duration(200)
                .attr('font-size', '16px');
        })
        .on('mouseleave', function(event, d) {
            d3.select(this).select('rect')
                .transition()
                .duration(200)
                .attr('stroke-width', 2)
                .attr('filter', null);

            d3.select(this).select('text')
                .transition()
                .duration(200)
                .attr('font-size', '14px');
        });

    // Add responsive behavior
    window.addEventListener('resize', () => {
        const newWidth = container.node().getBoundingClientRect().width;
        svg.attr('width', newWidth);
        // Could add more responsive updates here
    });
}

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});
