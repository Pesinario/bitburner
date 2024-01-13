export const PORTS_BY_NAME = [null, 'REBOOT', 'RAM_TOTAL', 'RAM_AVAIL', 'GHW', 'JIT_SIZE', 'JIT_TARGET'];
export const PORT_REBOOT = PORTS_BY_NAME.findIndex(x => x === 'REBOOT');
export const PORT_RAM_TOTAL = PORTS_BY_NAME.findIndex(x => x === 'RAM_TOTAL');
export const PORT_RAM_AVAIL = PORTS_BY_NAME.findIndex(x => x === 'RAM_AVAIL');
export const PORT_GHW = PORTS_BY_NAME.findIndex(x => x === 'GHW');
export const PORT_JIT_SIZE = PORTS_BY_NAME.findIndex(x => x === 'JIT_SIZE');
export const PORT_JIT_TARGET = PORTS_BY_NAME.findIndex(x => x === 'JIT_TARGET');

export const SEPARATOR = '█';
//export const PATIENCE = Infinity;
export const PATIENCE = 1000 * 60 * 2;
export const GREED = 0.25;
export const RESERVE = 0.5;
export const GHW_PAYLOADS = ['lite/grow_once.js', 'lite/hack_once.js', 'lite/weaken_once.js', 'lite/hack_retry.js',];
