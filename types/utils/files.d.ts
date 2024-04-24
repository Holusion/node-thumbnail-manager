export function getHash(input: any): string;
/**
 * Will prepend file:// to the file name if necessary.
 * @param  {[type]} input [description]
 * @return {[type]}       [description]
 */
export function getUri(input: [type]): [type];
/**
 *
 * @param {string} dir the directory to be searched
 * @param {string} file the source file
 * @returns
 */
export function exists(dir: string, file: string): Promise<any>;
export function getMtime(file: any): Promise<any>;
export function validate(source: any, thumb: any): Promise<boolean>;
export function list(dir: any): Promise<any>;
