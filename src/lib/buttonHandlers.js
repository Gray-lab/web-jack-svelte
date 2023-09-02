
export function onKeyDown(e) {
    if (running) e.preventDefault();
    console.log(e.key);
    if (e.key.length === 1) {
        currentKey = e.key.charCodeAt(0);
    } else if (e.key in input_map) {
        currentKey = input_map[e.key];
    }
}

export function onKeyUp(e) {
    if (running) e.preventDefault();
    currentKey = 0;
}

export function onStepClick() {
    runLoop(1);
    memArray = memArray; // assignment triggers reactive update in Svelte
}

export function onRunClick() {
    running = true;
    interval = setInterval(() => {
        requestAnimationFrame(runLoopCallback);
        const finished = program.finished;
        if (finished) {
            running = false;
            clearInterval(interval);
            memArray = memArray;
        }
    }, 0);
}

export function onStopClick() {
    running = false;
    clearInterval(interval);
    memArray = memArray;
}

export function onEndClick() {
    running = false;
    programLoaded = false;
    program.end();
    clearInterval(interval);
    memArray = memArray;
}

export function onCompileClick() {
    compiled = true;
    const res = compiler.compile_main($jackcodeStore);
    bytecodeStore.set(res);
}

export function onLoadClick() {
    program = new Program($bytecodeStore, ctx, canvas);
    programLoaded = true;
    ramSize = program.ram_size();
    ramPointer = program.ram();
    memArray = new Int16Array(wasmInstance.memory.buffer, ramPointer, ramSize);
}
