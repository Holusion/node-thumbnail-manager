export = Thumbnailer;
declare class Thumbnailer {
    /**
     *
     * @param {object} args
     * @param {string} [args.dir="~/.cache/thumbnails"]
     * @param {number} [args.threads]
     * @param {number} [args.timeout]
     */
    constructor({ dir, threads, timeout }?: {
        dir?: string;
        threads?: number;
        timeout?: number;
    });
    dirP: Promise<any>;
    finder: any;
    worker: Worker;
    /**
     * Request a thumbnail file.
     * @param  {string}   file     absolute path to the file
     * @param  {number}   [size]     *optionnal* desired thumbnail size. Default : 128
     * @return {Promise<string>} absolute path to the thumbnail file
     */
    request(file: string, size?: number): Promise<string>;
    /**
     *
     * @param {string} file
     * @param {number} size
     */
    find(file: string, size: number): Promise<any>;
    create(file: any, size: any): Promise<any>;
    /**
     *
     * @param {object} param0
     * @param {number} [param0.count=0] use a number >0 to limit max number of cleaned thumbnails
     * @returns
     */
    clean({ count }?: {
        count?: number;
    }): Promise<any>;
}
import Worker = require("./Worker");
