/* tslint:disable */
/* eslint-disable */
/**
*/
export function greet(): void;
/**
* Handler for `console.log` invocations.
*
* If a test is currently running it takes the `args` array and stringifies
* it and appends it to the current output of the test. Otherwise it passes
* the arguments to the original `console.log` function, psased as
* `original`.
* @param {Array<any>} args
*/
export function __wbgtest_console_log(args: Array<any>): void;
/**
* Handler for `console.debug` invocations. See above.
* @param {Array<any>} args
*/
export function __wbgtest_console_debug(args: Array<any>): void;
/**
* Handler for `console.info` invocations. See above.
* @param {Array<any>} args
*/
export function __wbgtest_console_info(args: Array<any>): void;
/**
* Handler for `console.warn` invocations. See above.
* @param {Array<any>} args
*/
export function __wbgtest_console_warn(args: Array<any>): void;
/**
* Handler for `console.error` invocations. See above.
* @param {Array<any>} args
*/
export function __wbgtest_console_error(args: Array<any>): void;
/**
*/
export class Program {
  free(): void;
/**
*
*     * Initializes the program given a set of code and a configuration
*     
* @param {string} input
*/
  constructor(input: string);
/**
*
*     * Execute next bytecode command.
*     * Returns true if display was updated, otherwise returns false.
*     
* @param {number} key
* @returns {boolean}
*/
  step(key: number): boolean;
/**
* @returns {number}
*/
  ram_size(): number;
/**
*
*     * wrapper for Memory.display_size()
*     * returns the length of the display memory array
*     
* @returns {number}
*/
  display_size(): number;
/**
*
*     * Sets the display to value at memory location display_word
*     
* @param {number} value
* @param {number} offset
*/
  set_display(value: number, offset: number): void;
/**
*
*     * wrapper for Memory.ram()
*     * returns a pointer to the start of the ram memory segment
*     
* @returns {number}
*/
  ram(): number;
/**
*
*     * wrapper for Memory.display()
*     * returns a pointer to the start of the display memory segment
*     
* @returns {number}
*/
  display(): number;
/**
*
*     * wrapper for Memory.keyboard()
*     * returns the contents of the keyboard memory segment
*     
* @returns {number}
*/
  keyboard(): number;
/**
*/
  end(): void;
/**
*/
  finished: boolean;
}
/**
* Runtime test harness support instantiated in JS.
*
* The node.js entry script instantiates a `Context` here which is used to
* drive test execution.
*/
export class WasmBindgenTestContext {
  free(): void;
/**
* Creates a new context ready to run tests.
*
* A `Context` is the main structure through which test execution is
* coordinated, and this will collect output and results for all executed
* tests.
*/
  constructor();
/**
* Inform this context about runtime arguments passed to the test
* harness.
*
* Eventually this will be used to support flags, but for now it's just
* used to support test filters.
* @param {any[]} args
*/
  args(args: any[]): void;
/**
* Executes a list of tests, returning a promise representing their
* eventual completion.
*
* This is the main entry point for executing tests. All the tests passed
* in are the JS `Function` object that was plucked off the
* `WebAssembly.Instance` exports list.
*
* The promise returned resolves to either `true` if all tests passed or
* `false` if at least one test failed.
* @param {any[]} tests
* @returns {Promise<any>}
*/
  run(tests: any[]): Promise<any>;
}

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
  readonly memory: WebAssembly.Memory;
  readonly greet: () => void;
  readonly __wbg_program_free: (a: number) => void;
  readonly __wbg_get_program_finished: (a: number) => number;
  readonly __wbg_set_program_finished: (a: number, b: number) => void;
  readonly program_new: (a: number, b: number) => number;
  readonly program_step: (a: number, b: number) => number;
  readonly program_ram_size: (a: number) => number;
  readonly program_display_size: (a: number) => number;
  readonly program_set_display: (a: number, b: number, c: number) => void;
  readonly program_ram: (a: number) => number;
  readonly program_display: (a: number) => number;
  readonly program_keyboard: (a: number) => number;
  readonly program_end: (a: number) => void;
  readonly __wbg_wasmbindgentestcontext_free: (a: number) => void;
  readonly wasmbindgentestcontext_new: () => number;
  readonly wasmbindgentestcontext_args: (a: number, b: number, c: number) => void;
  readonly wasmbindgentestcontext_run: (a: number, b: number, c: number) => number;
  readonly __wbgtest_console_log: (a: number) => void;
  readonly __wbgtest_console_debug: (a: number) => void;
  readonly __wbgtest_console_info: (a: number) => void;
  readonly __wbgtest_console_warn: (a: number) => void;
  readonly __wbgtest_console_error: (a: number) => void;
  readonly __wbindgen_malloc: (a: number, b: number) => number;
  readonly __wbindgen_realloc: (a: number, b: number, c: number, d: number) => number;
  readonly __wbindgen_export_2: WebAssembly.Table;
  readonly _dyn_core__ops__function__FnMut__A____Output___R_as_wasm_bindgen__closure__WasmClosure___describe__invoke__hf71a1f40830d1442: (a: number, b: number, c: number) => void;
  readonly __wbindgen_free: (a: number, b: number, c: number) => void;
  readonly __wbindgen_exn_store: (a: number) => void;
  readonly wasm_bindgen__convert__closures__invoke3_mut__h0687db71c25e9b76: (a: number, b: number, c: number, d: number, e: number) => void;
  readonly wasm_bindgen__convert__closures__invoke2_mut__h0ea87d110024de41: (a: number, b: number, c: number, d: number) => void;
}

export type SyncInitInput = BufferSource | WebAssembly.Module;
/**
* Instantiates the given `module`, which can either be bytes or
* a precompiled `WebAssembly.Module`.
*
* @param {SyncInitInput} module
*
* @returns {InitOutput}
*/
export function initSync(module: SyncInitInput): InitOutput;

/**
* If `module_or_path` is {RequestInfo} or {URL}, makes a request and
* for everything else, calls `WebAssembly.instantiate` directly.
*
* @param {InitInput | Promise<InitInput>} module_or_path
*
* @returns {Promise<InitOutput>}
*/
export default function __wbg_init (module_or_path?: InitInput | Promise<InitInput>): Promise<InitOutput>;
