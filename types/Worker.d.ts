export = Worker;
declare function Worker(options: any): void;
declare class Worker {
    constructor(options: any);
    concurrency: any;
    timeout: any;
    queue: any[];
    count: number;
    start(thumbnailer: any): any;
    process(): void;
    exec(line: any, callback: any): any;
}
