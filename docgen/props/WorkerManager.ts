import { Worker } from "worker_threads";
import os from "os";
import EventEmitter from "events";

type ExtendedWorker = {
  worker: Worker;
  isFree: boolean;
};

export default class WorkerManager extends EventEmitter {
  private workerPath: string;
  private maxWorkers: number;
  private workers: ExtendedWorker[];
  private taskQueue: any[];
  private types: Record<string, string>;

  constructor(workerPath: string) {
    super();
    this.workerPath = workerPath;
    const availableWorkers = os.cpus().length;
    this.maxWorkers = availableWorkers >= 6 ? availableWorkers - 2 : availableWorkers - 1;
    this.taskQueue = [];
    this.workers = this.initializeWorkers();
    this.types = {};
  }

  get hasActiveTasks() {
    return this.workers.some((worker) => !worker.isFree);
  }

  private initializeWorkers(): ExtendedWorker[] {
    const workers = [];

    for (let i = 0; i < this.maxWorkers; i++) {
      const worker = new Worker(this.workerPath);
      const extWorker: ExtendedWorker = {
        worker,
        isFree: true,
      };

      worker.on("message", (message) => {
        if (message.event === "finished") {
          this.addToTypes(message.types);
          extWorker.isFree = true;

          this.assignNextTask(extWorker);

          this.checkIfFinished();
        }
      });

      workers.push(extWorker);
    }

    return workers;
  }

  private checkIfFinished() {
    if (!this.hasActiveTasks) {
      this.emit("finished", this.types);
      this.workers.forEach((worker) => worker.worker.terminate());
    }
  }

  private addToTypes(newTypes: Record<string, string>) {
    Object.assign(this.types, newTypes);
  }

  private assignTaskToWorker(worker: ExtendedWorker, task: any) {
    worker.isFree = false;
    worker.worker.postMessage(task);
  }

  private assignNextTask(worker: ExtendedWorker) {
    if (this.taskQueue.length > 0) {
      const nextTask = this.taskQueue.shift();
      this.assignTaskToWorker(worker, nextTask);
    } else {
      worker.worker.terminate();
    }
  }

  public addTask(task: any) {
    const freeWorker = this.workers.find((w) => w.isFree);

    if (freeWorker) {
      this.assignTaskToWorker(freeWorker, task);
    } else {
      this.taskQueue.push(task);
    }
  }
}
