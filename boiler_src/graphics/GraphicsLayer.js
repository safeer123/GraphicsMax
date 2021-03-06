import { SpatialHash } from './SpatialHash'
import { Utils } from './AppUtils'
import { Geometry } from './ObjectFactory'
import { Canvas2D } from './ShaderFactory'

// Base Layer
export class Base {

    // Construct canvas and webgl context
    constructor(wrapperElem, canvasObj) {
        if (!wrapperElem) console.error("Canvas Wrapper Element is unset");

        this.wrapperElem = wrapperElem;

        this.canvas = canvasObj.canvas;
        this.gl = canvasObj.gl;
        this.shaderFac = canvasObj.shaderFac;

        this.buffers = null;

        this.objectList = [];

        this.hashLookup = new SpatialHash.Lookup(50, 50);
    }

    updateBgLineBuffer() {
        if (!this.timeLabels) return;

        var gl = this.gl;

        if (!this.buffers) {
            this.buffers = {};
        }
        else {
            if (this.buffers.bgLineBuffer && this.buffers.bgLineBuffer.buffer) {
                gl.deleteBuffer(this.buffers.bgLineBuffer.buffer);
            }
        }

        this.buffers.bgLineBuffer = Utils.createBufferObj();
        this.buffers.bgLineBuffer.buffer = gl.createBuffer();

        this.bgLinesList = [];

        var lineColor = [30 / 256, 30 / 256, 30 / 256, 1];
        for (let i in this.timeLabels) {
            var newLine = new Geometry.LineSegment(this.timeLabels[i].x, 0, this.timeLabels[i].x, this.canvas.height);
            newLine.color = lineColor;
            this.bgLinesList.push(newLine);
        }

        var bgLineBuffer = this.buffers.bgLineBuffer;

        for (let i in this.bgLinesList) {
            var arrayObj = this.bgLinesList[i].toArrayBuffer();
            bgLineBuffer.data.push.apply(bgLineBuffer.data, arrayObj.lineData);
            bgLineBuffer.numItems += arrayObj.lineItems;
        }

        gl.bindBuffer(gl.ARRAY_BUFFER, bgLineBuffer.buffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(bgLineBuffer.data), gl.STATIC_DRAW);
    }

    clear() {
        var gl = this.gl;
        if (gl) {
            gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);
        }
        if (this.canvas2D) {
            this.canvas2D.ctx.clearRect(0, 0, this.canvas2D.canvas.width, this.canvas2D.canvas.height);
        }
    }

    onResize()
    {
        this.clear();
        this.canvas.width = this.wrapperElem.clientWidth;
        this.canvas.height = this.wrapperElem.clientHeight;
        this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
        this.canvas2D.canvas.width = this.wrapperElem.clientWidth;
        this.canvas2D.canvas.height = this.wrapperElem.clientHeight;
        if(this.bgLineCount)
        {
            delete(this.bgLineCount);
        }
    }

    addCanvas2D() {
        this.canvas2D = new Canvas2D(this.wrapperElem);
    }

    setData(inputForScenario, scenario) {
        this.data = {};
        this.data.inputForScenario = inputForScenario;
        this.data.scenario = scenario;
    }

    setTimeLabels(timeLabels) {
        this.timeLabels = timeLabels;
    }
}


